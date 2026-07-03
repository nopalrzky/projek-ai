import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_item_repository.dart';

class GetAllUsecase {
  final OrderItemRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<PaginatedData<OrderItem>>> call({
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
  }) async {
    return await _repository.getAll(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      orderId: orderId,
      laundryServiceId: laundryServiceId,
      customerId: customerId,
      startedAtFrom: startedAtFrom,
      startedAtTo: startedAtTo,
      completedAtFrom: completedAtFrom,
      completedAtTo: completedAtTo,
      createdAtFrom: createdAtFrom,
      createdAtTo: createdAtTo,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );
  }
}
