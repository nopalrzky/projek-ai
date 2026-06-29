// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'outlet_operational_status_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OutletOperationalStatusModelImpl _$$OutletOperationalStatusModelImplFromJson(
  Map<String, dynamic> json,
) => _$OutletOperationalStatusModelImpl(
  isOpenNow: json['isOpenNow'] as bool? ?? false,
  operationalStatus: json['operationalStatus'] as String? ?? 'hours_not_set',
  operationalStatusLabel:
      json['operationalStatusLabel'] as String? ??
      'Jam operasional belum tersedia',
  operationalStatusMessage:
      json['operationalStatusMessage'] as String? ??
      'Outlet belum dapat menerima order saat ini.',
  todayHours:
      (json['todayHours'] as List<dynamic>?)
          ?.map((e) => TimeRangeModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  weeklyHours:
      (json['weeklyHours'] as List<dynamic>?)
          ?.map((e) => WeeklyHoursModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  nextOpenAt: json['nextOpenAt'] as String?,
  nextCloseAt: json['nextCloseAt'] as String?,
  canCreateOrderNow: json['canCreateOrderNow'] as bool? ?? false,
  orderDisabledReason: json['orderDisabledReason'] as String?,
  timezone: json['timezone'] as String? ?? 'Asia/Jakarta',
);

Map<String, dynamic> _$$OutletOperationalStatusModelImplToJson(
  _$OutletOperationalStatusModelImpl instance,
) => <String, dynamic>{
  'isOpenNow': instance.isOpenNow,
  'operationalStatus': instance.operationalStatus,
  'operationalStatusLabel': instance.operationalStatusLabel,
  'operationalStatusMessage': instance.operationalStatusMessage,
  'todayHours': instance.todayHours,
  'weeklyHours': instance.weeklyHours,
  'nextOpenAt': instance.nextOpenAt,
  'nextCloseAt': instance.nextCloseAt,
  'canCreateOrderNow': instance.canCreateOrderNow,
  'orderDisabledReason': instance.orderDisabledReason,
  'timezone': instance.timezone,
};
