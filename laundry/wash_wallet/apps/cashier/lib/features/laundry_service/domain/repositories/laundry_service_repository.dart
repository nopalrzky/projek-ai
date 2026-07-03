import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class LaundryServiceRepository {
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
  });

  Future<Result<LaundryService>> getById(int id);

  Future<Result<LaundryService>> store({
    required int unitId,
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int durationHours,
    int minQuantity = 1,
    bool isActive = true,
  });

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
  });

  Future<Result<void>> destroy(int id);
}
