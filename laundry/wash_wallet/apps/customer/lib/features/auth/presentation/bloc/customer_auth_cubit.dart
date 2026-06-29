import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/update_usecase.dart';
import 'customer_auth_state.dart';

class CustomerAuthCubit extends Cubit<CustomerAuthState> {
  final CheckCustomerAuthStatusUsecase _checkAuthStatus;
  final RequestOtpUsecase _requestOtp;
  final VerifyOtpUsecase _verifyOtp;
  final RegisterUsecase _register;
  final LoginWithPasswordUsecase _loginWithPassword;
  final CustomerLogoutUsecase _logout;
  final UpdateUsecase? _updateUsecase;
  final SetPasswordUsecase? _setPassword;
  final UpdateProfileUsecase? _updateProfile;

  CustomerAuthCubit({
    required CheckCustomerAuthStatusUsecase checkAuthStatus,
    required RequestOtpUsecase requestOtp,
    required VerifyOtpUsecase verifyOtp,
    required RegisterUsecase register,
    required LoginWithPasswordUsecase loginWithPassword,
    required CustomerLogoutUsecase logout,
    UpdateUsecase? updateUsecase,
    SetPasswordUsecase? setPassword,
    UpdateProfileUsecase? updateProfile,
  }) : _checkAuthStatus = checkAuthStatus,
       _requestOtp = requestOtp,
       _verifyOtp = verifyOtp,
       _register = register,
       _loginWithPassword = loginWithPassword,
       _logout = logout,
       _updateUsecase = updateUsecase,
       _setPassword = setPassword,
       _updateProfile = updateProfile,
       super(CustomerAuthInitial());

  Future<void> _update() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null && _updateUsecase != null) {
        await _updateUsecase(token);
      }
    } catch (_) {
      return;
    }
  }

  Future<void> checkAuthStatus() async {
    emit(CustomerAuthLoading());

    final result = await _checkAuthStatus();

    result.when(
      success: (customer) {
        emit(CustomerAuthAuthenticated(customer));
        _update();
      },
      failure: (failure) => emit(CustomerAuthUnauthenticated()),
    );
  }

  Future<void> requestOtp(String phone, {String intent = 'login'}) async {
    emit(CustomerAuthLoading());

    final result = await _requestOtp(phone, intent: intent);

    result.when(
      success: (hasPassword) => emit(
        CustomerAuthOtpRequested(
          phone,
          intent: intent,
          hasPassword: hasPassword,
        ),
      ),
      failure: (failure) {
        emit(CustomerAuthError(failure.message));
        emit(CustomerAuthUnauthenticated());
      },
    );
  }

  Future<void> verifyOtp(
    String phone,
    String otp, {
    String intent = 'login',
  }) async {
    emit(CustomerAuthLoading());

    final result = await _verifyOtp(phone: phone, otp: otp);

    result.when(
      success: (customer) {
        emit(CustomerAuthAuthenticated(customer));
        _update();
      },
      failure: (failure) {
        if (failure is PendingRegistrationFailure) {
          emit(CustomerAuthOtpVerifiedNewUser(failure.phone));
          return;
        }

        emit(CustomerAuthError(failure.message));
        emit(CustomerAuthOtpRequested(phone, intent: intent));
      },
    );
  }

  Future<void> register({
    required String phone,
    required String name,
    String? email,
    String? gender,
    String? password,
    String? dateOfBirth,
  }) async {
    emit(CustomerAuthLoading());

    final result = await _register(
      phone: phone,
      name: name,
      email: email,
      gender: gender,
      password: password,
      dateOfBirth: dateOfBirth,
    );

    result.when(
      success: (customer) {
        emit(CustomerAuthAuthenticated(customer));
        _update();
      },
      failure: (failure) {
        emit(CustomerAuthError(failure.message));
        emit(CustomerAuthOtpVerifiedNewUser(phone));
      },
    );
  }

  Future<void> loginWithPassword({
    required String phone,
    required String password,
  }) async {
    emit(CustomerAuthLoading());

    final result = await _loginWithPassword(phone: phone, password: password);

    result.when(
      success: (customer) {
        emit(CustomerAuthAuthenticated(customer));
        _update();
      },
      failure: (failure) {
        emit(CustomerAuthError(failure.message));
        emit(CustomerAuthUnauthenticated());
      },
    );
  }

  Future<void> logout() async {
    emit(CustomerAuthLoading());

    final result = await _logout();

    result.when(
      success: (_) => emit(CustomerAuthUnauthenticated()),
      failure: (failure) => emit(CustomerAuthUnauthenticated()),
    );
  }

  Future<void> setPassword({
    required String password,
    required String passwordConfirmation,
  }) async {
    final usecase = _setPassword;
    if (usecase == null) return;

    final currentState = state;
    if (currentState is! CustomerAuthAuthenticated) return;

    emit(CustomerAuthLoading());

    final result = await usecase(
      SetPasswordParams(
        password: password,
        passwordConfirmation: passwordConfirmation,
      ),
    );

    result.when(
      success: (customer) => emit(CustomerAuthAuthenticated(customer)),
      failure: (failure) {
        emit(CustomerAuthError(failure.message));
        emit(currentState);
      },
    );
  }

  Future<void> updateProfile({
    required String name,
    String? email,
    String? gender,
    String? dateOfBirth,
  }) async {
    final usecase = _updateProfile;
    if (usecase == null) return;

    final currentState = state;
    if (currentState is! CustomerAuthAuthenticated) return;

    emit(CustomerAuthLoading());

    final result = await usecase(
      UpdateProfileParams(
        name: name,
        email: email,
        gender: gender,
        dateOfBirth: dateOfBirth,
      ),
    );

    result.when(
      success: (customer) => emit(CustomerAuthAuthenticated(customer)),
      failure: (failure) {
        emit(CustomerAuthError(failure.message));
        emit(currentState);
      },
    );
  }
}
