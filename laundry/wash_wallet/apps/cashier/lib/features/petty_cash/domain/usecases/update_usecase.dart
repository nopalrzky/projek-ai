import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/petty_cash_repository.dart';

class UpdateParams {
  final int id;
  final double? amount;
  final String? description;
  final String? requestDate;

  UpdateParams({
    required this.id,
    this.amount,
    this.description,
    this.requestDate,
  });
}

class UpdateUsecase {
  final PettyCashRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<PettyCash>> call(UpdateParams params) async {
    return await _repository.update(
      id: params.id,
      amount: params.amount,
      description: params.description,
      requestDate: params.requestDate,
    );
  }
}
