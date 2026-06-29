import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_order_review_summary_usecase.dart';
import 'order_review_state.dart';

class OrderReviewCubit extends Cubit<OrderReviewState> {
  final GetAllOrderReviewUseCase _getAllUseCase;
  final GetOrderReviewByIdUseCase _getByIdUseCase;
  final GetOrderReviewSummaryUseCase _getSummaryUseCase;

  OrderReviewCubit({
    required GetAllOrderReviewUseCase getAllUseCase,
    required GetOrderReviewByIdUseCase getByIdUseCase,
    required GetOrderReviewSummaryUseCase getSummaryUseCase,
  }) : _getAllUseCase = getAllUseCase,
       _getByIdUseCase = getByIdUseCase,
       _getSummaryUseCase = getSummaryUseCase,
       super(const OrderReviewState());

  // Filter bintang — reset ke page 1 saat berubah
  void setRatingFilter(
    int? rating, {
    int? outletId,
    int? customerAccountId,
    int? orderId,
  }) {
    emit(
      state.copyWith(
        ratingFilter: rating,
        clearRatingFilter: rating == null,
        currentPage: 1,
        hasReachedMax: false,
      ),
    );
    getAll(
      outletId: outletId,
      customerAccountId: customerAccountId,
      orderId: orderId,
      page: 1,
      isRefresh: true,
    );
  }

  // Paginated fetch — page 1 = replace, page > 1 = append
  Future<void> getAll({
    int? outletId,
    int? customerAccountId,
    int? orderId,
    int page = 1,
    bool isRefresh = false,
  }) async {
    if (state.hasReachedMax && !isRefresh && page > 1) return;

    if (page == 1 || isRefresh) {
      emit(
        state.copyWith(
          isLoadingReviews: true,
          errorMessage: null,
          hasReachedMax: false,
          currentPage: 1,
        ),
      );
    } else {
      emit(state.copyWith(isLoadingReviews: true, errorMessage: null));
    }

    final result = await _getAllUseCase(
      GetAllOrderReviewParams(
        outletId: outletId,
        customerAccountId: customerAccountId,
        orderId: orderId,
        rating: state.ratingFilter,
        page: page,
        perPage: 15,
      ),
    );

    result.when(
      success: (reviews) {
        emit(
          state.copyWith(
            isLoadingReviews: false,
            reviews: page == 1 || isRefresh
                ? reviews
                : [...state.reviews, ...reviews],
            hasReachedMax: reviews.isEmpty || reviews.length < 15,
            currentPage: page,
          ),
        );
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isLoadingReviews: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  // Detail
  Future<void> getById(int id) async {
    emit(state.copyWith(isLoadingDetail: true, errorMessage: null));

    final result = await _getByIdUseCase(id);

    result.when(
      success: (review) {
        emit(state.copyWith(isLoadingDetail: false, selectedReview: review));
      },
      failure: (failure) {
        emit(
          state.copyWith(isLoadingDetail: false, errorMessage: failure.message),
        );
      },
    );
  }

  // Summary
  Future<void> getSummary(int outletId) async {
    emit(state.copyWith(isLoadingSummary: true, errorMessage: null));

    final result = await _getSummaryUseCase(outletId: outletId);

    result.when(
      success: (summary) {
        emit(state.copyWith(isLoadingSummary: false, summary: summary));
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isLoadingSummary: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  // Combined: dipakai oleh OutletInfoScreen
  Future<void> getReviewsAndSummary({required int outletId}) async {
    emit(
      state.copyWith(
        isLoadingReviews: true,
        isLoadingSummary: true,
        errorMessage: null,
        currentPage: 1,
        hasReachedMax: false,
      ),
    );

    await Future.wait([
      getSummary(outletId),
      getAll(outletId: outletId, page: 1, isRefresh: true),
    ]);
  }
}
