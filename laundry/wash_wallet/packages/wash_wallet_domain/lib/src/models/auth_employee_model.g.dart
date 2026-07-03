// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_employee_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AuthEmployeeModelImpl _$$AuthEmployeeModelImplFromJson(
  Map<String, dynamic> json,
) => _$AuthEmployeeModelImpl(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  username: json['username'] as String,
  email: json['email'] as String?,
  phone: json['phone'] as String?,
  gender: json['gender'] as String?,
  address: json['address'] as String?,
  outletId: (json['outletId'] as num).toInt(),
  accessibleOutlets: (json['accessibleOutlets'] as List<dynamic>?)
      ?.map((e) => OutletAccessModel.fromJson(e as Map<String, dynamic>))
      .toList(),
  allPermissions: (json['allPermissions'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  hasPin: json['hasPin'] as bool? ?? false,
);

Map<String, dynamic> _$$AuthEmployeeModelImplToJson(
  _$AuthEmployeeModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'username': instance.username,
  'email': instance.email,
  'phone': instance.phone,
  'gender': instance.gender,
  'address': instance.address,
  'outletId': instance.outletId,
  'accessibleOutlets': instance.accessibleOutlets,
  'allPermissions': instance.allPermissions,
  'hasPin': instance.hasPin,
};
