// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'employee_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$EmployeeModelImpl _$$EmployeeModelImplFromJson(Map<String, dynamic> json) =>
    _$EmployeeModelImpl(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      username: json['username'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      gender: json['gender'] as String?,
      formattedGender: json['formattedGender'] as String?,
      address: json['address'] as String?,
      age: (json['age'] as num?)?.toInt(),
      startDate: json['startDate'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      isActive: json['isActive'] as bool,
      outletId: (json['outletId'] as num?)?.toInt(),
      cutoffDays: (json['cutoffDays'] as num?)?.toInt(),
      lastLoginAt: json['lastLoginAt'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      deletedAt: json['deletedAt'] == null
          ? null
          : DateTime.parse(json['deletedAt'] as String),
      accessibleOutlets: (json['accessibleOutlets'] as List<dynamic>?)
          ?.map((e) => OutletAccessModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$EmployeeModelImplToJson(_$EmployeeModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'username': instance.username,
      'email': instance.email,
      'phone': instance.phone,
      'gender': instance.gender,
      'formattedGender': instance.formattedGender,
      'address': instance.address,
      'age': instance.age,
      'startDate': instance.startDate,
      'dateOfBirth': instance.dateOfBirth,
      'isActive': instance.isActive,
      'outletId': instance.outletId,
      'cutoffDays': instance.cutoffDays,
      'lastLoginAt': instance.lastLoginAt,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'deletedAt': instance.deletedAt?.toIso8601String(),
      'accessibleOutlets': instance.accessibleOutlets,
    };
