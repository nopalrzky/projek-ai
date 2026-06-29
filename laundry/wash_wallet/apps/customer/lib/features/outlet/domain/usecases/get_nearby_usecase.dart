import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/outlet_repository.dart';

class GetNearbyUsecase {
  final OutletRepository _repository;

  GetNearbyUsecase(this._repository);

  Future<Result<List<Outlet>>> call({
    required double latitude,
    required double longitude,
    double radius = 10.0,
    int page = 1,
    int perPage = 15,
    String? search,
  }) {
    return _repository.getNearby(
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      page: page,
      perPage: perPage,
      search: search,
    );
  }
}
