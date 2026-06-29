import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class WeighPriceSummary extends StatelessWidget {
  final OrderPriceResult result;
  final Order order;

  const WeighPriceSummary({
    super.key,
    required this.result,
    required this.order,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final total =
        result.total +
        order.pickupFee +
        order.deliveryFee -
        order.discountAmount +
        order.taxAmount;
    final remaining = total - order.paidAmount;

    return AppCard(
      size: AppCardSize.sm,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ringkasan Harga',
            style: context.typography.labelMedium.copyWith(
              color: colorScheme.onSurface,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.md),
          _SummaryRow(
            label: 'Subtotal',
            value: currencyFormat.format(result.subtotal),
          ),
          if (result.totalQuotaDiscount > 0)
            _SummaryRow(
              label: 'Diskon Quota',
              value: currencyFormat.format(result.totalQuotaDiscount),
            ),
          if (result.totalMembershipDiscount > 0)
            _SummaryRow(
              label: 'Diskon Membership',
              value: currencyFormat.format(result.totalMembershipDiscount),
            ),
          if (order.pickupFee > 0)
            _SummaryRow(
              label: 'Biaya Pickup',
              value: currencyFormat.format(order.pickupFee),
            ),
          if (order.deliveryFee > 0)
            _SummaryRow(
              label: 'Biaya Delivery',
              value: currencyFormat.format(order.deliveryFee),
            ),
          if (order.discountAmount > 0)
            _SummaryRow(
              label: 'Diskon Order',
              value: currencyFormat.format(order.discountAmount),
            ),
          if (order.taxAmount > 0)
            _SummaryRow(
              label: 'Pajak',
              value: currencyFormat.format(order.taxAmount),
            ),
          Divider(color: colorScheme.outlineVariant),
          _SummaryRow(
            label: 'Total Estimasi',
            value: currencyFormat.format(total),
            isEmphasis: true,
          ),
          _SummaryRow(
            label: 'Sudah Dibayar',
            value: currencyFormat.format(order.paidAmount),
          ),
          _SummaryRow(
            label: 'Sisa Estimasi',
            value: currencyFormat.format(remaining < 0 ? 0 : remaining),
            isEmphasis: true,
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isEmphasis;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isEmphasis = false,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Padding(
      padding: EdgeInsets.only(bottom: context.space.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: context.typography.bodySmall.copyWith(
              color: isEmphasis
                  ? colorScheme.onSurface
                  : colorScheme.onSurfaceVariant,
              fontWeight: isEmphasis ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Text(
            value,
            style: context.typography.bodySmall.copyWith(
              color: isEmphasis ? colorScheme.primary : colorScheme.onSurface,
              fontWeight: isEmphasis ? FontWeight.bold : FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
