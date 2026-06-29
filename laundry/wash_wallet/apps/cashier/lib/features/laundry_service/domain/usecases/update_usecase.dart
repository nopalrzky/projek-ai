import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/laundry_service_repository.dart';

class UpdateParams {
  final int id;
  final int? unitId;
  final int? categoryId;
  final String? name;
  final String? description;
  final double? price;
  final int? durationHours;
  final int? minQuantity;
  final bool? isActive;

  UpdateParams({
    required this.id,
    this.unitId,
    this.categoryId,
    this.name,
    this.description,
    this.price,
    this.durationHours,
    this.minQuantity,
    this.isActive,
  });
}

class UpdateUsecase {
  final LaundryServiceRepository _repository;

  UpdateUsecase(this._repository);

  Future<Result<LaundryService>> call(UpdateParams params) async {
    return await _repository.update(
      id: params.id,
      unitId: params.unitId,
      categoryId: params.categoryId,
      name: params.name,
      description: params.description,
      price: params.price,
      durationHours: params.durationHours,
      minQuantity: params.minQuantity,
      isActive: params.isActive,
    );
  }
}
