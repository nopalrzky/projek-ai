import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/print_info.dart';

abstract class PrintRepository {
  Future<Result<PrintInfo>> getPrintInfo(int orderId);

  Future<Result<Map<String, dynamic>>> processReceipt(int orderId);
  Future<Result<Map<String, dynamic>>> processLabel(int orderId);
}
