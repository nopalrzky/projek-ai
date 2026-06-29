import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/category_repository.dart';

class GetAllUsecase {
  final CategoryRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<Category>>> call({
    int? outletId,
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isActive,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
    bool forceRefresh = false,
  }) {
    return _repository.getAll(
      outletId: outletId,
      page: page,
      perPage: perPage,
      search: search,
      isActive: isActive,
      sortBy: sortBy,
      sortDirection: sortDirection,
      forceRefresh: forceRefresh,
    );
  }
}
