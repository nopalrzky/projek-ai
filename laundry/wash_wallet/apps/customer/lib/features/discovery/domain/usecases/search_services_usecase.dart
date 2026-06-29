import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/discovery_filter.dart';
import '../entities/discovery_search_result.dart';
import '../repositories/discovery_repository.dart';

class SearchServicesUsecase {
  final DiscoveryRepository _repository;

  SearchServicesUsecase(this._repository);

  Future<Result<DiscoverySearchResult>> call({
    required DiscoveryFilter filter,
    int page = 1,
    int perPage = 15,
    double? latitude,
    double? longitude,
  }) {
    return _repository.searchServices(
      filter: filter,
      page: page,
      perPage: perPage,
      latitude: latitude,
      longitude: longitude,
    );
  }
}
