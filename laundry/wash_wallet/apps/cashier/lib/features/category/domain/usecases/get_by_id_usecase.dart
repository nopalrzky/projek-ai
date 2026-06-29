import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/category_repository.dart';

class GetByIdUsecase {
  final CategoryRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<Category>> call({
    required int id,
    bool forceRefresh = false,
  }) {
    return _repository.getById(id: id, forceRefresh: forceRefresh);
  }
}
