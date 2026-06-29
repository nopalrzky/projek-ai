// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CustomerModelImpl _$$CustomerModelImplFromJson(Map<String, dynamic> json) =>
    _$CustomerModelImpl(
      id: (json['id'] as num).toInt(),
      outletId: (json['outletId'] as num?)?.toInt(),
      name: json['name'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      gender: json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] == null
          ? null
          : DateTime.parse(json['dateOfBirth'] as String),
      isActive: json['isActive'] as bool,
      statusLabel: json['statusLabel'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      deletedAt: json['deletedAt'] == null
          ? null
          : DateTime.parse(json['deletedAt'] as String),
      ordersCount: (json['ordersCount'] as num?)?.toInt() ?? 0,
      customerSubscriptionsCount:
          (json['customerSubscriptionsCount'] as num?)?.toInt() ?? 0,
      membershipContractsCount:
          (json['membershipContractsCount'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$CustomerModelImplToJson(_$CustomerModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'outletId': instance.outletId,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'address': instance.address,
      'gender': instance.gender,
      'dateOfBirth': instance.dateOfBirth?.toIso8601String(),
      'isActive': instance.isActive,
      'statusLabel': instance.statusLabel,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'deletedAt': instance.deletedAt?.toIso8601String(),
      'ordersCount': instance.ordersCount,
      'customerSubscriptionsCount': instance.customerSubscriptionsCount,
      'membershipContractsCount': instance.membershipContractsCount,
    };
