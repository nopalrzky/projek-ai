import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/deposit_repository.dart';

class GetByIdUsecase {
  final DepositRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<Deposit>> call(int id) async {
    return await _repository.getById(id);
  }
}

typedef GetDepositByIdUsecase = GetByIdUsecase;
