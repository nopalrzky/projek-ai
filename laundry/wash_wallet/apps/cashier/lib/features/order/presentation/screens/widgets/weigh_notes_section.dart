import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class WeighNotesSection extends StatelessWidget {
  final TextEditingController notesController;
  final TextEditingController internalNotesController;

  const WeighNotesSection({
    super.key,
    required this.notesController,
    required this.internalNotesController,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Catatan',
          style: context.typography.labelMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.onSurface,
          ),
        ),
        SizedBox(height: context.space.sm),
        TextFormField(
          controller: notesController,
          maxLines: 2,
          decoration: InputDecoration(
            labelText: 'Catatan Customer',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
          ),
        ),
        SizedBox(height: context.space.md),
        TextFormField(
          controller: internalNotesController,
          maxLines: 2,
          decoration: InputDecoration(
            labelText: 'Catatan Internal',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
          ),
        ),
      ],
    );
  }
}
