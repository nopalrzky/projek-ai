import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/category_repository.dart';

class StoreCategoryParams {
  final int outletId;
  final String name;
  final String? description;
  final bool? isActive;

  StoreCategoryParams({
    required this.outletId,
    required this.name,
    this.description,
    this.isActive,
  });
}

class StoreUsecase {
  final CategoryRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<Category>> call(StoreCategoryParams params) async {
    return await _repository.store(
      outletId: params.outletId,
      name: params.name,
      description: params.description,
      isActive: params.isActive,
    );
  }
}
