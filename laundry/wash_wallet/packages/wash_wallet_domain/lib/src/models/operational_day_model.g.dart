// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operational_day_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OperationalDayModelImpl _$$OperationalDayModelImplFromJson(
  Map<String, dynamic> json,
) => _$OperationalDayModelImpl(
  id: (json['id'] as num).toInt(),
  outletId: (json['outletId'] as num?)?.toInt(),
  dayOfWeek: json['dayOfWeek'] as String,
  openTime: json['openTime'] as String?,
  closeTime: json['closeTime'] as String?,
  isClosed: json['isClosed'] as bool? ?? false,
  isOpen: json['isOpen'] as bool? ?? false,
  dayLabel: json['dayLabel'] as String?,
);

Map<String, dynamic> _$$OperationalDayModelImplToJson(
  _$OperationalDayModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'outletId': instance.outletId,
  'dayOfWeek': instance.dayOfWeek,
  'openTime': instance.openTime,
  'closeTime': instance.closeTime,
  'isClosed': instance.isClosed,
  'isOpen': instance.isOpen,
  'dayLabel': instance.dayLabel,
};
