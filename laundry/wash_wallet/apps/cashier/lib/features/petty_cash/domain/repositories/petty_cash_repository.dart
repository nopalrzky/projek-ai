import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class PettyCashRepository {
  Future<Result<PaginatedData<PettyCash>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? cashierId,
    int? ownerId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<Result<PettyCash>> getById(int id);

  Future<Result<PettyCash>> store({
    required double amount,
    required String description,
    required String requestDate,
  });

  Future<Result<PettyCash>> update({
    required int id,
    double? amount,
    String? description,
    String? requestDate,
  });
}
