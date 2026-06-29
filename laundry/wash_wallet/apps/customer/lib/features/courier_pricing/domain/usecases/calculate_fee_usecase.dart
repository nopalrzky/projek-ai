import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/courier_pricing_result.dart';
import '../repositories/courier_pricing_repository.dart';

class CalculateFeeParams extends Equatable {
  final int outletId;
  final double latitude;
  final double longitude;
  final int? customerId;
  final double? orderTotal;
  final int? addressId;

  const CalculateFeeParams({
    required this.outletId,
    required this.latitude,
    required this.longitude,
    this.customerId,
    this.orderTotal,
    this.addressId,
  });

  @override
  List<Object?> get props => [
    outletId,
    latitude,
    longitude,
    customerId,
    orderTotal,
    addressId,
  ];
}

class CalculateFeeUsecase {
  final CourierPricingRepository _repository;

  const CalculateFeeUsecase(this._repository);

  Future<Result<CourierPricingResult>> call(CalculateFeeParams params) {
    return _repository.calculateFee(
      outletId: params.outletId,
      latitude: params.latitude,
      longitude: params.longitude,
      customerId: params.customerId,
      orderTotal: params.orderTotal,
      addressId: params.addressId,
    );
  }
}
