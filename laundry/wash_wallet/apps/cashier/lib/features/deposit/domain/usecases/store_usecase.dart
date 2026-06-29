import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/deposit_repository.dart';

class StoreParams {
  final int destinationAccountId;
  final double amount;
  final String? notes;
  final String? attachmentPath;

  StoreParams({
    required this.destinationAccountId,
    required this.amount,
    this.notes,
    this.attachmentPath,
  });
}

class StoreUsecase {
  final DepositRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<Deposit>> call(StoreParams params) async {
    return await _repository.store(
      destinationAccountId: params.destinationAccountId,
      amount: params.amount,
      notes: params.notes,
      attachmentPath: params.attachmentPath,
    );
  }
}
