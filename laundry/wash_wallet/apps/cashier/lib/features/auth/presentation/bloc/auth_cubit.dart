import 'dart:async';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_cashier/core/services/notification_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_data/wash_wallet_data.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/register_fcm_token_usecase.dart';
import '../../domain/usecases/remove_fcm_token_usecase.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final LoginUsecase _loginUsecase;
  final LogoutUsecase _logoutUsecase;
  final GetMeUsecase _getMeUsecase;
  final CheckAuthStatusUsecase _checkAuthStatusUsecase;
  final SetupPinUseCase _setupPinUseCase;
  final VerifyPinUseCase _verifyPinUseCase;
  final ResetPinUseCase _resetPinUseCase;
  final SaveRememberedAccountUsecase _saveRememberedAccountUsecase;
  final RegisterFcmTokenUsecase _registerFcmTokenUsecase;
  final RemoveFcmTokenUsecase _removeFcmTokenUsecase;
  final NotificationService _notificationService;
  String? _registeredFcmToken;
  
  static const _lastActivityKey = 'last_activity_at';
  DateTime? _lastActivityAt;
  static const _staleThreshold = Duration(hours: 4);
  final DateTime Function() _getCurrentTime;

  AuthCubit({
    required LoginUsecase loginUsecase,
    required LogoutUsecase logoutUsecase,
    required GetMeUsecase getMeUsecase,
    required CheckAuthStatusUsecase checkAuthStatusUsecase,
    required SetupPinUseCase setupPinUseCase,
    required VerifyPinUseCase verifyPinUseCase,
    required ResetPinUseCase resetPinUseCase,
    required SaveRememberedAccountUsecase saveRememberedAccountUsecase,
    required RegisterFcmTokenUsecase registerFcmTokenUsecase,
    required RemoveFcmTokenUsecase removeFcmTokenUsecase,
    required NotificationService notificationService,
    DateTime Function()? getCurrentTime,
  }) : _loginUsecase = loginUsecase,
       _logoutUsecase = logoutUsecase,
       _getMeUsecase = getMeUsecase,
       _checkAuthStatusUsecase = checkAuthStatusUsecase,
       _setupPinUseCase = setupPinUseCase,
       _verifyPinUseCase = verifyPinUseCase,
       _resetPinUseCase = resetPinUseCase,
       _saveRememberedAccountUsecase = saveRememberedAccountUsecase,
       _registerFcmTokenUsecase = registerFcmTokenUsecase,
       _removeFcmTokenUsecase = removeFcmTokenUsecase,
       _notificationService = notificationService,
       _getCurrentTime = getCurrentTime ?? (() => DateTime.now()),
       super(const AuthInitial());

  void _handleAuthSuccess(AuthEmployee employee, {bool checkRemember = false, bool isStale = false}) async {
    if (!employee.hasOrderViewPermission) {
      emit(AuthAccessDenied(employee));
      return;
    }
    
    if (!employee.hasPin) {
      emit(AuthSetupPinRequired(employee));
      return;
    }

    bool shouldPrompt = false;
    if (checkRemember) {
      final prefs = await SharedPreferences.getInstance();
      final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
      final accounts = await ds.getAccounts();
      shouldPrompt = !accounts.any((a) => a.employeeId == employee.id);
    }

    if (isStale) {
      emit(AuthenticatedStale(employee));
    } else {
      emit(Authenticated(employee, shouldPromptRemember: shouldPrompt));
      unawaited(_startNotificationSession(employee));
    }
  }

  Future<void> checkAuthStatus() async {
    emit(const AuthLoading());

    final result = await _checkAuthStatusUsecase();

    result.when(
      success: (employee) async {
        await _loadLastActivity();
        bool isStale = false;
        if (_lastActivityAt != null) {
          final elapsed = _getCurrentTime().difference(_lastActivityAt!);
          if (elapsed >= _staleThreshold) {
            isStale = true;
          }
        }
        _handleAuthSuccess(employee, isStale: isStale);
      },
      failure: (failure) async {
        final prefs = await SharedPreferences.getInstance();
        final onboardingService = OnboardingService(prefs);
        if (!onboardingService.isCompleted()) {
          emit(const AuthRequiresOnboarding());
          return;
        }
        final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
        final accounts = await ds.getAccounts();
        if (accounts.isNotEmpty) {
          emit(const AuthRequiresSwitchEmployee());
        } else {
          emit(const Unauthenticated());
        }
      },
    );
  }
  Future<void> completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    final onboardingService = OnboardingService(prefs);
    await onboardingService.complete();

    final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
    final accounts = await ds.getAccounts();
    if (accounts.isNotEmpty) {
      emit(const AuthRequiresSwitchEmployee());
    } else {
      emit(const Unauthenticated());
    }
  }

  Future<void> recordActivity() async {
    final now = _getCurrentTime();
    _lastActivityAt = now;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastActivityKey, now.toIso8601String());
  }

  Future<void> _loadLastActivity() async {
    final prefs = await SharedPreferences.getInstance();
    final dateStr = prefs.getString(_lastActivityKey);
    if (dateStr != null) {
      _lastActivityAt = DateTime.tryParse(dateStr);
    }
  }

  void checkIfStale() async {
    final currentState = state;
    if (currentState is! Authenticated) return;
    
    await _loadLastActivity();
    if (_lastActivityAt == null) return;

    final elapsed = _getCurrentTime().difference(_lastActivityAt!);
    if (elapsed >= _staleThreshold) {
      emit(AuthenticatedStale(currentState.employee));
    }
  }

  Future<void> login({
    required String username,
    required String password,
  }) async {
    emit(const AuthLoading());

    final result = await _loginUsecase(username: username, password: password);

    result.when(
      success: (employee) {
        _handleAuthSuccess(employee, checkRemember: true);
      },
      failure: (failure) => emit(AuthFailureState(failure)),
    );
  }

  Future<void> setupPin({
    required String pin,
    required String pinConfirmation,
  }) async {
    emit(const AuthLoading());

    final result = await _setupPinUseCase(
      SetupPinParams(pin: pin, pinConfirmation: pinConfirmation),
    );

    result.when(
      success: (employee) {
        _handleAuthSuccess(employee, checkRemember: true);
      },
      failure: (failure) => emit(AuthFailureState(failure)),
    );
  }

  Future<void> resetPin({
    required String currentPin,
    required String pin,
    required String pinConfirmation,
  }) async {
    emit(const PinResetVerifying());

    final result = await _resetPinUseCase(
      ResetPinParams(
        currentPin: currentPin,
        pin: pin,
        pinConfirmation: pinConfirmation,
      ),
    );

    result.when(
      success: (employee) {
        emit(PinResetSuccess(employee));
        _handleAuthSuccess(employee);
      },
      failure: (failure) => emit(AuthFailureState(failure)),
    );
  }

  Future<void> verifyPin({
    int? employeeId,
    String? username,
    required String pin,
  }) async {
    emit(const AuthLoading());

    final result = await _verifyPinUseCase(
      VerifyPinParams(employeeId: employeeId, username: username, pin: pin),
    );

    result.when(
      success: (employee) {
        _handleAuthSuccess(employee);
      },
      failure: (failure) => emit(AuthFailureState(failure)),
    );
  }

  Future<void> switchEmployee({
    int? targetEmployeeId,
    String? targetUsername,
    required String pin,
  }) async {
    final currentEmployee = (state is Authenticated)
        ? (state as Authenticated).employee
        : null;

    if (currentEmployee == null) {
      await verifyPin(employeeId: targetEmployeeId, username: targetUsername, pin: pin);
      return;
    }

    emit(SwitchPinVerifying(
      previousEmployee: currentEmployee,
      targetEmployeeId: targetEmployeeId,
      targetUsername: targetUsername,
    ));

    final result = await _verifyPinUseCase(
      VerifyPinParams(employeeId: targetEmployeeId, username: targetUsername, pin: pin),
    );

    result.when(
      success: (employee) {
        if (currentEmployee.id != employee.id) {
          _stopNotificationSession().then((_) {
            _handleAuthSuccess(employee);
          });
        } else {
          _handleAuthSuccess(employee);
        }
      },
      failure: (failure) => emit(SwitchPinFailure(
        previousEmployee: currentEmployee,
        failure: failure,
      )),
    );
  }

  Future<void> logout() async {
    emit(const AuthLoading());

    await _stopNotificationSession();

    final result = await _logoutUsecase();

    result.when(
      success: (_) => emit(const Unauthenticated()),
      failure: (failure) => emit(const Unauthenticated()),
    );
  }

  Future<void> refreshMe() async {
    final result = await _getMeUsecase();

    result.when(
      success: (employee) {
        _handleAuthSuccess(employee);
      },
      failure: (failure) => emit(const Unauthenticated()),
    );
  }

  Future<void> rememberCurrentEmployee() async {
    final currentState = state;
    if (currentState is! Authenticated) return;

    await _saveRememberedAccountUsecase(currentState.employee);
    // Emit ulang state dengan shouldPromptRemember: false agar prompt hilang
    emit(Authenticated(currentState.employee, shouldPromptRemember: false));
  }

  Future<void> _startNotificationSession(AuthEmployee employee) async {
    try {
      await _notificationService.requestPermission();

      final deviceId = await _notificationService.getDeviceId();
      final token = await _notificationService.getFcmToken();
      if (token != null && token.isNotEmpty) {
        await _registerFcmTokenUsecase(
          token: token,
          deviceId: deviceId,
          deviceName: 'cashier-${employee.id}',
        );
        _registeredFcmToken = token;
      }

      _notificationService.registerTokenRefresh((newToken) {
        unawaited(
          _registerFcmTokenUsecase(
            token: newToken,
            deviceId: deviceId,
            deviceName: 'cashier-${employee.id}',
          ),
        );
        _registeredFcmToken = newToken;
      });

      await _notificationService.connectPusher(outletId: employee.outletId);
    } catch (_) {}
  }

  Future<void> _stopNotificationSession() async {
    try {
      final token =
          _registeredFcmToken ?? await _notificationService.getFcmToken();
      if (token != null && token.isNotEmpty) {
        await _removeFcmTokenUsecase(token);
      }
    } catch (_) {}

    _registeredFcmToken = null;
    _notificationService.clearBadge();
    await _notificationService.disconnectPusher();
  }
}
