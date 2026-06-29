// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'process_queue_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ProcessQueueModelImpl _$$ProcessQueueModelImplFromJson(
  Map<String, dynamic> json,
) => _$ProcessQueueModelImpl(
  processId: (json['processId'] as num).toInt(),
  processName: json['processName'] as String,
  totalOrders: (json['totalOrders'] as num).toInt(),
);

Map<String, dynamic> _$$ProcessQueueModelImplToJson(
  _$ProcessQueueModelImpl instance,
) => <String, dynamic>{
  'processId': instance.processId,
  'processName': instance.processName,
  'totalOrders': instance.totalOrders,
};
