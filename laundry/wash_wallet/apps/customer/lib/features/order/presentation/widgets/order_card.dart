import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'review_bottom_sheet.dart';

class OrderCard extends StatelessWidget {
  final Order order;
  final bool isCancelling;
  final VoidCallback? onTap;
  final VoidCallback? onCancel;

  const OrderCard({
    super.key,
    required this.order,
    this.isCancelling = false,
    this.onTap,
    this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final canCancel =
        order.status == 'requested' ||
        order.status == 'pending' ||
        order.status == 'pending_dropoff';

    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    final createdAt = order.createdAt != null
        ? DateFormat('dd MMM yyyy, HH:mm').format(order.createdAt!.toLocal())
        : '-';

    final isPickupCourier = order.pickupType == 'courier';

    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(
              context.space.md,
              context.space.md,
              context.space.md,
              context.space.sm,
            ),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(context.space.xs),
                  decoration: BoxDecoration(
                    color: context.colors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(context.radius.sm),
                  ),
                  child: Icon(
                    Icons.receipt_outlined,
                    size: 18,
                    color: context.colors.primary,
                  ),
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: Text(
                    order.orderNumber,
                    style: context.typography.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                SizedBox(width: context.space.sm),
                OrderStatusBadge(
                  status: order.status,
                  label: _customerStatusLabel,
                ),
                SizedBox(width: context.space.xs),
                PaymentStatusBadge(status: order.paymentStatus),
              ],
            ),
          ),

          Divider(height: 1, color: context.colors.border),

          Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Column(
              children: [
                _buildInfoRow(
                  context,
                  icon: Icons.calendar_today_outlined,
                  label: 'Tanggal',
                  value: createdAt,
                ),
                SizedBox(height: context.space.xs),
                _buildInfoRow(
                  context,
                  icon: isPickupCourier
                      ? Icons.delivery_dining_outlined
                      : Icons.storefront_outlined,
                  label: 'Pengambilan',
                  value: isPickupCourier
                      ? 'Jemput Kurir'
                      : (order.pickupType == 'self_dropoff'
                            ? 'Datang ke Outlet'
                            : 'Antar Sendiri'),
                ),
                SizedBox(height: context.space.xs),
                _buildInfoRow(
                  context,
                  icon: order.deliveryType == 'delivery'
                      ? Icons.delivery_dining_outlined
                      : Icons.storefront_outlined,
                  label: 'Pengantaran',
                  value:
                      order.deliveryTypeLabel ??
                      (order.deliveryType == 'delivery'
                          ? 'Antar Kurir'
                          : 'Ambil Sendiri'),
                ),
                SizedBox(height: context.space.sm),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: context.space.md,
                    vertical: context.space.sm,
                  ),
                  decoration: BoxDecoration(
                    color: context.colors.primary.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total Tagihan',
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                      Text(
                        order.paymentStatus == 'not_yet_priced'
                            ? '-'
                            : formatter.format(order.totalAmount),
                        style: context.typography.titleMedium.copyWith(
                          color: context.colors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                if (order.paymentStatus == 'not_yet_priced' ||
                    order.status == 'pending_dropoff') ...[
                  SizedBox(height: context.space.sm),
                  _buildInfoBox(
                    context,
                    order.status == 'pending_dropoff'
                        ? 'Bawa laundry ke outlet untuk ditimbang'
                        : 'Mohon tunggu sampai kami selesai menimbang pesanan Anda.',
                    Icons.info_outline,
                    context.colors.info,
                  ),
                ],
                if (isPickupCourier) ..._buildPickupStatusInfo(context),
              ],
            ),
          ),

          if (canCancel) ...[
            Divider(height: 1, color: context.colors.border),
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: context.space.md,
                vertical: context.space.sm,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: isCancelling ? null : onCancel,
                    icon: isCancelling
                        ? SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: context.colors.error,
                            ),
                          )
                        : Icon(
                            Icons.cancel_outlined,
                            size: 16,
                            color: context.colors.error,
                          ),
                    label: Text(
                      'Batalkan Pesanan',
                      style: context.typography.labelMedium.copyWith(
                        color: context.colors.error,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.symmetric(
                        horizontal: context.space.sm,
                        vertical: context.space.xs,
                      ),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                ],
              ),
            ),
          ],

          if (order.canPay && order.status != 'cancelled') ...[
            Divider(height: 1, color: context.colors.border),
            Padding(
              padding: EdgeInsets.all(context.space.md),
              child: AppButton.primary(
                onPressed: () => context.push('/orders/${order.id}/invoice'),
                label: 'Bayar Sekarang',
                size: AppButtonSize.sm,
                isFullWidth: true,
              ),
            ),
          ],

          if (order.canScheduleDelivery &&
              order.deliverySchedule == null &&
              order.status != 'cancelled') ...[
            Divider(height: 1, color: context.colors.border),
            Padding(
              padding: EdgeInsets.all(context.space.md),
              child: AppButton.primary(
                onPressed: () =>
                    context.push('/orders/${order.id}/schedule-delivery'),
                label: 'Jadwalkan Antar',
                size: AppButtonSize.sm,
                isFullWidth: true,
              ),
            ),
          ],

          if (order.requiresPaymentBeforeDelivery &&
              order.status == 'completed') ...[
            SizedBox(height: context.space.sm),
            Container(
              margin: EdgeInsets.symmetric(horizontal: context.space.md),
              padding: EdgeInsets.all(context.space.sm),
              decoration: BoxDecoration(
                color: context.colors.warning.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(context.radius.sm),
                border: Border.all(
                  color: context.colors.warning.withValues(alpha: 0.2),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    size: 16,
                    color: context.colors.warning,
                  ),
                  SizedBox(width: context.space.xs),
                  Expanded(
                    child: Text(
                      'Selesaikan pembayaran untuk menentukan jadwal pengantaran.',
                      style: context.typography.labelSmall.copyWith(
                        color: context.colors.warning,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          if (order.status == 'completed' && !order.hasReview) ...[
            Divider(height: 1, color: context.colors.border),
            Padding(
              padding: EdgeInsets.all(context.space.md),
              child: AppButton.primary(
                onPressed: () {
                  AppBottomSheet.show(
                    context,
                    title: 'Beri Ulasan',
                    child: ReviewBottomSheet(order: order),
                  );
                },
                label: 'Beri Ulasan',
                size: AppButtonSize.sm,
                isFullWidth: true,
              ),
            ),
          ],

          SizedBox(height: context.space.xs),
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 15, color: context.colors.textSecondary),
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

  List<Widget> _buildPickupStatusInfo(BuildContext context) {
    final (message, icon, color) = switch (order.status) {
      'accepted' => (
        'Pesanan diterima. Kurir akan segera menjemput cucian Anda.',
        Icons.thumb_up_outlined,
        context.colors.info,
      ),
      'picking_up' => (
        'Kurir sedang dalam perjalanan menuju lokasi Anda.',
        Icons.delivery_dining_outlined,
        context.colors.warning,
      ),
      'picked_up' => (
        'Cucian sudah diambil. Kurir sedang menuju outlet.',
        Icons.directions_bike_outlined,
        context.colors.warning,
      ),
      'received' => (
        'Cucian sudah sampai outlet. Menunggu ditimbang.',
        Icons.store_outlined,
        context.colors.info,
      ),
      _ => (null, null, null),
    };

    if (message == null || icon == null || color == null) {
      return const [];
    }

    return [
      SizedBox(height: context.space.sm),
      _buildInfoBox(context, message, icon, color),
    ];
  }

  String? get _customerStatusLabel {
    return switch (order.status) {
      'accepted' => 'Siap Dijemput',
      'picking_up' => 'Dalam Perjalanan',
      'picked_up' => 'Sudah Diambil',
      'received' => 'Cucian di Outlet',
      _ => order.statusLabel,
    };
  }

  Widget _buildInfoBox(
    BuildContext context,
    String message,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(context.radius.sm),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          SizedBox(width: context.space.xs),
          Expanded(
            child: Text(
              message,
              style: context.typography.labelSmall.copyWith(color: color),
            ),
          ),
        ],
      ),
    );
  }
}
