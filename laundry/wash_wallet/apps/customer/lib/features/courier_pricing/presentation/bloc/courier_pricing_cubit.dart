import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/calculate_fee_usecase.dart';
import '../../domain/usecases/get_setting_summary_usecase.dart';
import 'courier_pricing_state.dart';

class CourierPricingCubit extends Cubit<CourierPricingState> {
  final CalculateFeeUsecase _calculateFeeUsecase;
  final GetSettingSummaryUsecase _getSettingSummaryUsecase;

  CourierPricingCubit({
    required CalculateFeeUsecase calculateFeeUsecase,
    required GetSettingSummaryUsecase getSettingSummaryUsecase,
  }) : _calculateFeeUsecase = calculateFeeUsecase,
       _getSettingSummaryUsecase = getSettingSummaryUsecase,
       super(const CourierPricingState());

  Future<void> calculateFee({
    required int outletId,
    required double latitude,
    required double longitude,
    int? customerId,
    double? orderTotal,
    int? addressId,
  }) async {
    emit(state.copyWith(isCalculating: true, errorMessage: null));

    final result = await _calculateFeeUsecase(
      CalculateFeeParams(
        outletId: outletId,
        latitude: latitude,
        longitude: longitude,
        customerId: customerId,
        orderTotal: orderTotal,
        addressId: addressId,
      ),
    );

    result.when(
      success: (pricing) {
        emit(state.copyWith(isCalculating: false, pricingResult: pricing));
      },
      failure: (failure) {
        emit(
          state.copyWith(isCalculating: false, errorMessage: failure.message),
        );
      },
    );
  }

  Future<void> getSettingSummary(int outletId) async {
    emit(state.copyWith(isFetchingSettings: true, errorMessage: null));

    final result = await _getSettingSummaryUsecase(outletId);

    result.when(
      success: (summary) {
        emit(
          state.copyWith(isFetchingSettings: false, settingSummary: summary),
        );
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isFetchingSettings: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  void resetPricing() {
    emit(state.copyWith(pricingResult: null));
  }
}
