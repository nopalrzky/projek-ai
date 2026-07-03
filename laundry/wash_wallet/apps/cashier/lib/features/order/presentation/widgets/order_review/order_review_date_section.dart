import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderReviewDateSection extends StatelessWidget {
  final DateTime selectedDate;
  final VoidCallback onTap;

  const OrderReviewDateSection({
    super.key,
    required this.selectedDate,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(context.radius.md),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
        decoration: BoxDecoration(
          border: Border.all(
            color: context.colors.textSecondary.withValues(alpha: 0.5),
          ),
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, size: 20),
            SizedBox(width: context.space.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Estimasi Selesai',
                    style: context.typography.labelSmall,
                  ),
                  Text(
                    DateFormat('dd MMMM yyyy, HH:mm').format(selectedDate),
                    style: context.typography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: context.colors.textSecondary),
          ],
        ),
      ),
    );
  }
}
