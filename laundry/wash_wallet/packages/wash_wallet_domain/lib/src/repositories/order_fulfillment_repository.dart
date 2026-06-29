import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/order.dart';
import '../entities/order_item.dart';
import '../entities/order_item_process.dart';

abstract class OrderFulfillmentRepository {
  Future<Result<List<Order>>> getOrders({
    int page = 1,
    int perPage = 15,
    String search = '',
    String? status,
    String? paymentStatus,
    int? outletId,
    int? customerId,
    String? startDate,
    String? endDate,
  });

  Future<Result<Order>> getOrderById(int id);

  Future<Result<List<Order>>> getPendingOrders({
    int page = 1,
    int perPage = 15,
    String search = '',
    int? outletId,
    int? customerId,
  });

  Future<Result<List<Order>>> getInProgressOrders({
    int page = 1,
    int perPage = 15,
    String search = '',
    int? outletId,
    int? customerId,
  });

  Future<Result<Order>> startOrder({required int orderId, int? employeeId});

  Future<Result<OrderItem>> getOrderItemById({required int orderItemId});

  Future<Result<OrderItem>> startOrderItem({required int orderItemId});

  Future<Result<OrderItem>> completeOrderItem({
    required int orderItemId,
    String? notes,
  });

  Future<Result<OrderItemProcess>> startProcess({
    required int processId,
    int? employeeId,
  });

  Future<Result<OrderItemProcess>> completeProcess({
    required int processId,
    String? notes,
  });
}
