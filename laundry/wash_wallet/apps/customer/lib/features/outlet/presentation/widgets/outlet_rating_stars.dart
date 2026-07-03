import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OutletRatingStars extends StatelessWidget {
  final double rating;
  final double iconSize;
  final Color? color;

  const OutletRatingStars({
    super.key,
    required this.rating,
    this.iconSize = 16.0,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = color ?? Colors.amber;
    final inactiveColor = context.colors.textTertiary.withValues(alpha: 0.3);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        if (rating >= starValue) {
          return Icon(Icons.star_rounded, size: iconSize, color: activeColor);
        } else if (rating >= starValue - 0.5) {
          return Icon(
            Icons.star_half_rounded,
            size: iconSize,
            color: activeColor,
          );
        } else {
          return Icon(Icons.star_rounded, size: iconSize, color: inactiveColor);
        }
      }),
    );
  }
}
