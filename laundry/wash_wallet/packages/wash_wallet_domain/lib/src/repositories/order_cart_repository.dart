import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/order.dart';
import '../entities/order_context.dart';
import '../entities/order_draft.dart';

abstract class OrderCartRepository {
  Future<Result<List<Order>>> getOrders({
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

  Future<Result<List<Order>>> getOrdersByCustomerId({
    required int customerId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? paymentStatus,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  });

  Future<Result<Order>> getOrderById(int id);

  Future<Result<OrderContext>> getOrderContext(int customerId);

  Future<Result<Order>> storeOrder(Map<String, dynamic> data);

  Future<Result<Order>> updateOrder({
    required int id,
    required Map<String, dynamic> data,
  });

  Future<Result<Order>> completeOrder(int id);

  Future<Result<void>> destroyOrder(int id);

  Future<Result<void>> saveDraft(OrderDraft draft);

  Future<Result<OrderDraft?>> getDraft({required int customerId});

  Future<Result<void>> clearDraft({required int customerId});
}
