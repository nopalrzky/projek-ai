import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/customer_address.dart';

abstract class CustomerAddressRepository {
  Future<Result<List<CustomerAddress>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isPrimary,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<Result<CustomerAddress>> getById({required int id});

  Future<Result<CustomerAddress>> store({
    required String label,
    required String recipientName,
    required String recipientPhone,
    required String street,
    String? notes,
    double? latitude,
    double? longitude,
    bool? isPrimary,
    String? villageId,
    String? districtId,
    String? regencyId,
    String? provinceId,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  });

  Future<Result<CustomerAddress>> update({
    required int id,
    String? label,
    String? recipientName,
    String? recipientPhone,
    String? street,
    String? notes,
    double? latitude,
    double? longitude,
    bool? isPrimary,
    String? villageId,
    String? districtId,
    String? regencyId,
    String? provinceId,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  });

  Future<Result<void>> destroy(int id);
}
