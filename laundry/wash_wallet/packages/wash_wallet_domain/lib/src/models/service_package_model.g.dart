// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'service_package_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ServicePackageModelImpl _$$ServicePackageModelImplFromJson(
  Map<String, dynamic> json,
) => _$ServicePackageModelImpl(
  id: (json['id'] as num).toInt(),
  outletId: (json['outletId'] as num?)?.toInt(),
  name: json['name'] as String,
  price: (json['price'] as num).toDouble(),
  validityDays: (json['validityDays'] as num?)?.toInt(),
  description: json['description'] as String?,
  isActive: json['isActive'] as bool? ?? true,
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
  deletedAt: json['deletedAt'] as String?,
  outlet: json['outlet'] == null
      ? null
      : OutletModel.fromJson(json['outlet'] as Map<String, dynamic>),
  servicePackageItems:
      json['servicePackageItems'] as List<dynamic>? ?? const [],
  customerSubscriptions:
      (json['customerSubscriptions'] as List<dynamic>?)
          ?.map(
            (e) =>
                CustomerSubscriptionModel.fromJson(e as Map<String, dynamic>),
          )
          .toList() ??
      const [],
  servicePackageItemsCount:
      (json['servicePackageItemsCount'] as num?)?.toInt() ?? 0,
  customerSubscriptionsCount:
      (json['customerSubscriptionsCount'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$$ServicePackageModelImplToJson(
  _$ServicePackageModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'outletId': instance.outletId,
  'name': instance.name,
  'price': instance.price,
  'validityDays': instance.validityDays,
  'description': instance.description,
  'isActive': instance.isActive,
  'createdAt': instance.createdAt,
  'updatedAt': instance.updatedAt,
  'deletedAt': instance.deletedAt,
  'outlet': instance.outlet,
  'servicePackageItems': instance.servicePackageItems,
  'customerSubscriptions': instance.customerSubscriptions,
  'servicePackageItemsCount': instance.servicePackageItemsCount,
  'customerSubscriptionsCount': instance.customerSubscriptionsCount,
};
