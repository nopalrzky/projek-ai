// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_subscription_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CustomerSubscriptionModelImpl _$$CustomerSubscriptionModelImplFromJson(
  Map<String, dynamic> json,
) => _$CustomerSubscriptionModelImpl(
  id: (json['id'] as num).toInt(),
  customerId: (json['customerId'] as num).toInt(),
  servicePackageId: (json['servicePackageId'] as num).toInt(),
  subscriptionCode: json['subscriptionCode'] as String,
  pricePaid: (json['pricePaid'] as num).toDouble(),
  purchaseDate: json['purchaseDate'] == null
      ? null
      : DateTime.parse(json['purchaseDate'] as String),
  expiredAt: json['expiredAt'] == null
      ? null
      : DateTime.parse(json['expiredAt'] as String),
  status: json['status'] as String,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  remainingDays: (json['remainingDays'] as num?)?.toInt(),
  isUnlimited: json['isUnlimited'] as bool? ?? false,
  statusBadgeVariant: json['statusBadgeVariant'] as String? ?? 'secondary',
  statusLabel: json['statusLabel'] as String? ?? '',
  customer: json['customer'] == null
      ? null
      : CustomerModel.fromJson(json['customer'] as Map<String, dynamic>),
  servicePackage: json['servicePackage'] == null
      ? null
      : ServicePackageModel.fromJson(
          json['servicePackage'] as Map<String, dynamic>,
        ),
  customerQuotas:
      (json['customerQuotas'] as List<dynamic>?)
          ?.map((e) => CustomerQuotaModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$$CustomerSubscriptionModelImplToJson(
  _$CustomerSubscriptionModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'customerId': instance.customerId,
  'servicePackageId': instance.servicePackageId,
  'subscriptionCode': instance.subscriptionCode,
  'pricePaid': instance.pricePaid,
  'purchaseDate': instance.purchaseDate?.toIso8601String(),
  'expiredAt': instance.expiredAt?.toIso8601String(),
  'status': instance.status,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  'remainingDays': instance.remainingDays,
  'isUnlimited': instance.isUnlimited,
  'statusBadgeVariant': instance.statusBadgeVariant,
  'statusLabel': instance.statusLabel,
  'customer': instance.customer,
  'servicePackage': instance.servicePackage,
  'customerQuotas': instance.customerQuotas,
};
