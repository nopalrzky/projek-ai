import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/deposit_repository.dart';

class UpdateParams {
  final int id;
  final int? destinationAccountId;
  final double? amount;
  final String? notes;
  final String? attachmentPath;

  const UpdateParams({
    required this.id,
    this.destinationAccountId,
    this.amount,
    this.notes,
    this.attachmentPath,
  });
}

class UpdateUsecase {
  final DepositRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<Deposit>> call(UpdateParams params) async {
    return await _repository.update(
      id: params.id,
      destinationAccountId: params.destinationAccountId,
      amount: params.amount,
      notes: params.notes,
      attachmentPath: params.attachmentPath,
    );
  }
}
