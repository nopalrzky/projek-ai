import 'package:equatable/equatable.dart';

class ScheduleDeliveryParams extends Equatable {
  final int orderId;
  final int courierScheduleId;
  final DateTime deliveryDate;
  final String? deliveryAddress;

  const ScheduleDeliveryParams({
    required this.orderId,
    required this.courierScheduleId,
    required this.deliveryDate,
    this.deliveryAddress,
  });

  Map<String, dynamic> toJson() {
    return {
      'courierScheduleId': courierScheduleId,
      'deliveryDate': deliveryDate.toIso8601String().split('T')[0],
      'deliveryAddress': deliveryAddress,
    };
  }

  @override
  List<Object?> get props => [orderId, courierScheduleId, deliveryDate, deliveryAddress];
}
