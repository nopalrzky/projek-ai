import 'package:equatable/equatable.dart';

class PriorityOrder extends Equatable {
  final int orderId;
  final String invoice;
  final String customerName;
  final String status;
  final String? deadline;

  const PriorityOrder({
    required this.orderId,
    required this.invoice,
    required this.customerName,
    required this.status,
    this.deadline,
  });

  @override
  List<Object?> get props => [orderId, invoice, customerName, status, deadline];
}
