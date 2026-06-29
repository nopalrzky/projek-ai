import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderDetailDialog extends StatelessWidget {
  final Order order;
  final VoidCallback? onConfirm;
  final String confirmLabel;
  final bool showConfirmButton;

  const OrderDetailDialog({
    super.key,
    required this.order,
    this.onConfirm,
    this.confirmLabel = 'Kerjakan Order',
    this.showConfirmButton = true,
  });

  static Future<bool?> show(
    BuildContext context, {
    required Order order,
    VoidCallback? onConfirm,
    String confirmLabel = 'Kerjakan Order',
    bool showConfirmButton = true,
  }) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => OrderDetailDialog(
        order: order,
        onConfirm: onConfirm,
        confirmLabel: confirmLabel,
        showConfirmButton: showConfirmButton,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: context.colors.surface,
      insetPadding: EdgeInsets.all(context.space.lg),
      shape: RoundedRectangleBorder(borderRadius: context.radius.all.lg),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 500),
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context),
                SizedBox(height: context.space.lg),
                _buildOrderInfo(context),
                SizedBox(height: context.space.md),
                const AppDivider(),
                SizedBox(height: context.space.md),
                _buildOrderItems(context),
                SizedBox(height: context.space.md),
                const AppDivider(),
                SizedBox(height: context.space.md),
                _buildTotal(context),
                if (order.notes != null && order.notes!.isNotEmpty) ...[
                  SizedBox(height: context.space.md),
                  const AppDivider(),
                  SizedBox(height: context.space.md),
                  _buildNote(context),
                ],
                SizedBox(height: context.space.lg),
                _buildActions(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(context.space.sm),
          decoration: BoxDecoration(
            color: context.colors.primarySurface,
            borderRadius: context.radius.all.md,
          ),
          child: Icon(
            Icons.receipt_long,
            color: context.colors.primary,
            size: 24,
          ),
        ),
        SizedBox(width: context.space.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Detail Order',
                style: context.typography.headlineLarge.copyWith(
                  fontWeight: FontWeight.bold,
                  color: context.colors.textPrimary,
                ),
              ),
              SizedBox(height: context.space.xs),
              Text(
                order.orderNumber,
                style: context.typography.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () => Navigator.of(context).pop(false),
          icon: Icon(Icons.close, color: context.colors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildOrderInfo(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInfoRow(context, 'Pelanggan', 'Customer #${order.customerId}'),
        SizedBox(height: context.space.sm),
        _buildInfoRow(
          context,
          'Tanggal',
          DateFormat('dd MMMM yyyy, HH:mm').format(order.orderDate!),
        ),
        SizedBox(height: context.space.sm),
        _buildInfoRow(context, 'Status', _getStatusText(order.status)),
      ],
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textTertiary,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOrderItems(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Item Order',
          style: context.typography.headlineMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: context.colors.textPrimary,
          ),
        ),
        SizedBox(height: context.space.md),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: order.orderItems?.length ?? 0,
          separatorBuilder: (context, index) =>
              SizedBox(height: context.space.sm),
          itemBuilder: (context, index) {
            final item = order.orderItems![index];
            return _buildOrderItemRow(context, item);
          },
        ),
      ],
    );
  }

  Widget _buildOrderItemRow(BuildContext context, item) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: context.colors.surfaceVariant,
        borderRadius: context.radius.all.sm,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.laundryServiceName,
                  style: context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                    color: context.colors.textPrimary,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(
                  '${item.quantity.toInt()} ${item.unitName} × ${formatter.format(item.unitPrice)}',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Text(
            formatter.format(item.subtotal),
            style: context.typography.bodyMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotal(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.primarySurface,
        borderRadius: context.radius.all.md,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Total',
            style: context.typography.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textPrimary,
            ),
          ),
          Text(
            formatter.format(order.totalAmount),
            style: context.typography.headlineLarge.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.primary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNote(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Catatan',
          style: context.typography.headlineSmall.copyWith(
            fontWeight: FontWeight.bold,
            color: context.colors.textPrimary,
          ),
        ),
        SizedBox(height: context.space.sm),
        Text(
          order.notes!,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildActions(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        AppButton.outline(
          label: 'Batal',
          onPressed: () => Navigator.of(context).pop(false),
        ),
        if (showConfirmButton && onConfirm != null) ...[
          SizedBox(width: context.space.sm),
          AppButton.primary(
            label: confirmLabel,
            onPressed: () {
              Navigator.of(context).pop(true);
              onConfirm?.call();
            },
          ),
        ],
      ],
    );
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'requested':
        return 'Diajukan';
      case 'accepted':
        return 'Diterima';
      case 'picking_up':
        return 'Dijemput';
      case 'received':
        return 'Di Outlet';
      case 'weighing':
        return 'Ditimbang';
      case 'ready_to_process':
        return 'Siap Dikerjakan';
      case 'in_progress':
        return 'Sedang Dikerjakan';
      case 'ready':
        return 'Siap Diantar/Ambil';
      case 'delivering':
        return 'Sedang Diantar';
      case 'delivered':
        return 'Terkirim';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  }
}

