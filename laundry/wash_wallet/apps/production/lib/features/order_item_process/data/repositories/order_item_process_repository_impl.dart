import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../datasources/order_item_process_remote_datasource.dart';
import '../../domain/repositories/order_item_process_repository.dart';

class OrderItemProcessRepositoryImpl implements OrderItemProcessRepository {
  final OrderItemProcessRemoteDataSource _remoteDatasource;

  OrderItemProcessRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<OrderItemProcess>> start(int id) async {
    try {
      final model = await _remoteDatasource.start(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(
        ServerFailure(message: e.message, statusCode: e.statusCode),
      );
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<OrderItemProcess>> complete(int id) async {
    try {
      final model = await _remoteDatasource.complete(id);
      return Result.success(model.toEntity());
    } on ApiException catch (e) {
      return Result.failure(
        ServerFailure(message: e.message, statusCode: e.statusCode),
      );
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(message: e.message));
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
