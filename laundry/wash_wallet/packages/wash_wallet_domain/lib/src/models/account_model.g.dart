// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AccountModelImpl _$$AccountModelImplFromJson(Map<String, dynamic> json) =>
    _$AccountModelImpl(
      id: (json['id'] as num).toInt(),
      ownerId: (json['ownerId'] as num).toInt(),
      outletId: (json['outletId'] as num?)?.toInt(),
      parentId: (json['parentId'] as num?)?.toInt(),
      code: json['code'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String?,
      type: json['type'] as String,
      subtype: json['subtype'] as String?,
      accountRole: json['accountRole'] as String?,
      level: (json['level'] as num).toInt(),
      isSystem: json['isSystem'] as bool? ?? false,
      isTransactional: json['isTransactional'] as bool? ?? true,
      isActive: json['isActive'] as bool? ?? true,
      balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$AccountModelImplToJson(_$AccountModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'ownerId': instance.ownerId,
      'outletId': instance.outletId,
      'parentId': instance.parentId,
      'code': instance.code,
      'name': instance.name,
      'slug': instance.slug,
      'type': instance.type,
      'subtype': instance.subtype,
      'accountRole': instance.accountRole,
      'level': instance.level,
      'isSystem': instance.isSystem,
      'isTransactional': instance.isTransactional,
      'isActive': instance.isActive,
      'balance': instance.balance,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
