import 'package:equatable/equatable.dart';

class QuotaContext extends Equatable {
  final int laundryServiceId;
  final String laundryServiceName;
  final String unit;
  final double totalQuota;
  final double remainingQuota;

  const QuotaContext({
    required this.laundryServiceId,
    required this.laundryServiceName,
    required this.unit,
    required this.totalQuota,
    required this.remainingQuota,
  });

  factory QuotaContext.fromModel(dynamic model) {
    return QuotaContext(
      laundryServiceId: model.laundryServiceId,
      laundryServiceName: model.laundryServiceName,
      unit: model.unit,
      totalQuota: model.totalQuota,
      remainingQuota: model.remainingQuota,
    );
  }

  @override
  List<Object?> get props => [
    laundryServiceId,
    laundryServiceName,
    unit,
    totalQuota,
    remainingQuota,
  ];
}
