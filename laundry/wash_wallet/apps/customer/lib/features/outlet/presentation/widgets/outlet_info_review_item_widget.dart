import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'outlet_rating_stars.dart';

class OutletInfoReviewItemWidget extends StatelessWidget {
  final OrderReview review;

  const OutletInfoReviewItemWidget({super.key, required this.review});

  @override
  Widget build(BuildContext context) {
    final formattedDate = review.formattedCreatedAt ?? '';

    return AppCard.outlined(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: context.colors.primaryContainer,
                  child: Text(
                    review.maskedName != null && review.maskedName!.isNotEmpty
                        ? review.maskedName!.substring(0, 1).toUpperCase()
                        : 'U',
                    style: context.typography.titleMedium.copyWith(
                      color: context.colors.primaryContainer,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review.maskedName ?? 'Pelanggan',
                        style: context.typography.headlineSmall.copyWith(
                          fontWeight: FontWeight.bold,
                          color: context.colors.textPrimary,
                        ),
                      ),
                      SizedBox(height: context.space.xxs),
                      Row(
                        children: [
                          OutletRatingStars(
                            rating: review.rating.toDouble(),
                            iconSize: 14,
                          ),
                          SizedBox(width: context.space.sm),
                          Text(
                            formattedDate,
                            style: context.typography.labelSmall.copyWith(
                              color: context.colors.textTertiary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (review.comment != null && review.comment!.isNotEmpty) ...[
              SizedBox(height: context.space.sm),
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(context.space.sm),
                decoration: BoxDecoration(
                  color: context.colors.surfaceVariant.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(context.radius.sm),
                ),
                child: Text(
                  review.comment!,
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
