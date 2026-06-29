import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../repositories/print_repository.dart';

class ProcessLabelUsecase {
  final PrintRepository _repository;

  ProcessLabelUsecase(this._repository);

  Future<Result<Map<String, dynamic>>> call(int orderId) async {
    return await _repository.processLabel(orderId);
  }
}
