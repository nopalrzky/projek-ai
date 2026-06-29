import 'package:flutter/material.dart';

class CashierQuickActionsPanel extends StatelessWidget {
  const CashierQuickActionsPanel({
    super.key,
    required this.onCreateOrder,
    required this.onCheckOrders,
    required this.onCustomers,
    required this.onSetorKas,
  });

  final VoidCallback onCreateOrder;
  final VoidCallback onCheckOrders;
  final VoidCallback onCustomers;
  final VoidCallback onSetorKas;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.outlineVariant,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Aksi Cepat',
            style: theme.textTheme.titleSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _buildActionButton(
                  context: context,
                  label: 'Buat Transaksi',
                  icon: Icons.add_circle_outline_rounded,
                  onTap: onCreateOrder,
                  isPrimary: true,
                ),
                _buildActionButton(
                  context: context,
                  label: 'Cek Pesanan',
                  icon: Icons.receipt_long_rounded,
                  onTap: onCheckOrders,
                ),
                _buildActionButton(
                  context: context,
                  label: 'Pelanggan',
                  icon: Icons.people_outline_rounded,
                  onTap: onCustomers,
                ),
                _buildActionButton(
                  context: context,
                  label: 'Setor Kas',
                  icon: Icons.savings_outlined,
                  onTap: onSetorKas,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required BuildContext context,
    required String label,
    required IconData icon,
    required VoidCallback onTap,
    bool isPrimary = false,
  }) {
    if (isPrimary) {
      return FilledButton.icon(
        onPressed: onTap,
        icon: Icon(icon),
        label: Text(label),
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      );
    }
    
    return FilledButton.tonalIcon(
      onPressed: onTap,
      icon: Icon(icon),
      label: Text(label),
      style: FilledButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }
}
