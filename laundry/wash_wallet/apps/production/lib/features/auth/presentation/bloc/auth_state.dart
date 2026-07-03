import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

sealed class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class Authenticated extends AuthState {
  final AuthEmployee employee;

  const Authenticated(this.employee);

  @override
  List<Object?> get props => [employee];
}

class Unauthenticated extends AuthState {
  const Unauthenticated();
}

class AuthFailureState extends AuthState {
  final Failure failure;

  const AuthFailureState(this.failure);

  @override
  List<Object?> get props => [failure];
}

class AuthPinSetupPrompt extends AuthState {
  final AuthEmployee employee;

  const AuthPinSetupPrompt(this.employee);

  @override
  List<Object?> get props => [employee];
}

class ProfileUpdating extends AuthState {
  const ProfileUpdating();
}

class ProfileUpdateFailure extends AuthState {
  final String message;
  const ProfileUpdateFailure(this.message);

  @override
  List<Object?> get props => [message];
}

class PasswordChanging extends AuthState {
  const PasswordChanging();
}

class PasswordChangeSuccess extends AuthState {
  const PasswordChangeSuccess();
}

class PasswordChangeFailure extends AuthState {
  final String message;
  const PasswordChangeFailure(this.message);

  @override
  List<Object?> get props => [message];
}
