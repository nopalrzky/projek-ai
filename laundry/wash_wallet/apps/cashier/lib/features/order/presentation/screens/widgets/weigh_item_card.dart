import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../domain/models/weigh_draft_item.dart';

class WeighItemCard extends StatelessWidget {
  final WeighDraftItem item;
  final VoidCallback onServiceTap;
  final ValueChanged<double> onQuantityChanged;
  final ValueChanged<String?> onNotesChanged;
  final VoidCallback onDelete;

  const WeighItemCard({
    super.key,
    required this.item,
    required this.onServiceTap,
    required this.onQuantityChanged,
    required this.onNotesChanged,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return AppCard(
      margin: EdgeInsets.only(bottom: context.space.md),
      size: AppCardSize.sm,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: onServiceTap,
                  borderRadius: BorderRadius.circular(context.radius.sm),
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: context.space.xs),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.categoryName,
                          style: context.typography.bodySmall.copyWith(
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                        Text(
                          item.serviceName,
                          style: context.typography.labelSmall.copyWith(
                            color: colorScheme.onSurface,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              IconButton(
                onPressed: onDelete,
                icon: Icon(Icons.delete_outline, color: colorScheme.error),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: TextFormField(
                  initialValue: _formatQuantity(item.quantity),
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
                  ],
                  decoration: InputDecoration(
                    labelText: 'Quantity',
                    suffixText: item.unitName,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                  onChanged: (value) {
                    onQuantityChanged(double.tryParse(value) ?? 0);
                  },
                  validator: (value) {
                    final quantity = double.tryParse(value ?? '');
                    if (quantity == null || quantity <= 0) {
                      return 'Quantity tidak valid';
                    }
                    final minQuantity = item.minQuantity;
                    if (minQuantity != null && quantity < minQuantity) {
                      return 'Minimal $minQuantity';
                    }
                    return null;
                  },
                ),
              ),
              SizedBox(width: context.space.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${currencyFormat.format(item.unitPrice)} / ${item.unitName}',
                      style: context.typography.bodySmall.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      textAlign: TextAlign.end,
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      currencyFormat.format(item.subtotal),
                      style: context.typography.labelMedium.copyWith(
                        color: colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.end,
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
          TextFormField(
            initialValue: item.itemNotes ?? '',
            maxLines: 2,
            decoration: InputDecoration(
              labelText: 'Catatan Item',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
            ),
            onChanged: (value) {
              final notes = value.trim();
              onNotesChanged(notes.isEmpty ? null : notes);
            },
          ),
        ],
      ),
    );
  }

  String _formatQuantity(double value) {
    if (value == value.roundToDouble()) {
      return value.toInt().toString();
    }
    return value.toString();
  }
}
