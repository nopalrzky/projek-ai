import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class ExpenseCard extends StatelessWidget {
  final Expense expense;
  final VoidCallback onTap;

  const ExpenseCard({super.key, required this.expense, required this.onTap});

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
                // Header Row
                Row(
                  children: [
                    // Status Badge
                    _buildStatusBadge(context),
                    const Spacer(),
                    // Date
                    Text(
                      expense.formattedDate ?? '',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: context.space.sm),

                // Description
                Text(
                  expense.description ?? '',
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),

                SizedBox(height: context.space.xs),

                // Amount
                Text(
                  expense.formattedAmount ?? '',
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.error,
                  ),
                ),

                SizedBox(height: context.space.sm),

                Row(
                  children: [
                    if (expense.expenseAccountName != null) ...[
                      Icon(
                        Icons.category_outlined,
                        size: 16,
                        color: context.colors.textSecondary,
                      ),
                      SizedBox(width: context.space.xs),
                      Expanded(
                        child: Text(
                          expense.expenseAccountName!,
                          style: context.typography.bodySmall.copyWith(
                            color: context.colors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                    if (expense.hasAttachment) ...[
                      SizedBox(width: context.space.sm),
                      Icon(
                        Icons.attach_file_rounded,
                        size: 16,
                        color: context.colors.primary,
                      ),
                    ],
                  ],
                ),

                if (expense.employeeName != null) ...[
                  SizedBox(height: context.space.xs),
                  Row(
                    children: [
                      Icon(
                        Icons.person_outline_rounded,
                        size: 16,
                        color: context.colors.textSecondary,
                      ),
                      SizedBox(width: context.space.xs),
                      Text(
                        expense.employeeName!,
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
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

    final status = expense.status.toLowerCase();

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
            expense.statusLabel ?? '',
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
