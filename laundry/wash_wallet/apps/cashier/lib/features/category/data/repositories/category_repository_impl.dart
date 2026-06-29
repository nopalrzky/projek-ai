import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../domain/repositories/category_repository.dart';
import '../datasources/category_local_datasource.dart';
import '../datasources/category_remote_datasource.dart';

class CategoryRepositoryImpl implements CategoryRepository {
  final CategoryRemoteDatasource _remoteDatasource;
  final CategoryLocalDatasource _localDatasource;

  CategoryRepositoryImpl(this._remoteDatasource, this._localDatasource);

  @override
  Future<Result<Category>> getById({
    required int id,
    bool forceRefresh = false,
  }) async {
    try {
      if (!forceRefresh) {
        try {
          final cachedModel = await _localDatasource.getCachedCategoryById(id);
          if (cachedModel != null) {
            return Result.success(cachedModel.toEntity());
          }
        } catch (_) {}
      }

      final model = await _remoteDatasource.getById(id);

      try {
        await _localDatasource.cacheCategoryDetail(model);
      } catch (_) {}

      return Result.success(model.toEntity());
    } catch (e) {
      if (e is NetworkException) {
        try {
          final cachedModel = await _localDatasource.getCachedCategoryById(id);
          if (cachedModel != null) {
            return Result.success(cachedModel.toEntity());
          }
        } catch (_) {}
      }

      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<List<Category>>> getAll({
    int? outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
    bool forceRefresh = false,
  }) async {
    try {
      if (!forceRefresh &&
          outletId != null &&
          search == null &&
          isActive == null &&
          page == 1 &&
          sortBy == 'created_at' &&
          sortDirection == 'desc') {
        try {
          final cachedModels = await _localDatasource.getCachedCategories(
            outletId,
          );

          if (cachedModels.isNotEmpty) {
            return Result.success(
              cachedModels.map((e) => e.toEntity()).toList(),
            );
          }
        } catch (_) {}
      }

      final models = await _remoteDatasource.getAll(
        outletId: outletId,
        page: page,
        perPage: perPage,
        search: search,
        isActive: isActive,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );

      if (outletId != null &&
          page == 1 &&
          search == null &&
          isActive == null &&
          sortBy == 'created_at' &&
          sortDirection == 'desc') {
        try {
          await _localDatasource.cacheCategories(models, outletId);
        } catch (_) {}
      }

      return Result.success(models.map((e) => e.toEntity()).toList());
    } catch (e) {
      if (e is NetworkException &&
          outletId != null &&
          page == 1 &&
          search == null &&
          isActive == null &&
          sortBy == 'created_at' &&
          sortDirection == 'desc') {
        try {
          final cachedModels = await _localDatasource.getCachedCategories(
            outletId,
          );
          if (cachedModels.isNotEmpty) {
            return Result.success(
              cachedModels.map((e) => e.toEntity()).toList(),
            );
          }
        } catch (_) {}
      }

      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Category>> store({
    required int outletId,
    required String name,
    String? description,
    bool? isActive,
  }) async {
    try {
      final model = await _remoteDatasource.store(
        outletId: outletId,
        name: name,
        description: description,
        isActive: isActive,
      );

      try {
        await _localDatasource.clearCategories(outletId);
      } catch (_) {}

      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<Category>> update({
    required int id,
    String? name,
    String? description,
    bool? isActive,
    int? outletId,
  }) async {
    try {
      final model = await _remoteDatasource.update(
        id: id,
        name: name,
        description: description,
        isActive: isActive,
        outletId: outletId,
      );

      try {
        if (outletId != null) {
          await _localDatasource.clearCategories(outletId);
        }
        await _localDatasource.clearCategoryDetail(id);
      } catch (_) {}

      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(_mapExceptionToFailure(e));
    }
  }

  @override
  Future<Result<void>> destroy(int id) async {
    try {
      await _remoteDatasource.destroy(id);

      try {
        await _localDatasource.clearAllCategories();
      } catch (_) {}

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
