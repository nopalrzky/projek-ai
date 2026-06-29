import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../domain/entities/print_info.dart';
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
  Future<Result<Map<String, dynamic>>> processReceipt(int orderId) async {
    try {
      final model = await _remoteDatasource.processReceipt(orderId);
      return Result.success({
        'coin_deducted': model.coinPrice,
        'coin_source': model.coinSource,
        'remaining_coin': model.coinSource == 'outlet'
            ? model.outletCoinBalance
            : model.ownerCoinBalance,
      });
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  @override
  Future<Result<Map<String, dynamic>>> processLabel(int orderId) async {
    try {
      final model = await _remoteDatasource.processLabel(orderId);
      return Result.success({
        'coin_deducted': model.coinPrice,
        'coin_source': model.coinSource,
        'remaining_coin': model.coinSource == 'outlet'
            ? model.outletCoinBalance
            : model.ownerCoinBalance,
      });
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
