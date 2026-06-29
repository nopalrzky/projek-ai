import 'package:equatable/equatable.dart';
import 'outlet_access.dart';

class Employee extends Equatable {
  final int id;
  final String name;
  final String username;
  final String? email;
  final String? phone;
  final String? gender;
  final String? formattedGender;
  final String? address;
  final int? age;
  final String? startDate;
  final String? dateOfBirth;
  final bool isActive;
  final int? outletId;
  final int? cutoffDays;
  final String? lastLoginAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? deletedAt;
  final List<OutletAccess>? accessibleOutlets;

  const Employee({
    required this.id,
    required this.name,
    required this.username,
    this.email,
    this.phone,
    this.gender,
    this.formattedGender,
    this.address,
    this.age,
    this.startDate,
    this.dateOfBirth,
    required this.isActive,
    this.outletId,
    this.cutoffDays,
    this.lastLoginAt,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.accessibleOutlets,
  });

  factory Employee.fromModel(dynamic model) {
    return Employee(
      id: model.id,
      name: model.name,
      username: model.username,
      email: model.email,
      phone: model.phone,
      gender: model.gender,
      formattedGender: model.formattedGender,
      address: model.address,
      age: model.age,
      startDate: model.startDate,
      dateOfBirth: model.dateOfBirth,
      isActive: model.isActive,
      outletId: model.outletId,
      cutoffDays: model.cutoffDays,
      lastLoginAt: model.lastLoginAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
      accessibleOutlets: model.accessibleOutlets?.map<OutletAccess>((e) => e.toEntity()).toList(),
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    username,
    email,
    phone,
    gender,
    formattedGender,
    address,
    age,
    startDate,
    dateOfBirth,
    isActive,
    outletId,
    cutoffDays,
    lastLoginAt,
    createdAt,
    updatedAt,
    deletedAt,
    accessibleOutlets,
  ];
}
