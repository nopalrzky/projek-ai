import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/outlet_repository.dart';

class GetAllUsecase {
  final OutletRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<Outlet>>> call({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isExposure,
    String? status,
    int? provinceId,
    int? cityId,
    int? districtId,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    double? latitude,
    double? longitude,
  }) {
    return _repository.getAll(
      page: page,
      perPage: perPage,
      search: search,
      isExposure: isExposure,
      status: status,
      provinceId: provinceId,
      cityId: cityId,
      districtId: districtId,
      sortBy: sortBy,
      sortDirection: sortDirection,
      latitude: latitude,
      longitude: longitude,
    );
  }
}
