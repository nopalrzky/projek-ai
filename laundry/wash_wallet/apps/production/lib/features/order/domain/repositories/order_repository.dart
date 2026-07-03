import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderRepository {
  Future<Result<PaginatedData<Order>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? paymentStatus,
    int? outletId,
    List<int>? outletIds,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String? pickupScheduleFrom,
    String? pickupScheduleTo,
    String? forCourierPickupDate,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  });

  Future<Result<Order>> getById(int id);

  Future<Result<Order>> start({required int orderId, int? employeeId});

  Future<Result<Order>> complete(int id);

  Future<Result<Order>> pickup(int id);

  Future<Result<Order>> confirmPickup(int id, String photoPath);

  Future<Result<Order>> confirmArrived(int id, String? photoPath);
}
