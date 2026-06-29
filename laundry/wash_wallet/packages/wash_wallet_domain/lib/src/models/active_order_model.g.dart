// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'active_order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ActiveOrderModelImpl _$$ActiveOrderModelImplFromJson(
  Map<String, dynamic> json,
) => _$ActiveOrderModelImpl(
  orderId: (json['orderId'] as num).toInt(),
  invoice: json['invoice'] as String,
  customerName: json['customerName'] as String,
  serviceName: json['serviceName'] as String,
  quantity: json['quantity'] as String,
  currentProcess: json['currentProcess'] as String,
  startedAt: json['startedAt'] as String?,
);

Map<String, dynamic> _$$ActiveOrderModelImplToJson(
  _$ActiveOrderModelImpl instance,
) => <String, dynamic>{
  'orderId': instance.orderId,
  'invoice': instance.invoice,
  'customerName': instance.customerName,
  'serviceName': instance.serviceName,
  'quantity': instance.quantity,
  'currentProcess': instance.currentProcess,
  'startedAt': instance.startedAt,
};
