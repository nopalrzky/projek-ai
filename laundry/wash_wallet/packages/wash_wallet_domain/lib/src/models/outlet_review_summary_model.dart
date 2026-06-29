import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/outlet_review_summary.dart';

part 'outlet_review_summary_model.freezed.dart';

@freezed
class OutletReviewSummaryModel with _$OutletReviewSummaryModel {
  const OutletReviewSummaryModel._();

  const factory OutletReviewSummaryModel({
    required double averageRating,
    required int totalReviews,
    required Map<int, int> ratingDistribution,
  }) = _OutletReviewSummaryModel;

  factory OutletReviewSummaryModel.fromJson(Map<String, dynamic> json) {
    final rawDistribution =
        json['ratingDistribution'] ??
        json['rating_distribution'] ??
        <String, dynamic>{};
    final Map<int, int> distribution = {};
    rawDistribution.forEach((key, value) {
      final intKey = int.tryParse(key.toString());
      if (intKey != null) {
        distribution[intKey] = int.parse(value.toString());
      }
    });

    return OutletReviewSummaryModel(
      averageRating:
          double.tryParse(
            json['averageRating']?.toString() ??
                json['average_rating']?.toString() ??
                '0',
          ) ??
          0.0,
      totalReviews:
          int.tryParse(
            json['totalReviews']?.toString() ??
                json['total_reviews']?.toString() ??
                '0',
          ) ??
          0,
      ratingDistribution: distribution,
    );
  }

  factory OutletReviewSummaryModel.fromEntity(OutletReviewSummary entity) =>
      OutletReviewSummaryModel(
        averageRating: entity.averageRating,
        totalReviews: entity.totalReviews,
        ratingDistribution: entity.ratingDistribution,
      );

  OutletReviewSummary toEntity() => OutletReviewSummary(
    averageRating: averageRating,
    totalReviews: totalReviews,
    ratingDistribution: ratingDistribution,
  );
}
