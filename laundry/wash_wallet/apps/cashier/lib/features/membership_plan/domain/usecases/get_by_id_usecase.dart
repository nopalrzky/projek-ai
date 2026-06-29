import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/membership_plan_repository.dart';

class GetByIdUsecase {
  final MembershipPlanRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<MembershipPlan>> call(int id) async {
    return await _repository.getById(id);
  }
}
