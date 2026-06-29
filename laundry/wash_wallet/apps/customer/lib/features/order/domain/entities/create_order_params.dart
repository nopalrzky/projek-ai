import 'package:equatable/equatable.dart';

class CreateOrderParams extends Equatable {
  final int customerAccountId;
  final int outletId;
  final String? paymentMethod;
  final String pickupType;
  final String? notes;
  final int? customerAddressId;
  final int? pickupScheduleId;
  final String? pickupDate;
  final String deliveryType;
  final List<OrderItemParam> orderItems;

  const CreateOrderParams({
    required this.customerAccountId,
    required this.outletId,
    this.paymentMethod,
    required this.pickupType,
    this.notes,
    this.customerAddressId,
    this.pickupScheduleId,
    this.pickupDate,
    this.deliveryType = 'delivery',
    required this.orderItems,
  });

  Map<String, dynamic> toJson() {
    return {
      'customerAccountId': customerAccountId,
      'outletId': outletId,
      if (paymentMethod != null) 'paymentMethod': paymentMethod,
      'pickupType': pickupType,
      'notes': notes,
      'customerAddressId': customerAddressId,
      'pickupScheduleId': pickupScheduleId,
      'pickupDate': pickupDate,
      'deliveryType': deliveryType,
      'orderItems': orderItems.map((e) => e.toJson()).toList(),
    };
  }

  @override
  List<Object?> get props => [
    customerAccountId,
    outletId,
    paymentMethod,
    pickupType,
    notes,
    customerAddressId,
    pickupScheduleId,
    pickupDate,
    deliveryType,
    orderItems,
  ];
}

class OrderItemParam extends Equatable {
  final int laundryServiceId;

  const OrderItemParam({required this.laundryServiceId});

  Map<String, dynamic> toJson() {
    return {'laundryServiceId': laundryServiceId};
  }

  @override
  List<Object?> get props => [laundryServiceId];
}
