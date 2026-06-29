// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_account_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CustomerAccountModelImpl _$$CustomerAccountModelImplFromJson(
  Map<String, dynamic> json,
) => _$CustomerAccountModelImpl(
  id: (json['id'] as num).toInt(),
  phone: json['phone'] as String,
  name: json['name'] as String,
  email: json['email'] as String?,
  gender: json['gender'] as String?,
  avatar: json['avatar'] as String?,
  dateOfBirth: json['dateOfBirth'] as String?,
  isVerified: json['isVerified'] as bool,
  isActive: json['isActive'] as bool,
  lastLoginAt: json['lastLoginAt'] as String?,
  fcmToken: json['fcmToken'] as String?,
  depositBalance: (json['depositBalance'] as num?)?.toInt() ?? 0,
  hasPassword: json['hasPassword'] as bool?,
);

Map<String, dynamic> _$$CustomerAccountModelImplToJson(
  _$CustomerAccountModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'phone': instance.phone,
  'name': instance.name,
  'email': instance.email,
  'gender': instance.gender,
  'avatar': instance.avatar,
  'dateOfBirth': instance.dateOfBirth,
  'isVerified': instance.isVerified,
  'isActive': instance.isActive,
  'lastLoginAt': instance.lastLoginAt,
  'fcmToken': instance.fcmToken,
  'depositBalance': instance.depositBalance,
  'hasPassword': instance.hasPassword,
};
