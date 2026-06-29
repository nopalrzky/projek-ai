// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'priority_order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PriorityOrderModelImpl _$$PriorityOrderModelImplFromJson(
  Map<String, dynamic> json,
) => _$PriorityOrderModelImpl(
  orderId: (json['orderId'] as num).toInt(),
  invoice: json['invoice'] as String,
  customerName: json['customerName'] as String,
  status: json['status'] as String,
  deadline: json['deadline'] as String?,
);

Map<String, dynamic> _$$PriorityOrderModelImplToJson(
  _$PriorityOrderModelImpl instance,
) => <String, dynamic>{
  'orderId': instance.orderId,
  'invoice': instance.invoice,
  'customerName': instance.customerName,
  'status': instance.status,
  'deadline': instance.deadline,
};
