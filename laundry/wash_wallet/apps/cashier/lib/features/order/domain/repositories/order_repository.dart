import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderRepository {
  Future<Result<List<Order>>> getAll({
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
  });

  Future<Result<Order>> getById(int id);

  Future<Result<Order>> store(Map<String, dynamic> data);

  Future<Result<Order>> update({
    required int id,
    required Map<String, dynamic> data,
  });

  Future<Result<Order>> complete({required int id, required String clientRequestId});
  
  Future<Result<Order>> accept({required int id, required String clientRequestId});

  Future<Result<Order>> reject({
    required int id,
    String? reason,
    required String clientRequestId,
  });

  Future<Result<Order>> weigh({
    required int id,
    required Map<String, dynamic> data,
    String? photoPath,
  });

  Future<Result<Order>> start({required int id, required String clientRequestId});

  Future<Result<int>> getNewOrderCount();

  Future<Result<void>> saveDraft(OrderDraft draft);

  Future<Result<OrderDraft?>> getDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  });

  Future<Result<void>> clearDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  });

  Future<Result<void>> saveWeighingDraft(WeighingDraft draft);

  Future<Result<WeighingDraft?>> getWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  });

  Future<Result<void>> clearWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  });
}
