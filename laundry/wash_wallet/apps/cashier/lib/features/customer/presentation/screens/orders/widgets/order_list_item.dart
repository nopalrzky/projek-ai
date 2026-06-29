import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderListItem extends StatelessWidget {
  final Order order;
  final VoidCallback onTap;

  const OrderListItem({super.key, required this.order, required this.onTap});

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
                order.orderNumber,
                style: context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: context.space.xs),
              Text(
                order.formattedOrderDate ?? '-',
                style: context.typography.bodySmall.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        _buildStatusBadge(context),
      ],
    );
  }

  Widget _buildStatusBadge(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        _getStatusBadge(order.status, order.statusLabel ?? order.status),
        SizedBox(height: context.space.xs),
        _getPaymentStatusBadge(
          order.paymentStatus,
          order.paymentStatusLabel ?? order.paymentStatus,
        ),
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
          Icons.shopping_bag_rounded,
          'Item',
          '${order.orderItemsCount} layanan',
        ),
        SizedBox(height: context.space.xs),
        if (order.employee != null)
          _buildDetailRow(
            context,
            Icons.person_rounded,
            'Kasir',
            order.employee!.name,
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
              'Total',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            Text(
              order.formattedTotalAmount ?? '-',
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.primary,
              ),
            ),
          ],
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'Dibayar',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            Text(
              order.formattedPaidAmount ?? '-',
              style: context.typography.headlineMedium.copyWith(
                fontWeight: FontWeight.w600,
                color:
                    (order.paymentStatus == 'paid' ||
                        order.paymentStatus == 'paid_by_package')
                    ? context.colors.success
                    : context.colors.warning,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _getStatusBadge(String status, String label) {
    switch (status) {
      case 'requested':
        return AppBadge.neutral(label: label, size: AppBadgeSize.sm);
      case 'accepted':
      case 'received':
      case 'weighing':
      case 'ready_to_process':
        return AppBadge.info(label: label, size: AppBadgeSize.sm);
      case 'picking_up':
      case 'in_progress':
      case 'delivering':
        return AppBadge.warning(label: label, size: AppBadgeSize.sm);
      case 'ready':
      case 'delivered':
      case 'completed':
        return AppBadge.success(label: label, size: AppBadgeSize.sm);
      case 'cancelled':
      case 'rejected':
        return AppBadge.danger(label: label, size: AppBadgeSize.sm);
      default:
        return AppBadge(label: label, size: AppBadgeSize.sm);
    }
  }

  Widget _getPaymentStatusBadge(String status, String label) {
    switch (status) {
      case 'not_yet_priced':
        return AppBadge.neutral(label: label, size: AppBadgeSize.sm);
      case 'unpaid':
      case 'cod':
        return AppBadge.danger(label: label, size: AppBadgeSize.sm);
      case 'partial':
        return AppBadge.warning(label: label, size: AppBadgeSize.sm);
      case 'paid':
        return AppBadge.success(label: label, size: AppBadgeSize.sm);
      case 'paid_by_package':
        return AppBadge.success(label: label, size: AppBadgeSize.sm);
      default:
        return AppBadge(label: label, size: AppBadgeSize.sm);
    }
  }
}
