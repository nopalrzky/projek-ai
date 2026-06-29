import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderDetailPricingSummaryWidget extends StatelessWidget {
  final Order order;

  const OrderDetailPricingSummaryWidget({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    final showDash = order.paymentStatus == 'not_yet_priced';
    final hasCourierFlow =
        order.pickupType == 'courier' || order.deliveryType == 'delivery';
    final pickupIsFree = hasCourierFlow && !showDash && order.pickupFee == 0;
    final deliveryIsFree =
        hasCourierFlow && !showDash && order.deliveryFee == 0;

    return AppCard(
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Rincian Pembayaran',
              style: context.typography.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: context.space.md),
            _buildAmountRow(
              context,
              label: 'Subtotal',
              amount: showDash ? '—' : formatter.format(order.subtotal),
            ),
            if (order.pickupFee > 0 || showDash || pickupIsFree)
              _buildAmountRow(
                context,
                label: 'Biaya Jemput',
                amount: showDash
                    ? '—'
                    : pickupIsFree
                    ? 'Gratis'
                    : formatter.format(order.pickupFee),
                color: pickupIsFree ? context.colors.success : null,
              ),
            if (order.deliveryFee > 0 || showDash || deliveryIsFree)
              _buildAmountRow(
                context,
                label: 'Biaya Antar',
                amount: showDash
                    ? '—'
                    : deliveryIsFree
                    ? 'Gratis'
                    : formatter.format(order.deliveryFee),
                color: deliveryIsFree ? context.colors.success : null,
              ),
            if (order.discountAmount > 0)
              _buildAmountRow(
                context,
                label: 'Diskon',
                amount: '-${formatter.format(order.discountAmount)}',
                color: context.colors.primary,
              ),
            SizedBox(height: context.space.sm),
            Divider(height: 1, color: context.colors.border),
            SizedBox(height: context.space.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Tagihan',
                  style: context.typography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  showDash ? '—' : formatter.format(order.totalAmount),
                  style: context.typography.titleMedium.copyWith(
                    color: context.colors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            if (showDash) ...[
              SizedBox(height: context.space.md),
              Container(
                padding: EdgeInsets.all(context.space.sm),
                decoration: BoxDecoration(
                  color: context.colors.info.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(context.radius.sm),
                  border: Border.all(
                    color: context.colors.info.withValues(alpha: 0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.info_outline,
                      size: 16,
                      color: context.colors.info,
                    ),
                    SizedBox(width: context.space.xs),
                    Expanded(
                      child: Text(
                        'Harga belum tersedia. Mohon tunggu sampai pesanan Anda selesai ditimbang.',
                        style: context.typography.labelSmall.copyWith(
                          color: context.colors.info,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAmountRow(
    BuildContext context, {
    required String label,
    required String amount,
    Color? color,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.space.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
          Text(
            amount,
            style: context.typography.bodyMedium.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}
