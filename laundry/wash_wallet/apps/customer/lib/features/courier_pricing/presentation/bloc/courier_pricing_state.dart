import 'package:equatable/equatable.dart';
import '../../domain/entities/courier_pricing_result.dart';
import '../../domain/entities/courier_setting_summary.dart';

class CourierPricingState extends Equatable {
  final bool isCalculating;
  final bool isFetchingSettings;
  final CourierPricingResult? pricingResult;
  final CourierSettingSummary? settingSummary;
  final String? errorMessage;

  const CourierPricingState({
    this.isCalculating = false,
    this.isFetchingSettings = false,
    this.pricingResult,
    this.settingSummary,
    this.errorMessage,
  });

  CourierPricingState copyWith({
    bool? isCalculating,
    bool? isFetchingSettings,
    CourierPricingResult? pricingResult,
    CourierSettingSummary? settingSummary,
    String? errorMessage,
  }) {
    return CourierPricingState(
      isCalculating: isCalculating ?? this.isCalculating,
      isFetchingSettings: isFetchingSettings ?? this.isFetchingSettings,
      pricingResult: pricingResult ?? this.pricingResult,
      settingSummary: settingSummary ?? this.settingSummary,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
    isCalculating,
    isFetchingSettings,
    pricingResult,
    settingSummary,
    errorMessage,
  ];
}
