import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../entities/discovery_filter.dart';
import '../entities/discovery_outlet.dart';
import '../entities/discovery_search_result.dart';
import '../entities/discovery_service.dart';

abstract class DiscoveryRepository {
  Future<Result<DiscoverySearchResult>> searchServices({
    required DiscoveryFilter filter,
    int page = 1,
    int perPage = 15,
    double? latitude,
    double? longitude,
  });

  Future<Result<List<DiscoveryService>>> getRecommendedServices({
    required String serviceSortBy,
    bool? freeShippingEligible,
    double? latitude,
    double? longitude,
    int perPage = 10,
  });

  Future<Result<List<Outlet>>> getTopOutlets({
    double? latitude,
    double? longitude,
    int perPage = 5,
  });

  Future<Result<List<DiscoveryOutlet>>> getDiscoveryOutlets({
    double? latitude,
    double? longitude,
    int page = 1,
    int perPage = 15,
  });
}
