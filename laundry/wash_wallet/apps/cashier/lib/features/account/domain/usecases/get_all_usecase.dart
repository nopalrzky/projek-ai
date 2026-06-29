import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/account_repository.dart';

class GetAllUsecase {
  final AccountRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<Account>>> call(GetAllParams params) {
    return _repository.getAll(outletId: params.outletId, type: params.type);
  }
}

class GetAllParams {
  final int outletId;
  final String type;

  const GetAllParams({required this.outletId, required this.type});
}
