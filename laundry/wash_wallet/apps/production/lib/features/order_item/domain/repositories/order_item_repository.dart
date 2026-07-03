import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderItemRepository {
  Future<Result<PaginatedData<OrderItem>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? orderId,
    int? laundryServiceId,
    int? customerId,
    String? startedAtFrom,
    String? startedAtTo,
    String? completedAtFrom,
    String? completedAtTo,
    String? createdAtFrom,
    String? createdAtTo,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<Result<OrderItem>> getById(int id);

  Future<Result<OrderItem>> start(int id);

  Future<Result<OrderItem>> complete({required int id, String? notes});
}
