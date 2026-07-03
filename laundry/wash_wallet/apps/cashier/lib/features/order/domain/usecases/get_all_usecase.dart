import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/order_repository.dart';

class GetAllUsecase {
  final OrderRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<PaginatedData<Order>>> call({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? paymentStatus,
    int? outletId,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  }) async {
    return await _repository.getAll(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      paymentStatus: paymentStatus,
      outletId: outletId,
      customerId: customerId,
      employeeId: employeeId,
      orderDateFrom: orderDateFrom,
      orderDateTo: orderDateTo,
      estimatedCompletionFrom: estimatedCompletionFrom,
      estimatedCompletionTo: estimatedCompletionTo,
      totalAmountMin: totalAmountMin,
      totalAmountMax: totalAmountMax,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );
  }
}
