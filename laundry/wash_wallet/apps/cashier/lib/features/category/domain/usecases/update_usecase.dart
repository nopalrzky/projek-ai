import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/category_repository.dart';

class UpdateCategoryParams {
  final int id;
  final String? name;
  final String? description;
  final bool? isActive;
  final int? outletId;

  UpdateCategoryParams({
    required this.id,
    this.name,
    this.description,
    this.isActive,
    this.outletId,
  });
}

class UpdateUsecase {
  final CategoryRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<Category>> call(UpdateCategoryParams params) async {
    return await _repository.update(
      id: params.id,
      name: params.name,
      description: params.description,
      isActive: params.isActive,
      outletId: params.outletId,
    );
  }
}
