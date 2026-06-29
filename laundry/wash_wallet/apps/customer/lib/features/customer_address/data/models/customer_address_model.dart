import '../../domain/entities/customer_address.dart';

class CustomerAddressModel {
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

  const CustomerAddressModel({
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

  factory CustomerAddressModel.fromJson(Map<String, dynamic> json) {
    return CustomerAddressModel(
      id: json['id'] as int,
      label: (json['label'] ?? '') as String,
      recipientName: (json['recipientName'] ?? '') as String,
      recipientPhone: (json['recipientPhone'] ?? '') as String,
      street: (json['street'] ?? '') as String,
      notes: json['notes'] as String?,
      latitude: _toDouble(json['latitude']),
      longitude: _toDouble(json['longitude']),
      isPrimary: _toBool(json['isPrimary']),
      villageId: _toString(json['villageId']),
      districtId: _toString(json['districtId']),
      regencyId: _toString(json['regencyId']),
      provinceId: _toString(json['provinceId']),
      villageName: json['villageName'] as String?,
      districtName: json['districtName'] as String?,
      regencyName: json['regencyName'] as String?,
      provinceName: json['provinceName'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  static String? _toString(dynamic value) {
    if (value == null) return null;
    return value.toString();
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  static bool _toBool(dynamic value) {
    if (value is bool) return value;
    if (value is num) return value == 1;
    if (value is String) {
      final normalized = value.toLowerCase();
      return normalized == 'true' || normalized == '1';
    }
    return false;
  }

  CustomerAddress toEntity() {
    return CustomerAddress(
      id: id,
      label: label,
      recipientName: recipientName,
      recipientPhone: recipientPhone,
      street: street,
      notes: notes,
      latitude: latitude,
      longitude: longitude,
      isPrimary: isPrimary,
      villageId: villageId,
      districtId: districtId,
      regencyId: regencyId,
      provinceId: provinceId,
      villageName: villageName,
      districtName: districtName,
      regencyName: regencyName,
      provinceName: provinceName,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
