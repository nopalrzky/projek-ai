import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderNotesCard extends StatelessWidget {
  final String notes;

  const OrderNotesCard({super.key, required this.notes});

  @override
  Widget build(BuildContext context) {
    if (notes.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.note_alt, color: Colors.amber[700], size: 20),
              SizedBox(width: context.space.sm),
              Text(
                'Notes',
                style: context.typography.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.amber[700],
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.sm),
          Text(
            notes,
            style: context.typography.bodyMedium.copyWith(
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }
}
