import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/print_info.dart';
import '../repositories/print_repository.dart';

class GetPrintInfoUsecase {
  final PrintRepository _repository;

  GetPrintInfoUsecase(this._repository);

  Future<Result<PrintInfo>> call(int orderId) async {
    return await _repository.getPrintInfo(orderId);
  }
}
