import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/print_repository.dart';

class ProcessReceiptUsecase {
  final PrintRepository _repository;

  ProcessReceiptUsecase(this._repository);

  Future<Result<Map<String, dynamic>>> call(int orderId) async {
    return await _repository.processReceipt(orderId);
  }
}
