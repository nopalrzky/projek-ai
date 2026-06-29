// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'weekly_hours_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WeeklyHoursModelImpl _$$WeeklyHoursModelImplFromJson(
  Map<String, dynamic> json,
) => _$WeeklyHoursModelImpl(
  day: json['day'] as String,
  dayLabel: json['dayLabel'] as String,
  isClosed: json['isClosed'] as bool,
  timeRanges:
      (json['timeRanges'] as List<dynamic>?)
          ?.map((e) => TimeRangeModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$$WeeklyHoursModelImplToJson(
  _$WeeklyHoursModelImpl instance,
) => <String, dynamic>{
  'day': instance.day,
  'dayLabel': instance.dayLabel,
  'isClosed': instance.isClosed,
  'timeRanges': instance.timeRanges,
};
