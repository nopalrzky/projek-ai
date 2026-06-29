import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'outlet_info_review_item_widget.dart';

class OutletInfoReviewsListWidget extends StatelessWidget {
  final List<OrderReview> reviews;

  const OutletInfoReviewsListWidget({super.key, required this.reviews});

  @override
  Widget build(BuildContext context) {
    if (reviews.isEmpty) {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: context.space.xl),
        child: const Center(
          child: AppEmptyState(
            title: 'Belum Ada Ulasan',
            description:
                'Jadilah yang pertama memberikan ulasan untuk outlet ini.',
          ),
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: reviews.length,
      separatorBuilder: (context, index) => SizedBox(height: context.space.sm),
      itemBuilder: (context, index) {
        return OutletInfoReviewItemWidget(review: reviews[index]);
      },
    );
  }
}
