import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/membership_contract_repository.dart';

class GetByIdUsecase {
  final MembershipContractRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<MembershipContract>> call(int id) async {
    return await _repository.getById(id);
  }
}
