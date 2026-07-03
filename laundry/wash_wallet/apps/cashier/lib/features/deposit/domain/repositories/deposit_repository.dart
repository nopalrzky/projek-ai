import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class DepositRepository {
  Future<Result<PaginatedData<Deposit>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? ownerId,
    String? status,
    int? outletId,
    int? cashierId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  });

  Future<Result<Deposit>> getById(int id);

  Future<Result<Deposit>> store({
    required int destinationAccountId,
    required double amount,
    String? notes,
    String? attachmentPath,
  });

  Future<Result<Deposit>> update({
    required int id,
    int? destinationAccountId,
    double? amount,
    String? notes,
    String? attachmentPath,
  });
}
