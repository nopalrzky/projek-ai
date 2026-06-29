import '../../domain/entities/courier_pricing_result.dart';

class CourierPricingResultModel extends CourierPricingResult {
  const CourierPricingResultModel({
    required super.distanceKm,
    required super.baseFee,
    required super.finalFee,
    required super.customerPays,
    required super.merchantSubsidy,
    required super.minFee,
    required super.maxFee,
    required super.surgeMultiplier,
    required super.nightSurcharge,
    required super.weekendSurcharge,
    super.discountSource,
    required super.isServiceable,
    required super.pricingMethod,
    super.tierApplied,
    super.rejectionReason,
  });

  factory CourierPricingResultModel.fromJson(Map<String, dynamic> json) {
    return CourierPricingResultModel(
      distanceKm: (json['distanceKm'] as num).toDouble(),
      baseFee: (json['baseFee'] as num).toDouble(),
      finalFee: (json['finalFee'] as num).toDouble(),
      customerPays: (json['customerPays'] as num).toDouble(),
      merchantSubsidy: (json['merchantSubsidy'] as num).toDouble(),
      minFee: (json['minFee'] as num).toDouble(),
      maxFee: (json['maxFee'] as num?)?.toDouble() ?? 0,
      surgeMultiplier: (json['surgeMultiplier'] as num).toDouble(),
      nightSurcharge: (json['nightSurcharge'] as num).toDouble(),
      weekendSurcharge: (json['weekendSurcharge'] as num).toDouble(),
      discountSource: json['discountSource'] as String?,
      isServiceable: json['isServiceable'] as bool,
      pricingMethod: json['pricingMethod'] as String,
      tierApplied: json['tierApplied'] as String?,
      rejectionReason: json['rejectionReason'] as String?,
    );
  }
}
