import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/discovery_service.dart';
import '../repositories/discovery_repository.dart';

class GetRecommendedServicesUsecase {
  final DiscoveryRepository _repository;

  GetRecommendedServicesUsecase(this._repository);

  Future<Result<List<DiscoveryService>>> call({
    required String serviceSortBy,
    bool? freeShippingEligible,
    double? latitude,
    double? longitude,
    int perPage = 10,
  }) {
    return _repository.getRecommendedServices(
      serviceSortBy: serviceSortBy,
      freeShippingEligible: freeShippingEligible,
      latitude: latitude,
      longitude: longitude,
      perPage: perPage,
    );
  }
}
