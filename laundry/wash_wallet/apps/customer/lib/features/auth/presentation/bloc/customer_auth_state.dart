import 'package:equatable/equatable.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class CustomerAuthState extends Equatable {
  const CustomerAuthState();

  @override
  List<Object?> get props => [];
}

class CustomerAuthInitial extends CustomerAuthState {}

class CustomerAuthLoading extends CustomerAuthState {}

class CustomerAuthUnauthenticated extends CustomerAuthState {}

class CustomerAuthOtpRequested extends CustomerAuthState {
  final String phone;
  final String intent;
  final bool hasPassword;

  const CustomerAuthOtpRequested(
    this.phone, {
    this.intent = 'login',
    this.hasPassword = false,
  });

  @override
  List<Object?> get props => [phone, intent, hasPassword];
}

class CustomerAuthOtpVerifiedNewUser extends CustomerAuthState {
  final String phone;

  const CustomerAuthOtpVerifiedNewUser(this.phone);

  @override
  List<Object?> get props => [phone];
}

class CustomerAuthAuthenticated extends CustomerAuthState {
  final CustomerAccount customer;

  const CustomerAuthAuthenticated(this.customer);

  @override
  List<Object?> get props => [customer];
}

class CustomerAuthError extends CustomerAuthState {
  final String message;

  const CustomerAuthError(this.message);

  @override
  List<Object?> get props => [message];
}
