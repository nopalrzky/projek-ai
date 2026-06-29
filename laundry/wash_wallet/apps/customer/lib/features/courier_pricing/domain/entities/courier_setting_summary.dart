import 'package:equatable/equatable.dart';

class CourierSettingSummary extends Equatable {
  final int outletId;
  final String pricingMethod;
  final double? freeRadiusKm;
  final bool freeShippingEnabled;
  final bool unconditionalFreeShippingEnabled;
  final double? minOrderFreeShipping;
  final List<String> disabledDays;

  const CourierSettingSummary({
    required this.outletId,
    required this.pricingMethod,
    this.freeRadiusKm,
    required this.freeShippingEnabled,
    this.unconditionalFreeShippingEnabled = false,
    this.minOrderFreeShipping,
    required this.disabledDays,
  });

  bool isDayDisabled(String dayOfWeek) =>
      disabledDays.contains(dayOfWeek.toLowerCase());

  @override
  List<Object?> get props => [
    outletId,
    pricingMethod,
    freeRadiusKm,
    freeShippingEnabled,
    unconditionalFreeShippingEnabled,
    minOrderFreeShipping,
    disabledDays,
  ];
}
