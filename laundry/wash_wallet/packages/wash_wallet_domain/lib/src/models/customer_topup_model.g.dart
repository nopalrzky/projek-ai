// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_topup_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CustomerTopupModelImpl _$$CustomerTopupModelImplFromJson(
  Map<String, dynamic> json,
) => _$CustomerTopupModelImpl(
  id: (json['id'] as num).toInt(),
  customerAccountId: (json['customer_account_id'] as num).toInt(),
  amount: (json['amount'] as num).toInt(),
  status: json['status'] as String,
  paymentStatus: json['payment_status'] as String,
  paymentMethod: json['payment_method'] as String,
  paymentProvider: json['payment_provider'] as String,
  paymentData: json['payment_data'] as Map<String, dynamic>?,
  midtransOrderId: json['midtrans_order_id'] as String?,
  expiredAt: json['expired_at'] == null
      ? null
      : DateTime.parse(json['expired_at'] as String),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  updatedAt: json['updated_at'] == null
      ? null
      : DateTime.parse(json['updated_at'] as String),
);

Map<String, dynamic> _$$CustomerTopupModelImplToJson(
  _$CustomerTopupModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'customer_account_id': instance.customerAccountId,
  'amount': instance.amount,
  'status': instance.status,
  'payment_status': instance.paymentStatus,
  'payment_method': instance.paymentMethod,
  'payment_provider': instance.paymentProvider,
  'payment_data': instance.paymentData,
  'midtrans_order_id': instance.midtransOrderId,
  'expired_at': instance.expiredAt?.toIso8601String(),
  'created_at': instance.createdAt?.toIso8601String(),
  'updated_at': instance.updatedAt?.toIso8601String(),
};
