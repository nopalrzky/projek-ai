import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class CategoryRepository {
  Future<Result<PaginatedData<Category>>> getAll({
    int? outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
    bool forceRefresh = false,
  });

  Future<Result<Category>> getById({
    required int id,
    bool forceRefresh = false,
  });

  Future<Result<Category>> store({
    required int outletId,
    required String name,
    String? description,
    bool? isActive,
  });

  Future<Result<Category>> update({
    required int id,
    String? name,
    String? description,
    bool? isActive,
    int? outletId,
  });

  Future<Result<void>> destroy(int id);
}
