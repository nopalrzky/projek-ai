import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class HomeHeader extends StatelessWidget {
  final String addressLabel;
  final String addressValue;
  final Future<void> Function()? onAddressTap;

  const HomeHeader({
    super.key,
    required this.addressLabel,
    required this.addressValue,
    this.onAddressTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: InkWell(
            borderRadius: BorderRadius.circular(context.radius.md),
            onTap: () async {
              if (onAddressTap != null) {
                await onAddressTap!();
                return;
              }

              await context.push('/customer-addresses');
            },
            child: Padding(
              padding: EdgeInsets.symmetric(
                vertical: context.space.xs,
                horizontal: context.space.xs,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          addressLabel,
                          style: context.typography.labelSmall.copyWith(
                            color: context.colors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: context.space.xs),
                        Text(
                          addressValue,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: context.typography.bodyMedium.copyWith(
                            color: context.colors.textPrimary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: context.space.xs),
                  Icon(
                    Icons.keyboard_arrow_down_rounded,
                    size: 18,
                    color: context.colors.textSecondary,
                  ),
                ],
              ),
            ),
          ),
        ),
        SizedBox(width: context.space.sm),
        _HeaderActionButton(icon: Icons.chat_bubble_outline_rounded),
        SizedBox(width: context.space.xs),
        _HeaderActionButton(icon: Icons.notifications_none_rounded),
        SizedBox(width: context.space.xs),
        _HeaderActionButton(icon: Icons.shopping_cart_outlined, badgeText: '2'),
      ],
    );
  }
}

class _HeaderActionButton extends StatelessWidget {
  final IconData icon;
  final String? badgeText;

  const _HeaderActionButton({required this.icon, this.badgeText});

  @override
  Widget build(BuildContext context) {
    final iconSize = context.space.xl + context.space.xs;

    return SizedBox(
      width: context.space.xxl * 2,
      height: context.space.xxl * 2,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: context.colors.surface,
                border: Border.all(color: context.colors.border),
                borderRadius: BorderRadius.circular(context.radius.lg),
              ),
              child: Icon(
                icon,
                size: iconSize,
                color: context.colors.textPrimary,
              ),
            ),
          ),
          if (badgeText != null)
            Positioned(
              right: -context.space.xs,
              top: -context.space.xs,
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.xs,
                  vertical: context.space.xs / 2,
                ),
                decoration: BoxDecoration(
                  color: context.colors.error,
                  borderRadius: BorderRadius.circular(context.radius.full),
                  border: Border.all(color: context.colors.surface, width: 1),
                ),
                constraints: BoxConstraints(
                  minWidth: context.space.lg,
                  minHeight: context.space.lg,
                ),
                child: Text(
                  badgeText!,
                  textAlign: TextAlign.center,
                  style: context.typography.labelSmall.copyWith(
                    color: context.colors.onError,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
