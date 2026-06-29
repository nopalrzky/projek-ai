import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/petty_cash_repository.dart';

class StoreParams {
  final double amount;
  final String description;
  final String requestDate;

  StoreParams({
    required this.amount,
    required this.description,
    required this.requestDate,
  });
}

class StoreUsecase {
  final PettyCashRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<PettyCash>> call(StoreParams params) async {
    return await _repository.store(
      amount: params.amount,
      description: params.description,
      requestDate: params.requestDate,
    );
  }
}
