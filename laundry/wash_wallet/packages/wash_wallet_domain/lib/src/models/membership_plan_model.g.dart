// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'membership_plan_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MembershipPlanModelImpl _$$MembershipPlanModelImplFromJson(
  Map<String, dynamic> json,
) => _$MembershipPlanModelImpl(
  id: (json['id'] as num).toInt(),
  outletId: (json['outletId'] as num).toInt(),
  name: json['name'] as String,
  price: (json['price'] as num).toDouble(),
  durationDays: (json['durationDays'] as num).toInt(),
  isActive: json['isActive'] as bool,
  discountPercentage: (json['discountPercentage'] as num).toDouble(),
  description: json['description'] as String?,
  level: (json['level'] as num?)?.toInt(),
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
  membershipContractsCount:
      (json['membershipContractsCount'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$$MembershipPlanModelImplToJson(
  _$MembershipPlanModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'outletId': instance.outletId,
  'name': instance.name,
  'price': instance.price,
  'durationDays': instance.durationDays,
  'isActive': instance.isActive,
  'discountPercentage': instance.discountPercentage,
  'description': instance.description,
  'level': instance.level,
  'createdAt': instance.createdAt,
  'updatedAt': instance.updatedAt,
  'membershipContractsCount': instance.membershipContractsCount,
};
