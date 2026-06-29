// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'laundry_service_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LaundryServiceModelImpl _$$LaundryServiceModelImplFromJson(
  Map<String, dynamic> json,
) => _$LaundryServiceModelImpl(
  id: (json['id'] as num).toInt(),
  categoryId: (json['categoryId'] as num).toInt(),
  unitId: (json['unitId'] as num).toInt(),
  name: json['name'] as String,
  description: json['description'] as String?,
  price: (json['price'] as num).toDouble(),
  durationHours: (json['durationHours'] as num).toInt(),
  minQuantity: (json['minQuantity'] as num).toInt(),
  slug: json['slug'] as String,
  isActive: json['isActive'] as bool,
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
  deletedAt: json['deletedAt'] as String?,
  unit: json['unit'] == null
      ? null
      : UnitModel.fromJson(json['unit'] as Map<String, dynamic>),
  category: json['category'] == null
      ? null
      : CategoryModel.fromJson(json['category'] as Map<String, dynamic>),
  laundryServiceProcessesCount:
      (json['laundryServiceProcessesCount'] as num?)?.toInt() ?? 0,
  servicePackageItemsCount:
      (json['servicePackageItemsCount'] as num?)?.toInt() ?? 0,
  averageRating: (json['averageRating'] as num?)?.toDouble(),
  reviewsCount: (json['reviewsCount'] as num?)?.toInt(),
  supportsCourier: json['supportsCourier'] as bool? ?? true,
  courierSupportLabel: json['courierSupportLabel'] as String?,
  courierSupportMessage: json['courierSupportMessage'] as String?,
);

Map<String, dynamic> _$$LaundryServiceModelImplToJson(
  _$LaundryServiceModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'categoryId': instance.categoryId,
  'unitId': instance.unitId,
  'name': instance.name,
  'description': instance.description,
  'price': instance.price,
  'durationHours': instance.durationHours,
  'minQuantity': instance.minQuantity,
  'slug': instance.slug,
  'isActive': instance.isActive,
  'createdAt': instance.createdAt,
  'updatedAt': instance.updatedAt,
  'deletedAt': instance.deletedAt,
  'unit': instance.unit,
  'category': instance.category,
  'laundryServiceProcessesCount': instance.laundryServiceProcessesCount,
  'servicePackageItemsCount': instance.servicePackageItemsCount,
  'averageRating': instance.averageRating,
  'reviewsCount': instance.reviewsCount,
  'supportsCourier': instance.supportsCourier,
  'courierSupportLabel': instance.courierSupportLabel,
  'courierSupportMessage': instance.courierSupportMessage,
};
