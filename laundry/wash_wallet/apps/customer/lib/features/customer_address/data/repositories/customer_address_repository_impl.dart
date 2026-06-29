import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../domain/entities/customer_address.dart';
import '../../domain/repositories/customer_address_repository.dart';
import '../datasources/customer_address_remote_datasource.dart';

class CustomerAddressRepositoryImpl implements CustomerAddressRepository {
  final CustomerAddressRemoteDatasource _remoteDatasource;

  CustomerAddressRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<List<CustomerAddress>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isPrimary,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        isPrimary: isPrimary,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(models.map((m) => m.toEntity()).toList());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<CustomerAddress>> getById({required int id}) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
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
  }) async {
    try {
      final model = await _remoteDatasource.store(
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
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
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
  }) async {
    try {
      final model = await _remoteDatasource.update(
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
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<void>> destroy(int id) async {
    try {
      await _remoteDatasource.destroy(id);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  Failure _mapExceptionToFailure(Object exception) {
    if (exception is NetworkException) {
      return NetworkFailure(message: exception.message);
    }

    if (exception is ApiException) {
      switch (exception.statusCode) {
        case 400:
        case 422:
          return ValidationFailure(
            message: exception.message,
            errors: exception.errors,
          );
        case 401:
        case 403:
          return AuthFailure(message: exception.message);
        case 404:
          return ServerFailure(message: exception.message, statusCode: 404);
        default:
          return ServerFailure(
            message: exception.message,
            statusCode: exception.statusCode,
          );
      }
    }

    return ServerFailure(message: exception.toString());
  }
}
