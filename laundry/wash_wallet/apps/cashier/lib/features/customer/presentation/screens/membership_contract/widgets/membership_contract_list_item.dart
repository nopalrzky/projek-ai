import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class MembershipContractListItem extends StatelessWidget {
  final MembershipContract contract;
  final VoidCallback onTap;

  const MembershipContractListItem({
    super.key,
    required this.contract,
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
          SizedBox(height: context.space.sm),
          _buildFooter(context),
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
                contract.membershipPlan?.name ?? 'Plan tidak tersedia',
                style: context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: context.space.xs),
              Text(
                'ID: ${contract.id}',
                style: context.typography.bodySmall.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        _getStatusBadge(contract.status),
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
          'Mulai',
          _formatDate(contract.startAt),
        ),
        SizedBox(height: context.space.xs),
        _buildDetailRow(
          context,
          Icons.event_rounded,
          'Berakhir',
          _formatDate(contract.expiredAt),
        ),
        if (contract.upgradeFromId != null) ...[
          SizedBox(height: context.space.xs),
          _buildDetailRow(
            context,
            Icons.upgrade_rounded,
            'Upgrade dari',
            '#${contract.upgradeFromId}',
          ),
        ],
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
        SizedBox(width: context.space.xs),
        Text(
          ':',
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        SizedBox(width: context.space.xs),
        Expanded(
          child: Text(
            value,
            style: context.typography.bodySmall.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Total Dibayar',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            Text(
              contract.formattedTotalPaid ?? 'Rp ${contract.totalPaid}',
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.primary,
              ),
            ),
          ],
        ),
        if (contract.membershipPlan != null &&
            contract.membershipPlan!.discountPercentage > 0)
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: context.space.sm,
              vertical: context.space.xs,
            ),
            decoration: BoxDecoration(
              color: context.colors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(context.radius.sm),
            ),
            child: Text(
              '${contract.membershipPlan!.discountPercentage}% OFF',
              style: context.typography.bodySmall.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.success,
              ),
            ),
          ),
      ],
    );
  }

  Widget _getStatusBadge(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return AppBadge.success(label: 'Aktif', size: AppBadgeSize.md);
      case 'expired':
        return AppBadge.danger(label: 'Kedaluwarsa', size: AppBadgeSize.md);
      case 'replaced':
        return AppBadge(label: 'Diganti', size: AppBadgeSize.md);
      default:
        return AppBadge(label: status, size: AppBadgeSize.md);
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '-';
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return dateStr;
    }
  }
}
