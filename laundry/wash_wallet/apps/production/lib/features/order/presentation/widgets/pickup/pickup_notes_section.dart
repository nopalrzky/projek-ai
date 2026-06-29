import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PickupNotesSection extends StatelessWidget {
  final Order order;

  const PickupNotesSection({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final notes = order.notes?.trim();
    if (notes == null || notes.isEmpty) return const SizedBox.shrink();

    return AppCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.note_outlined, color: context.colors.textSecondary),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Catatan Customer',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(notes, style: context.typography.bodyMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
