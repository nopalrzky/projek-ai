import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class CustomerSubscriptionListItem extends StatelessWidget {
  final CustomerSubscription subscription;
  final VoidCallback onTap;

  const CustomerSubscriptionListItem({
    super.key,
    required this.subscription,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          SizedBox(height: context.space.sm),
          _buildDivider(context),
          SizedBox(height: context.space.sm),
          _buildDetails(context),
          if (!subscription.isUnlimited &&
              subscription.remainingDays != null) ...[
            SizedBox(height: context.space.sm),
            _buildRemainingDays(context),
          ],
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                subscription.subscriptionCode,
                style: context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: context.space.xs),
              Text(
                _formatCurrency(subscription.pricePaid),
                style: context.typography.bodyLarge.copyWith(
                  color: context.colors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        _getStatusBadge(context),
      ],
    );
  }

  Widget _buildDivider(BuildContext context) {
    return Container(height: 1, color: context.colors.border);
  }

  Widget _buildDetails(BuildContext context) {
    return Column(
      children: [
        _buildDetailRow(
          context,
          Icons.calendar_today_rounded,
          'Tanggal Beli',
          _formatDate(subscription.purchaseDate),
        ),
        SizedBox(height: context.space.xs),
        _buildDetailRow(
          context,
          Icons.event_available_rounded,
          'Kadaluarsa',
          subscription.isUnlimited
              ? 'Unlimited'
              : _formatDate(subscription.expiredAt),
        ),
      ],
    );
  }

  Widget _buildDetailRow(
    BuildContext context,
    IconData icon,
    String label,
    String value,
  ) {
    return Row(
      children: [
        Icon(icon, size: 16, color: context.colors.textSecondary),
        SizedBox(width: context.space.xs),
        Text(
          label,
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: context.typography.bodySmall.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildRemainingDays(BuildContext context) {
    final days = subscription.remainingDays!;
    final isExpiringSoon = days <= 7 && days > 0;
    final color = isExpiringSoon ? context.colors.warning : context.colors.info;

    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.sm),
      ),
      child: Row(
        children: [
          Icon(
            isExpiringSoon ? Icons.warning_rounded : Icons.info_outline_rounded,
            size: 16,
            color: color,
          ),
          SizedBox(width: context.space.xs),
          Text(
            days > 0 ? 'Tersisa $days hari lagi' : 'Sudah kadaluarsa',
            style: context.typography.bodySmall.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _getStatusBadge(BuildContext context) {
    final badgeVariant = subscription.statusBadgeVariant.toLowerCase();
    final label = subscription.statusLabel;

    switch (badgeVariant) {
      case 'success':
        return AppBadge.success(label: label, size: AppBadgeSize.md);
      case 'warning':
        return AppBadge.warning(label: label, size: AppBadgeSize.md);
      case 'error':
      case 'danger':
        return AppBadge.danger(label: label, size: AppBadgeSize.md);
      case 'info':
        return AppBadge.info(label: label, size: AppBadgeSize.md);
      case 'primary':
        return AppBadge.primary(label: label, size: AppBadgeSize.md);
      default:
        return AppBadge(label: label, size: AppBadgeSize.md);
    }
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '-';
    return DateFormat('dd MMM yyyy', 'id_ID').format(date);
  }
}
