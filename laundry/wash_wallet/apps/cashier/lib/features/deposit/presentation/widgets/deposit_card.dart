import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class DepositCard extends StatelessWidget {
  final Deposit deposit;
  final VoidCallback onTap;

  const DepositCard({super.key, required this.deposit, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(
          color: context.colors.border.withValues(alpha: 0.1),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: context.colors.border.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(context.radius.md),
          child: Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _buildStatusBadge(context),
                    const Spacer(),
                    Text(
                      deposit.createdAtHuman ?? '',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: context.space.sm),

                Text(
                  deposit.code,
                  style: context.typography.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                ),

                SizedBox(height: context.space.xs),

                Text(
                  deposit.formattedAmount ?? '',
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.primary,
                  ),
                ),

                if (deposit.cashierName != null) ...[
                  SizedBox(height: context.space.sm),
                  Row(
                    children: [
                      Icon(
                        Icons.person_outline_rounded,
                        size: 16,
                        color: context.colors.textSecondary,
                      ),
                      SizedBox(width: context.space.xs),
                      Text(
                        deposit.cashierName!,
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],

                if (deposit.notes != null && deposit.notes!.isNotEmpty) ...[
                  SizedBox(height: context.space.xs),
                  Text(
                    deposit.notes!,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    IconData icon;

    final status = deposit.status.toLowerCase();

    if (status == 'pending') {
      backgroundColor = context.colors.warning.withValues(alpha: 0.1);
      textColor = context.colors.warning;
      icon = Icons.pending_rounded;
    } else if (status == 'approved') {
      backgroundColor = context.colors.success.withValues(alpha: 0.1);
      textColor = context.colors.success;
      icon = Icons.check_circle_rounded;
    } else if (status == 'rejected') {
      backgroundColor = context.colors.error.withValues(alpha: 0.1);
      textColor = context.colors.error;
      icon = Icons.cancel_rounded;
    } else {
      backgroundColor = context.colors.border.withValues(alpha: 0.1);
      textColor = context.colors.textSecondary;
      icon = Icons.help_outline_rounded;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.sm,
        vertical: context.space.xs,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(context.radius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: textColor),
          SizedBox(width: context.space.xs),
          Text(
            deposit.statusLabel,
            style: context.typography.bodySmall.copyWith(
              color: textColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
