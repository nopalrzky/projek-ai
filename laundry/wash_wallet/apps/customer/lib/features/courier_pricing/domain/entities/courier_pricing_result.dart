import 'package:equatable/equatable.dart';

class CourierPricingResult extends Equatable {
  final double distanceKm;
  final double baseFee;
  final double finalFee;
  final double customerPays;
  final double merchantSubsidy;
  final double minFee;
  final double maxFee;
  final double surgeMultiplier;
  final double nightSurcharge;
  final double weekendSurcharge;
  final String? discountSource;
  final bool isServiceable;
  final String pricingMethod;
  final String? tierApplied;
  final String? rejectionReason;

  const CourierPricingResult({
    required this.distanceKm,
    required this.baseFee,
    required this.finalFee,
    required this.customerPays,
    required this.merchantSubsidy,
    required this.minFee,
    required this.maxFee,
    required this.surgeMultiplier,
    required this.nightSurcharge,
    required this.weekendSurcharge,
    this.discountSource,
    required this.isServiceable,
    required this.pricingMethod,
    this.tierApplied,
    this.rejectionReason,
  });

  bool get isFree => customerPays == 0 && isServiceable;
  bool get hasDiscount => discountSource != null;

  @override
  List<Object?> get props => [
    distanceKm,
    baseFee,
    finalFee,
    customerPays,
    merchantSubsidy,
    minFee,
    maxFee,
    surgeMultiplier,
    nightSurcharge,
    weekendSurcharge,
    discountSource,
    isServiceable,
    pricingMethod,
    tierApplied,
    rejectionReason,
  ];
}
