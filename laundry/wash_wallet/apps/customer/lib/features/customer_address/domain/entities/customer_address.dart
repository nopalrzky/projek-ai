import 'package:equatable/equatable.dart';

class CustomerAddress extends Equatable {
  final int id;
  final String label;
  final String recipientName;
  final String recipientPhone;
  final String street;
  final String? notes;
  final double? latitude;
  final double? longitude;
  final bool isPrimary;
  final String? villageId;
  final String? districtId;
  final String? regencyId;
  final String? provinceId;
  final String? villageName;
  final String? districtName;
  final String? regencyName;
  final String? provinceName;
  final String? createdAt;
  final String? updatedAt;

  const CustomerAddress({
    required this.id,
    required this.label,
    required this.recipientName,
    required this.recipientPhone,
    required this.street,
    this.notes,
    this.latitude,
    this.longitude,
    required this.isPrimary,
    this.villageId,
    this.districtId,
    this.regencyId,
    this.provinceId,
    this.villageName,
    this.districtName,
    this.regencyName,
    this.provinceName,
    this.createdAt,
    this.updatedAt,
  });

  @override
  List<Object?> get props => [
    id,
    label,
    recipientName,
    recipientPhone,
    street,
    notes,
    latitude,
    longitude,
    isPrimary,
    villageId,
    districtId,
    regencyId,
    provinceId,
    villageName,
    districtName,
    regencyName,
    provinceName,
    createdAt,
    updatedAt,
  ];
}
