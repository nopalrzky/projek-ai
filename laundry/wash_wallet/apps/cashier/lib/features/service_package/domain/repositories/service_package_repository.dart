import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class ServicePackageRepository {
  Future<Result<PaginatedData<ServicePackage>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minValidityDays,
    int? maxValidityDays,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  });

  Future<Result<ServicePackage>> getById({required int servicePackageId});
}
