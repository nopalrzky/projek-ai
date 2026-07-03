import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../../../core/services/production_notification_service.dart';
import '../../../../core/utils/permission_checker.dart';
import '../../data/datasources/fcm_token_datasource.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final LoginUsecase _loginUsecase;
  final LogoutUsecase _logoutUsecase;
  final GetMeUsecase _getMeUsecase;
  final CheckAuthStatusUsecase _checkAuthStatusUsecase;
  final SetupPinUseCase _setupPinUseCase;
  final UpdateProfileUseCase _updateProfileUseCase;
  final ChangePasswordUseCase _changePasswordUseCase;
  final FcmTokenDatasource? _fcmTokenDatasource;
  bool _pinPromptSkippedThisSession = false;
  String? _registeredFcmToken;

  AuthCubit({
    required LoginUsecase loginUsecase,
    required LogoutUsecase logoutUsecase,
    required GetMeUsecase getMeUsecase,
    required CheckAuthStatusUsecase checkAuthStatusUsecase,
    required SetupPinUseCase setupPinUseCase,
    required UpdateProfileUseCase updateProfileUseCase,
    required ChangePasswordUseCase changePasswordUseCase,
    FcmTokenDatasource? fcmTokenDatasource,
  }) : _loginUsecase = loginUsecase,
       _logoutUsecase = logoutUsecase,
       _getMeUsecase = getMeUsecase,
       _checkAuthStatusUsecase = checkAuthStatusUsecase,
       _setupPinUseCase = setupPinUseCase,
       _updateProfileUseCase = updateProfileUseCase,
       _changePasswordUseCase = changePasswordUseCase,
       _fcmTokenDatasource = fcmTokenDatasource,
       super(const AuthInitial());

  Future<void> checkAuthStatus() async {
    emit(const AuthLoading());

    final result = await _checkAuthStatusUsecase();

    result.when(
      success: (employee) => _handleAuthSuccess(employee),
      failure: (failure) => emit(const Unauthenticated()),
    );
  }

  void _handleAuthSuccess(AuthEmployee employee) {
    if (!employee.hasPin && !_pinPromptSkippedThisSession) {
      emit(AuthPinSetupPrompt(employee));
      return;
    }

    emit(Authenticated(employee));
    _onAuthenticated(employee);
  }

  void skipPinSetup() {
    final currentState = state;
    if (currentState is! AuthPinSetupPrompt) return;

    _pinPromptSkippedThisSession = true;
    final employee = currentState.employee;

    emit(Authenticated(employee));
    _onAuthenticated(employee);
  }

  Future<void> login({
    required String username,
    required String password,
  }) async {
    emit(const AuthLoading());

    final result = await _loginUsecase(username: username, password: password);

    result.when(
      success: (employee) => _handleAuthSuccess(employee),
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
      success: (employee) => _handleAuthSuccess(employee),
      failure: (failure) => emit(AuthFailureState(failure)),
    );
  }

  Future<void> logout() async {
    _pinPromptSkippedThisSession = false;
    emit(const AuthLoading());
    await _onLogout();

    final result = await _logoutUsecase();

    result.when(
      success: (_) => emit(const Unauthenticated()),
      failure: (failure) => emit(const Unauthenticated()),
    );
  }

  Future<void> refreshMe() async {
    emit(const AuthLoading());

    final result = await _getMeUsecase();

    result.when(
      success: (employee) => _handleAuthSuccess(employee),
      failure: (failure) => emit(const Unauthenticated()),
    );
  }

  Future<void> updateProfile({
    required String name,
    String? email,
    String? phone,
    String? gender,
    String? address,
  }) async {
    emit(const ProfileUpdating());
    final result = await _updateProfileUseCase(
      name: name,
      email: email,
      phone: phone,
      gender: gender,
      address: address,
    );
    result.when(
      success: (employee) => emit(Authenticated(employee)),
      failure: (failure) => emit(ProfileUpdateFailure(failure.message)),
    );
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String newPasswordConfirmation,
  }) async {
    emit(const PasswordChanging());
    final result = await _changePasswordUseCase(
      currentPassword: currentPassword,
      newPassword: newPassword,
      newPasswordConfirmation: newPasswordConfirmation,
    );
    result.when(
      success: (_) => emit(const PasswordChangeSuccess()),
      failure: (failure) => emit(PasswordChangeFailure(failure.message)),
    );
  }

  Future<void> _onAuthenticated(AuthEmployee employee) async {
    final courierOutletIds = PermissionChecker.courierOutletIds(employee);
    ProductionNotificationService.instance.setCourierOutletIds(
      courierOutletIds,
    );

    try {
      await ProductionNotificationService.instance.requestPermission();
      final token = await ProductionNotificationService.instance.getFcmToken();
      if (token != null && token.isNotEmpty) {
        final deviceId = await ProductionNotificationService.instance
            .getDeviceId();
        await _fcmTokenDatasource?.registerToken(
          token: token,
          deviceId: deviceId,
          deviceName: 'Production App',
        );
        _registeredFcmToken = token;
      }

      ProductionNotificationService.instance.registerTokenRefresh((token) {
        _registeredFcmToken = token;
        _fcmTokenDatasource?.registerToken(
          token: token,
          deviceName: 'Production App',
        );
      });
    } catch (_) {}

    try {
      await ProductionNotificationService.instance.connectPusher(
        outletIds: courierOutletIds.toList(),
      );
    } catch (_) {}
  }

  Future<void> _onLogout() async {
    final token = _registeredFcmToken;
    if (token != null && token.isNotEmpty) {
      try {
        await _fcmTokenDatasource?.removeToken(token);
      } catch (_) {}
    }
    _registeredFcmToken = null;
    ProductionNotificationService.instance.setCourierOutletIds({});
    await ProductionNotificationService.instance.disconnectPusher();
  }
}
