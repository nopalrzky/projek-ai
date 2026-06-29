import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryOutletCardSkeletonWidget extends StatelessWidget {
  const DiscoveryOutletCardSkeletonWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return AppCard.elevated(
      margin: EdgeInsets.symmetric(
        horizontal: context.space.md,
        vertical: context.space.sm,
      ),
      padding: EdgeInsets.all(context.space.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _SkeletonBox(width: 56, height: 56, radius: context.radius.lg),
              SizedBox(width: context.space.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SkeletonBox(width: double.infinity, height: 16),
                    SizedBox(height: context.space.sm),
                    _SkeletonBox(width: 180, height: 12),
                    SizedBox(height: context.space.sm),
                    _SkeletonBox(width: 220, height: 22),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
          const AppDivider.soft(),
          SizedBox(height: context.space.md),
          _SkeletonBox(width: 160, height: 16),
          SizedBox(height: context.space.sm),
          Row(
            children: [
              _SkeletonBox(width: 130, height: 112),
              SizedBox(width: context.space.sm),
              _SkeletonBox(width: 130, height: 112),
            ],
          ),
        ],
      ),
    );
  }
}

class _SkeletonBox extends StatelessWidget {
  final double width;
  final double height;
  final double? radius;

  const _SkeletonBox({required this.width, required this.height, this.radius});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: context.colors.neutralMuted.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(radius ?? context.radius.md),
      ),
    );
  }
}
