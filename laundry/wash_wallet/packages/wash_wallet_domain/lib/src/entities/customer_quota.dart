import 'package:equatable/equatable.dart';

class CustomerQuota extends Equatable {
  final int id;
  final int customerSubscriptionId;
  final int laundryServiceId;
  final String? laundryServiceName;
  final String? unit;
  final double totalQuota;
  final double remainingQuota;

  const CustomerQuota({
    required this.id,
    required this.customerSubscriptionId,
    required this.laundryServiceId,
    this.laundryServiceName,
    this.unit,
    required this.totalQuota,
    required this.remainingQuota,
  });

  factory CustomerQuota.fromModel(dynamic model) {
    return CustomerQuota(
      id: model.id,
      customerSubscriptionId: model.customerSubscriptionId,
      laundryServiceId: model.laundryServiceId,
      laundryServiceName: model.laundryServiceName,
      unit: model.unit,
      totalQuota: model.totalQuota,
      remainingQuota: model.remainingQuota,
    );
  }

  @override
  List<Object?> get props => [
    id,
    customerSubscriptionId,
    laundryServiceId,
    laundryServiceName,
    unit,
    totalQuota,
    remainingQuota,
  ];
}
