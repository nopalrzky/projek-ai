// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_quota_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CustomerQuotaModelImpl _$$CustomerQuotaModelImplFromJson(
  Map<String, dynamic> json,
) => _$CustomerQuotaModelImpl(
  id: (json['id'] as num).toInt(),
  customerSubscriptionId: (json['customerSubscriptionId'] as num).toInt(),
  laundryServiceId: (json['laundryServiceId'] as num).toInt(),
  laundryServiceName: json['laundryServiceName'] as String?,
  unit: json['unit'] as String?,
  totalQuota: (json['totalQuota'] as num).toDouble(),
  remainingQuota: (json['remainingQuota'] as num).toDouble(),
);

Map<String, dynamic> _$$CustomerQuotaModelImplToJson(
  _$CustomerQuotaModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'customerSubscriptionId': instance.customerSubscriptionId,
  'laundryServiceId': instance.laundryServiceId,
  'laundryServiceName': instance.laundryServiceName,
  'unit': instance.unit,
  'totalQuota': instance.totalQuota,
  'remainingQuota': instance.remainingQuota,
};
