import 'package:equatable/equatable.dart';

class OutletReviewSummary extends Equatable {
  final double averageRating;
  final int totalReviews;
  final Map<int, int> ratingDistribution;

  const OutletReviewSummary({
    required this.averageRating,
    required this.totalReviews,
    required this.ratingDistribution,
  });

  @override
  List<Object?> get props => [averageRating, totalReviews, ratingDistribution];
}
