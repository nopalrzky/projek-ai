import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/print_info.dart';
import '../entities/print_coin_info.dart';

abstract class PrintRepository {
  Future<Result<PrintInfo>> getPrintInfo(int orderId);

  Future<Result<PrintCoinInfo>> processReceipt(int orderId, {String? clientRequestId});
  Future<Result<PrintCoinInfo>> processLabel(int orderId, {String? clientRequestId});
}
