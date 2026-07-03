import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../entities/unit.dart';

abstract class UnitRepository {
  Future<Result<PaginatedData<Unit>>> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    bool? isActive,
  });
}
