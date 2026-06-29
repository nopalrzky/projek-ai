// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'home_summary_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$HomeSummaryModelImpl _$$HomeSummaryModelImplFromJson(
  Map<String, dynamic> json,
) => _$HomeSummaryModelImpl(
  ordersToday: (json['ordersToday'] as num).toInt(),
  ordersInProgress: (json['ordersInProgress'] as num).toInt(),
  ordersReadyForPickup: (json['ordersReadyForPickup'] as num).toInt(),
  ordersCompleted: (json['ordersCompleted'] as num).toInt(),
);

Map<String, dynamic> _$$HomeSummaryModelImplToJson(
  _$HomeSummaryModelImpl instance,
) => <String, dynamic>{
  'ordersToday': instance.ordersToday,
  'ordersInProgress': instance.ordersInProgress,
  'ordersReadyForPickup': instance.ordersReadyForPickup,
  'ordersCompleted': instance.ordersCompleted,
};
