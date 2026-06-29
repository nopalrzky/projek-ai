import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/outlet_repository.dart';

class GetByIdUsecase {
  final OutletRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<Outlet>> call({
    required int id,
    double? latitude,
    double? longitude,
  }) {
    return _repository.getById(
      id: id,
      latitude: latitude,
      longitude: longitude,
    );
  }
}
