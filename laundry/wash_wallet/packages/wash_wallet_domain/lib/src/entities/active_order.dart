import 'package:equatable/equatable.dart';

class ActiveOrder extends Equatable {
  final int orderId;
  final String invoice;
  final String customerName;
  final String serviceName;
  final String quantity;
  final String currentProcess;
  final String? startedAt;

  const ActiveOrder({
    required this.orderId,
    required this.invoice,
    required this.customerName,
    required this.serviceName,
    required this.quantity,
    required this.currentProcess,
    this.startedAt,
  });

  factory ActiveOrder.fromModel(dynamic model) {
    return ActiveOrder(
      orderId: model.orderId,
      invoice: model.invoice,
      customerName: model.customerName,
      serviceName: model.serviceName,
      quantity: model.quantity,
      currentProcess: model.currentProcess,
      startedAt: model.startedAt,
    );
  }

  @override
  List<Object?> get props => [
    orderId,
    invoice,
    customerName,
    serviceName,
    quantity,
    currentProcess,
    startedAt,
  ];
}
