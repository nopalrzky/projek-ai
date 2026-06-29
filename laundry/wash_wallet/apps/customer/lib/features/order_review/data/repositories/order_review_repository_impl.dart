import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/repositories/order_review_repository.dart';
import '../datasources/order_review_remote_datasource.dart';

class OrderReviewRepositoryImpl implements OrderReviewRepository {
  final OrderReviewRemoteDatasource _remoteDatasource;

  OrderReviewRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<List<OrderReview>>> getAll({
    int? outletId,
    int? customerAccountId,
    int? orderId,
    int? rating,
    int page = 1,
    int perPage = 15,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    try {
      final models = await _remoteDatasource.getAll(
        outletId: outletId,
        customerAccountId: customerAccountId,
        orderId: orderId,
        rating: rating,
        page: page,
        perPage: perPage,
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
  Future<Result<OrderReview>> getById(int id) async {
    try {
      final model = await _remoteDatasource.getById(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<OutletReviewSummary>> getSummary(int outletId) async {
    try {
      final model = await _remoteDatasource.getSummary(outletId);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
