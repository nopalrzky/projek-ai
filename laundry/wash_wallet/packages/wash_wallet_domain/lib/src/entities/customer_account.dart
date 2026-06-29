import 'package:equatable/equatable.dart';

class CustomerAccount extends Equatable {
  final int id;
  final String phone;
  final String name;
  final String? email;
  final String? gender;
  final String? avatar;
  final String? dateOfBirth;
  final bool isVerified;
  final bool isActive;
  final String? lastLoginAt;
  final String? fcmToken;
  final int depositBalance;
  final bool? hasPassword;

  const CustomerAccount({
    required this.id,
    required this.phone,
    required this.name,
    this.email,
    this.gender,
    this.avatar,
    this.dateOfBirth,
    required this.isVerified,
    required this.isActive,
    this.lastLoginAt,
    this.fcmToken,
    this.depositBalance = 0,
    this.hasPassword,
  });

  @override
  List<Object?> get props => [
    id,
    phone,
    name,
    email,
    gender,
    avatar,
    dateOfBirth,
    isVerified,
    isActive,
    lastLoginAt,
    fcmToken,
    depositBalance,
    hasPassword,
  ];
}
