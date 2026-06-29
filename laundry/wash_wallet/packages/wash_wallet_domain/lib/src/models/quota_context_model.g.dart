// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quota_context_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$QuotaContextModelImpl _$$QuotaContextModelImplFromJson(
  Map<String, dynamic> json,
) => _$QuotaContextModelImpl(
  laundryServiceId: (json['laundryServiceId'] as num).toInt(),
  laundryServiceName: json['laundryServiceName'] as String,
  unit: json['unit'] as String,
  totalQuota: (json['totalQuota'] as num).toDouble(),
  remainingQuota: (json['remainingQuota'] as num).toDouble(),
);

Map<String, dynamic> _$$QuotaContextModelImplToJson(
  _$QuotaContextModelImpl instance,
) => <String, dynamic>{
  'laundryServiceId': instance.laundryServiceId,
  'laundryServiceName': instance.laundryServiceName,
  'unit': instance.unit,
  'totalQuota': instance.totalQuota,
  'remainingQuota': instance.remainingQuota,
};
