import 'package:equatable/equatable.dart';

class CustomerTopup extends Equatable {
  final int id;
  final int customerAccountId;
  final int amount;
  final String status;
  final String paymentStatus;
  final String paymentMethod;
  final String paymentProvider;
  final Map<String, dynamic>? paymentData;
  final String? midtransOrderId;
  final DateTime? expiredAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const CustomerTopup({
    required this.id,
    required this.customerAccountId,
    required this.amount,
    required this.status,
    required this.paymentStatus,
    required this.paymentMethod,
    required this.paymentProvider,
    this.paymentData,
    this.midtransOrderId,
    this.expiredAt,
    this.createdAt,
    this.updatedAt,
  });

  @override
  List<Object?> get props => [
        id,
        customerAccountId,
        amount,
        status,
        paymentStatus,
        paymentMethod,
        paymentProvider,
        paymentData,
        midtransOrderId,
        expiredAt,
        createdAt,
        updatedAt,
      ];
}
