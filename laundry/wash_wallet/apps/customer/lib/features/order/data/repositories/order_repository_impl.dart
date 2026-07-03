import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/entities/create_order_params.dart';
import '../../domain/entities/schedule_delivery_params.dart';
import '../../domain/entities/submit_review_params.dart';
import '../../domain/repositories/order_repository.dart';
import '../datasources/order_remote_datasource.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDatasource _remoteDatasource;

  OrderRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<Order>> store(CreateOrderParams params) async {
    try {
      final model = await _remoteDatasource.store(params.toJson());
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<List<Order>>> getAll({
    required int customerAccountId,
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    String? sortBy,
    String? sortDirection,
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        customerAccountId: customerAccountId,
        page: page,
        perPage: perPage,
        search: search,
        status: status,
        sortBy: sortBy,
        sortDirection: sortDirection,
      );
      return Result.success(models.map((e) => e.toEntity()).toList());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Order>> getById(int orderId) async {
    try {
      final model = await _remoteDatasource.getById(orderId);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Order>> cancel(int orderId) async {
    try {
      final model = await _remoteDatasource.cancel(orderId);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Order>> pay({
    required int orderId,
    required String paymentMethod,
  }) async {
    try {
      final model = await _remoteDatasource.pay(orderId, {
        'payment_method': paymentMethod,
      });
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Order>> scheduleDelivery(ScheduleDeliveryParams params) async {
    try {
      final model = await _remoteDatasource.scheduleDelivery(
        params.orderId,
        params.toJson(),
      );
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Order>> complete(int orderId) async {
    try {
      final model = await _remoteDatasource.complete(orderId);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Order>> submitReview(SubmitReviewParams params) async {
    try {
      final model = await _remoteDatasource.submitReview(params.orderId, {
        'rating': params.rating,
        'comment': params.comment,
      });
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
