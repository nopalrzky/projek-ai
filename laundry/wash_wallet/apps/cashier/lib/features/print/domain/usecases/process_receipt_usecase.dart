import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/print_repository.dart';
import '../entities/print_coin_info.dart';

class ProcessReceiptParams {
  final int orderId;
  final String? clientRequestId;

  ProcessReceiptParams({required this.orderId, this.clientRequestId});
}

class ProcessReceiptUsecase {
  final PrintRepository _repository;

  ProcessReceiptUsecase(this._repository);

  Future<Result<PrintCoinInfo>> execute(ProcessReceiptParams params) async {
    return _repository.processReceipt(
      params.orderId,
      clientRequestId: params.clientRequestId,
    );
  }
}
