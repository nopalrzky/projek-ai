import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'laundry_service_cart_summary_info.dart';

class LaundryServiceCartBottomSummary extends StatelessWidget {
  final int itemCount;
  final double subtotal;
  final double discount;
  final double total;
  final VoidCallback onContinue;

  const LaundryServiceCartBottomSummary({
    super.key,
    required this.itemCount,
    required this.subtotal,
    required this.discount,
    required this.total,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        boxShadow: [
          BoxShadow(
            color: context.colors.textTertiary.withValues(alpha: 0.08),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: LaundryServiceCartSummaryInfo(
                itemCount: itemCount,
                subtotal: subtotal,
                discount: discount,
                total: total,
              ),
            ),
            SizedBox(width: context.space.md),
            ElevatedButton(
              onPressed: onContinue,
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.lg,
                  vertical: context.space.md,
                ),
                backgroundColor: context.colors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Lanjut',
                    style: context.typography.labelLarge.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(width: context.space.sm),
                  const Icon(Icons.arrow_forward_rounded, size: 18),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
