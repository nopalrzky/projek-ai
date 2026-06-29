import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderDetailInfoWidget extends StatelessWidget {
  final Order order;

  const OrderDetailInfoWidget({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final isPickupCourier = order.pickupType == 'courier';
    final deliveryTypeLabel =
        order.deliveryTypeLabel ??
        (order.deliveryType == 'delivery' ? 'Antar Kurir' : 'Ambil Sendiri');

    final formattedSchedule = order.deliverySchedule != null
        ? DateFormat(
            'dd MMM yyyy, HH:mm',
          ).format(order.deliverySchedule!.toLocal())
        : '-';

    return AppCard(
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Informasi Pengiriman',
              style: context.typography.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: context.space.md),
            if (isPickupCourier && _pickupStatusMessage != null) ...[
              _buildPickupStatusBox(context, _pickupStatusMessage!),
              SizedBox(height: context.space.md),
            ],
            _buildInfoRow(
              context,
              icon: isPickupCourier
                  ? Icons.delivery_dining_outlined
                  : Icons.storefront_outlined,
              label: 'Metode Pengambilan',
              value: isPickupCourier ? 'Jemput Kurir' : 'Antar Sendiri',
            ),
            SizedBox(height: context.space.sm),
            _buildInfoRow(
              context,
              icon: Icons.location_on_outlined,
              label: 'Alamat Pengambilan',
              value: isPickupCourier ? (order.pickupAddress ?? '-') : '-',
            ),
            SizedBox(height: context.space.sm),
            _buildInfoRow(
              context,
              icon: order.deliveryType == 'delivery'
                  ? Icons.delivery_dining_outlined
                  : Icons.storefront_outlined,
              label: 'Metode Pengantaran',
              value: deliveryTypeLabel,
            ),
            SizedBox(height: context.space.sm),
            _buildInfoRow(
              context,
              icon: Icons.access_time_outlined,
              label: 'Jadwal Antar',
              value: formattedSchedule,
            ),
            SizedBox(height: context.space.md),
            Divider(height: 1, color: context.colors.border),
            SizedBox(height: context.space.md),
            _buildInfoRow(
              context,
              icon: Icons.payment_outlined,
              label: 'Status Pembayaran',
              value: order.paymentStatusLabel ?? order.paymentStatus,
            ),
            SizedBox(height: context.space.sm),
            _buildInfoRow(
              context,
              icon: Icons.notes_outlined,
              label: 'Catatan',
              value: order.notes != null && order.notes!.isNotEmpty
                  ? order.notes!
                  : 'Tidak ada catatan',
            ),
          ],
        ),
      ),
    );
  }

  String? get _pickupStatusMessage {
    return switch (order.status) {
      'accepted' =>
        'Pesanan diterima. Kurir akan segera menjemput cucian Anda.',
      'picking_up' => 'Kurir sedang dalam perjalanan menuju lokasi Anda.',
      'picked_up' => 'Cucian sudah diambil. Kurir sedang menuju outlet.',
      'received' => 'Cucian sudah sampai outlet. Menunggu ditimbang.',
      _ => null,
    };
  }

  Widget _buildPickupStatusBox(BuildContext context, String message) {
    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: context.colors.info.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(context.radius.sm),
        border: Border.all(color: context.colors.info.withValues(alpha: 0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, size: 18, color: context.colors.info),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Text(
              message,
              style: context.typography.bodySmall.copyWith(
                color: context.colors.info,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
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
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: context.colors.textSecondary),
        SizedBox(width: context.space.sm),
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: context.typography.bodySmall.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ),
        Expanded(
          flex: 3,
          child: Text(
            value,
            style: context.typography.bodySmall.copyWith(
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }
}
