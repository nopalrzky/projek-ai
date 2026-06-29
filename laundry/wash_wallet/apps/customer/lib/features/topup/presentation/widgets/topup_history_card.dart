import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:intl/intl.dart';

class TopupHistoryCard extends StatelessWidget {
  final CustomerTopup topup;
  final VoidCallback onTap;

  const TopupHistoryCard({super.key, required this.topup, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return AppCard.elevated(
      child: ListTile(
        onTap: onTap,
        leading: _buildIcon(context),
        title: Text(
          'Topup Saldo',
          style: context.typography.bodyLarge.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Text(
          DateFormat('dd MMM yyyy, HH:mm').format(topup.createdAt!),
          style: context.typography.bodySmall,
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'Rp ${topup.amount}',
              style: context.typography.bodyLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: _getStatusColor(context),
              ),
            ),
            _buildStatusBadge(context),
          ],
        ),
      ),
    );
  }

  Widget _buildIcon(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: context.colors.primarySurface,
        shape: BoxShape.circle,
      ),
      child: Icon(Icons.add_card_rounded, color: context.colors.primary),
    );
  }

  Widget _buildStatusBadge(BuildContext context) {
    switch (topup.status) {
      case 'success':
        return AppBadge.success(label: 'Selesai', size: AppBadgeSize.sm);
      case 'failed':
        return AppBadge.danger(label: 'Gagal', size: AppBadgeSize.sm);
      default:
        return AppBadge.warning(label: 'Menunggu', size: AppBadgeSize.sm);
    }
  }

  Color _getStatusColor(BuildContext context) {
    switch (topup.status) {
      case 'success':
        return context.colors.success;
      case 'failed':
        return context.colors.error;
      default:
        return context.colors.warning;
    }
  }
}
