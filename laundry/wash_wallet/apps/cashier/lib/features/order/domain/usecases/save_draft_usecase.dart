import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class SaveDraftUsecase {
  final OrderRepository _repository;

  SaveDraftUsecase(this._repository);

  Future<Result<void>> call(OrderDraft draft) async {
    return await _repository.saveDraft(draft);
  }
}
