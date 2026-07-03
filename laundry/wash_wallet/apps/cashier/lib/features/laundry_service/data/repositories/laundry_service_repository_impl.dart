import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../domain/repositories/laundry_service_repository.dart';
import '../datasources/laundry_service_remote_datasource.dart';

class LaundryServiceRepositoryImpl implements LaundryServiceRepository {
  final LaundryServiceRemoteDatasource _remoteDatasource;

  LaundryServiceRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<PaginatedData<LaundryService>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    int? categoryId,
    int? unitId,
    bool? isActive,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    try {
      final paginatedData = await _remoteDatasource.getAll(
        page: page,
        perPage: perPage,
        search: search,
        outletId: outletId,
        categoryId: categoryId,
        unitId: unitId,
        isActive: isActive,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(PaginatedData<LaundryService>(
        items: paginatedData.items.map((m) => m.toEntity()).toList(),
        currentPage: paginatedData.currentPage, lastPage: paginatedData.lastPage,
        perPage: paginatedData.perPage, total: paginatedData.total,
        from: paginatedData.from, to: paginatedData.to,
      ));
    } catch (e) {
      return Result.failure(_handleError(e));
    }
  }

  @override
  Future<Result<LaundryService>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_handleError(e));
    }
  }

  @override
  Future<Result<LaundryService>> store({
    required int unitId,
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int durationHours,
    int minQuantity = 1,
    bool isActive = true,
  }) async {
    try {
      final model = await _remoteDatasource.store(
        unitId: unitId,
        categoryId: categoryId,
        name: name,
        description: description,
        price: price,
        durationHours: durationHours,
        minQuantity: minQuantity,
        isActive: isActive,
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_handleError(e));
    }
  }

  @override
  Future<Result<LaundryService>> update({
    required int id,
    int? unitId,
    int? categoryId,
    String? name,
    String? description,
    double? price,
    int? durationHours,
    int? minQuantity,
    bool? isActive,
  }) async {
    try {
      final model = await _remoteDatasource.update(
        id: id,
        unitId: unitId,
        categoryId: categoryId,
        name: name,
        description: description,
        price: price,
        durationHours: durationHours,
        minQuantity: minQuantity,
        isActive: isActive,
      );
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_handleError(e));
    }
  }

  @override
  Future<Result<void>> destroy(int id) async {
    try {
      await _remoteDatasource.destroy(id);
      return const Result.success(null);
    } catch (e) {
      return Result.failure(_handleError(e));
    }
  }

  Failure _handleError(Object e) {
    if (e is ApiException) {
      return ServerFailure(message: e.message, statusCode: e.statusCode);
    }
    return ServerFailure(message: e.toString());
  }
}
