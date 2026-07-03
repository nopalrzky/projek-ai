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
  final bool shouldPromptRemember;

  const Authenticated(this.employee, {this.shouldPromptRemember = false});

  @override
  List<Object?> get props => [employee, shouldPromptRemember];
}

class Unauthenticated extends AuthState {
  const Unauthenticated();
}

class AuthRequiresOnboarding extends AuthState {
  const AuthRequiresOnboarding();
}

class AuthRequiresSwitchEmployee extends AuthState {
  const AuthRequiresSwitchEmployee();
}

class AuthFailureState extends AuthState {
  final Failure failure;

  const AuthFailureState(this.failure);

  @override
  List<Object?> get props => [failure];
}

class AuthSetupPinRequired extends AuthState {
  final AuthEmployee employee;

  const AuthSetupPinRequired(this.employee);

  @override
  List<Object?> get props => [employee];
}

class AuthPinSetupPrompt extends AuthState {
  final AuthEmployee employee;

  const AuthPinSetupPrompt(this.employee);

  @override
  List<Object?> get props => [employee];
}

class AuthAccessDenied extends AuthState {
  final AuthEmployee employee;

  const AuthAccessDenied(this.employee);

  @override
  List<Object?> get props => [employee];
}

class SwitchPinVerifying extends AuthState {
  final AuthEmployee previousEmployee;
  final int? targetEmployeeId;
  final String? targetUsername;

  const SwitchPinVerifying({
    required this.previousEmployee,
    this.targetEmployeeId,
    this.targetUsername,
  });

  @override
  List<Object?> get props => [
    previousEmployee,
    targetEmployeeId,
    targetUsername,
  ];
}

class SwitchPinFailure extends AuthState {
  final AuthEmployee previousEmployee;
  final Failure failure;

  const SwitchPinFailure({
    required this.previousEmployee,
    required this.failure,
  });

  @override
  List<Object?> get props => [previousEmployee, failure];
}

class AuthenticatedStale extends AuthState {
  final AuthEmployee employee;
  const AuthenticatedStale(this.employee);
  @override
  List<Object?> get props => [employee];
}

class PinResetVerifying extends AuthState {
  const PinResetVerifying();
}

class PinResetSuccess extends AuthState {
  final AuthEmployee employee;
  const PinResetSuccess(this.employee);

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
