import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../repositories/laundry_service_repository.dart';

class StoreParams {
  final int unitId;
  final int categoryId;
  final String name;
  final String? description;
  final double price;
  final int durationHours;
  final int minQuantity;
  final bool isActive;

  StoreParams({
    required this.unitId,
    required this.categoryId,
    required this.name,
    this.description,
    required this.price,
    required this.durationHours,
    this.minQuantity = 1,
    this.isActive = true,
  });
}

class StoreUsecase {
  final LaundryServiceRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<LaundryService>> call(StoreParams params) async {
    return await _repository.store(
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
