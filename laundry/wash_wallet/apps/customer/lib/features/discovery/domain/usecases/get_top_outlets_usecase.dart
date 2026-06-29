import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/discovery_repository.dart';

class GetTopOutletsUsecase {
  final DiscoveryRepository _repository;

  GetTopOutletsUsecase(this._repository);

  Future<Result<List<Outlet>>> call({
    double? latitude,
    double? longitude,
    int perPage = 5,
  }) {
    return _repository.getTopOutlets(
      latitude: latitude,
      longitude: longitude,
      perPage: perPage,
    );
  }
}
