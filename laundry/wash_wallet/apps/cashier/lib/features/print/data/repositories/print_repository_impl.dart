import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/entities/print_info.dart';
import '../../domain/entities/print_coin_info.dart';
import '../../domain/repositories/print_repository.dart';
import '../datasources/print_remote_datasource.dart';

class PrintRepositoryImpl implements PrintRepository {
  final PrintRemoteDatasource _remoteDatasource;

  PrintRepositoryImpl(this._remoteDatasource);

  @override
  Future<Result<PrintInfo>> getPrintInfo(int orderId) async {
    try {
      final model = await _remoteDatasource.getPrintInfo(orderId);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<PrintCoinInfo>> processReceipt(int orderId, {String? clientRequestId}) async {
    try {
      final model = await _remoteDatasource.processReceipt(orderId, clientRequestId: clientRequestId);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<PrintCoinInfo>> processLabel(int orderId, {String? clientRequestId}) async {
    try {
      final model = await _remoteDatasource.processLabel(orderId, clientRequestId: clientRequestId);
      return Result.success(model.toEntity());
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
