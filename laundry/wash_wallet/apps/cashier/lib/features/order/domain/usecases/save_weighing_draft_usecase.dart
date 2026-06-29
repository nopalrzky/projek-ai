import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class SaveWeighingDraftUsecase {
  final OrderRepository _repository;

  SaveWeighingDraftUsecase(this._repository);

  Future<Result<void>> call(WeighingDraft draft) async {
    return await _repository.saveWeighingDraft(draft);
  }
}
