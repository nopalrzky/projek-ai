import 'package:equatable/equatable.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderReviewState extends Equatable {
  // List + pagination
  final List<OrderReview> reviews;
  final bool isLoadingReviews;
  final int currentPage;
  final bool hasReachedMax;

  // Detail
  final OrderReview? selectedReview;
  final bool isLoadingDetail;

  // Summary
  final OutletReviewSummary? summary;
  final bool isLoadingSummary;

  // Active filter
  final int? ratingFilter; // null = semua, 1-5 = filter bintang

  // Error
  final String? errorMessage;

  const OrderReviewState({
    this.reviews = const [],
    this.isLoadingReviews = false,
    this.currentPage = 1,
    this.hasReachedMax = false,
    this.selectedReview,
    this.isLoadingDetail = false,
    this.summary,
    this.isLoadingSummary = false,
    this.ratingFilter,
    this.errorMessage,
  });

  OrderReviewState copyWith({
    List<OrderReview>? reviews,
    bool? isLoadingReviews,
    int? currentPage,
    bool? hasReachedMax,
    OrderReview? selectedReview,
    bool? isLoadingDetail,
    OutletReviewSummary? summary,
    bool? isLoadingSummary,
    int? ratingFilter,
    String? errorMessage,
    bool clearSelectedReview = false,
    bool clearRatingFilter = false,
    bool clearErrorMessage = false,
  }) {
    return OrderReviewState(
      reviews: reviews ?? this.reviews,
      isLoadingReviews: isLoadingReviews ?? this.isLoadingReviews,
      currentPage: currentPage ?? this.currentPage,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      selectedReview: clearSelectedReview
          ? null
          : (selectedReview ?? this.selectedReview),
      isLoadingDetail: isLoadingDetail ?? this.isLoadingDetail,
      summary: summary ?? this.summary,
      isLoadingSummary: isLoadingSummary ?? this.isLoadingSummary,
      ratingFilter: clearRatingFilter
          ? null
          : (ratingFilter ?? this.ratingFilter),
      errorMessage: clearErrorMessage
          ? null
          : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  List<Object?> get props => [
    reviews,
    isLoadingReviews,
    currentPage,
    hasReachedMax,
    selectedReview,
    isLoadingDetail,
    summary,
    isLoadingSummary,
    ratingFilter,
    errorMessage,
  ];
}
