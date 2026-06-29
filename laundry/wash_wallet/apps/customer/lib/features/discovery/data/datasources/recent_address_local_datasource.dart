import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../../customer_address/domain/entities/customer_address.dart';

abstract class RecentAddressLocalDatasource {
  Future<List<CustomerAddress>> getAll();

  Future<void> save(CustomerAddress address);

  Future<void> clear();
}

class RecentAddressLocalDatasourceImpl implements RecentAddressLocalDatasource {
  static const _key = 'discovery_recent_addresses';
  static const _maxItems = 5;

  const RecentAddressLocalDatasourceImpl();

  @override
  Future<List<CustomerAddress>> getAll() async {
    final preferences = await SharedPreferences.getInstance();
    final rawItems = preferences.getStringList(_key) ?? const [];
    return rawItems
        .map((raw) => _decodeAddress(raw))
        .whereType<CustomerAddress>()
        .toList();
  }

  @override
  Future<void> save(CustomerAddress address) async {
    final preferences = await SharedPreferences.getInstance();
    final addresses = await getAll();
    addresses.removeWhere((item) => _isSameAddress(item, address));
    addresses.insert(0, address);
    final limited = addresses.take(_maxItems).map(_encodeAddress).toList();
    await preferences.setStringList(_key, limited);
  }

  @override
  Future<void> clear() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_key);
  }

  bool _isSameAddress(CustomerAddress first, CustomerAddress second) {
    if (first.id > 0 && second.id > 0) return first.id == second.id;
    return first.street == second.street &&
        first.latitude == second.latitude &&
        first.longitude == second.longitude;
  }

  String _encodeAddress(CustomerAddress address) {
    return jsonEncode({
      'id': address.id,
      'label': address.label,
      'recipientName': address.recipientName,
      'recipientPhone': address.recipientPhone,
      'street': address.street,
      'notes': address.notes,
      'latitude': address.latitude,
      'longitude': address.longitude,
      'isPrimary': address.isPrimary,
      'villageId': address.villageId,
      'districtId': address.districtId,
      'regencyId': address.regencyId,
      'provinceId': address.provinceId,
      'villageName': address.villageName,
      'districtName': address.districtName,
      'regencyName': address.regencyName,
      'provinceName': address.provinceName,
      'createdAt': address.createdAt,
      'updatedAt': address.updatedAt,
    });
  }

  CustomerAddress? _decodeAddress(String raw) {
    try {
      final json = jsonDecode(raw);
      if (json is! Map<String, dynamic>) return null;
      return CustomerAddress(
        id: _toInt(json['id']),
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
    } catch (_) {
      return null;
    }
  }

  int _toInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  bool _toBool(dynamic value) {
    if (value is bool) return value;
    if (value is num) return value == 1;
    if (value is String) return value == 'true' || value == '1';
    return false;
  }

  String? _toString(dynamic value) {
    if (value == null) return null;
    return value.toString();
  }
}
