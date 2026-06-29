import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ProfileQuickActionsWidget extends StatelessWidget {
  const ProfileQuickActionsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _QuickAction(
        label: 'Alamat',
        icon: Icons.location_on_outlined,
        onTap: () => context.push('/customer-addresses'),
      ),
      _QuickAction(
        label: 'Pesanan',
        icon: Icons.receipt_long_outlined,
        onTap: () => context.push('/orders'),
      ),
      _QuickAction(
        label: 'Promo',
        icon: Icons.local_offer_outlined,
        onTap: () => context.push('/promos'),
      ),
      _QuickAction(
        label: 'Topup',
        icon: Icons.add_card_outlined,
        onTap: () => context.push('/topup/create'),
      ),
    ];

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: AppCard(
        child: Row(
          children: [
            for (final action in actions)
              Expanded(child: _QuickActionItem(action: action)),
          ],
        ),
      ),
    );
  }
}

class _QuickAction {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _QuickAction({
    required this.label,
    required this.icon,
    required this.onTap,
  });
}

class _QuickActionItem extends StatelessWidget {
  final _QuickAction action;

  const _QuickActionItem({required this.action});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: action.onTap,
      borderRadius: BorderRadius.circular(context.radius.md),
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: context.space.sm),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(action.icon, color: context.colors.primary),
            SizedBox(height: context.space.xs),
            Text(
              action.label,
              style: context.typography.labelSmall.copyWith(
                color: context.colors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
