import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/discovery_outlet.dart';
import '../repositories/discovery_repository.dart';

class GetDiscoveryOutletsUsecase {
  final DiscoveryRepository _repository;

  GetDiscoveryOutletsUsecase(this._repository);

  Future<Result<List<DiscoveryOutlet>>> call({
    double? latitude,
    double? longitude,
    int page = 1,
    int perPage = 15,
  }) {
    return _repository.getDiscoveryOutlets(
      latitude: latitude,
      longitude: longitude,
      page: page,
      perPage: perPage,
    );
  }
}
