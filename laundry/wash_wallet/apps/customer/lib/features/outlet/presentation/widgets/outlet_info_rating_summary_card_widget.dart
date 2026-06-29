import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'outlet_rating_stars.dart';

class OutletInfoRatingSummaryCardWidget extends StatelessWidget {
  final OutletReviewSummary summary;
  final int? activeRatingFilter;
  final ValueChanged<int> onStarTap;

  const OutletInfoRatingSummaryCardWidget({
    super.key,
    required this.summary,
    required this.activeRatingFilter,
    required this.onStarTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard.outlined(
      margin: EdgeInsets.zero,
      backgroundColor: context.colors.surfaceVariant.withValues(alpha: 0.3),
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              flex: 2,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    summary.averageRating.toStringAsFixed(1),
                    style: context.typography.displayLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.space.xxs),
                  OutletRatingStars(
                    rating: summary.averageRating,
                    iconSize: 18,
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    '${summary.totalReviews} ulasan',
                    style: context.typography.labelSmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            Container(
              width: 1,
              height: 100,
              color: context.colors.border,
              margin: EdgeInsets.symmetric(horizontal: context.space.md),
            ),
            Expanded(
              flex: 3,
              child: Column(
                children: List.generate(5, (index) {
                  final starNum = 5 - index;
                  final count = summary.ratingDistribution[starNum] ?? 0;
                  final total = summary.totalReviews;
                  final ratio = total > 0 ? count / total : 0.0;
                  final isSelected = activeRatingFilter == starNum;

                  return InkWell(
                    onTap: () => onStarTap(starNum),
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        vertical: context.space.xxs,
                      ),
                      child: Row(
                        children: [
                          Text(
                            '$starNum',
                            style: context.typography.bodySmall.copyWith(
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? context.colors.primary
                                  : context.colors.textPrimary,
                            ),
                          ),
                          SizedBox(width: context.space.xs),
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(
                                context.radius.full,
                              ),
                              child: LinearProgressIndicator(
                                value: ratio,
                                backgroundColor: context.colors.border,
                                color: isSelected
                                    ? context.colors.primary
                                    : Colors.amber,
                                minHeight: 8,
                              ),
                            ),
                          ),
                          SizedBox(width: context.space.xs),
                          SizedBox(
                            width: 24,
                            child: Text(
                              '$count',
                              style: context.typography.labelSmall.copyWith(
                                color: isSelected
                                    ? context.colors.primary
                                    : context.colors.textSecondary,
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                              textAlign: TextAlign.end,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
