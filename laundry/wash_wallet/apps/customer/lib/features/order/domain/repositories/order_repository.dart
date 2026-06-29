import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../entities/create_order_params.dart';
import '../entities/schedule_delivery_params.dart';
import '../entities/submit_review_params.dart';

abstract class OrderRepository {
  Future<Result<Order>> store(CreateOrderParams params);
  Future<Result<List<Order>>> getAll({
    required int customerAccountId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? sortBy,
    String? sortDirection,
  });
  Future<Result<Order>> getById(int orderId);
  Future<Result<Order>> cancel(int orderId);
  Future<Result<Order>> pay({
    required int orderId,
    required String paymentMethod,
  });
  Future<Result<Order>> scheduleDelivery(ScheduleDeliveryParams params);
  Future<Result<Order>> complete(int orderId);
  Future<Result<Order>> submitReview(SubmitReviewParams params);
}
