import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/petty_cash_repository.dart';

class GetByIdUsecase {
  final PettyCashRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<PettyCash>> call(int id) async {
    return await _repository.getById(id);
  }
}
