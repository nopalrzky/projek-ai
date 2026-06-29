import '../../domain/entities/courier_setting_summary.dart';

class CourierSettingSummaryModel extends CourierSettingSummary {
  const CourierSettingSummaryModel({
    required super.outletId,
    required super.pricingMethod,
    super.freeRadiusKm,
    required super.freeShippingEnabled,
    super.unconditionalFreeShippingEnabled = false,
    super.minOrderFreeShipping,
    required super.disabledDays,
  });

  factory CourierSettingSummaryModel.fromJson(Map<String, dynamic> json) {
    return CourierSettingSummaryModel(
      outletId: json['outletId'] as int,
      pricingMethod: json['pricingMethod'] as String,
      freeRadiusKm: (json['freeRadiusKm'] as num?)?.toDouble(),
      freeShippingEnabled: json['freeShippingEnabled'] as bool,
      unconditionalFreeShippingEnabled:
          json['unconditionalFreeShippingEnabled'] as bool? ??
          json['unconditional_free_shipping_enabled'] as bool? ??
          false,
      minOrderFreeShipping: (json['minOrderFreeShipping'] as num?)?.toDouble(),
      disabledDays: List<String>.from(json['disabledDays'] as List),
    );
  }
}
