// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'position_access_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PositionAccessModelImpl _$$PositionAccessModelImplFromJson(
  Map<String, dynamic> json,
) => _$PositionAccessModelImpl(
  positionId: (json['positionId'] as num).toInt(),
  positionName: json['positionName'] as String,
  slug: json['slug'] as String,
  permissions: (json['permissions'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$$PositionAccessModelImplToJson(
  _$PositionAccessModelImpl instance,
) => <String, dynamic>{
  'positionId': instance.positionId,
  'positionName': instance.positionName,
  'slug': instance.slug,
  'permissions': instance.permissions,
};
