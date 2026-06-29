import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_cashier/features/home/presentation/widgets/quick_action_grid.dart';
import 'package:wash_wallet_cashier/features/home/presentation/widgets/quick_action_item.dart';

class QuickActionsSection extends StatelessWidget {
  final VoidCallback onCreateTransaction;
  final VoidCallback onViewTransactions;
  final VoidCallback onManageCustomers;
  final VoidCallback onManageFinances;

  const QuickActionsSection({
    super.key,
    required this.onCreateTransaction,
    required this.onViewTransactions,
    required this.onManageCustomers,
    required this.onManageFinances,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Title
        Padding(
          padding: EdgeInsets.symmetric(horizontal: context.space.md),
          child: Text(
            'Aksi Cepat',
            style: context.typography.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textPrimary,
            ),
          ),
        ),

        SizedBox(height: context.space.md),

        QuickActionGrid(
          items: [
            QuickActionItem(
              icon: Icons.add_shopping_cart,
              label: 'Buat Transaksi',
              color: context.colors.primary,
              onTap: onCreateTransaction,
            ),
            QuickActionItem(
              icon: Icons.list_alt,
              label: 'Cek Pesanan',
              color: context.colors.info,
              onTap: onViewTransactions,
            ),
            QuickActionItem(
              icon: Icons.people_outline,
              label: 'Customer',
              color: context.colors.success,
              onTap: onManageCustomers,
            ),
            QuickActionItem(
              icon: Icons.upload_rounded,
              label: 'Setor Kas',
              color: context.colors.warning,
              onTap: onManageFinances,
            ),
          ],
        ),
      ],
    );
  }
}

