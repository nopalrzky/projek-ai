import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/print_repository.dart';
import '../entities/print_coin_info.dart';

class ProcessLabelParams {
  final int orderId;
  final String? clientRequestId;

  ProcessLabelParams({required this.orderId, this.clientRequestId});
}

class ProcessLabelUsecase {
  final PrintRepository _repository;

  ProcessLabelUsecase(this._repository);

  Future<Result<PrintCoinInfo>> execute(ProcessLabelParams params) async {
    return _repository.processLabel(
      params.orderId,
      clientRequestId: params.clientRequestId,
    );
  }
}
