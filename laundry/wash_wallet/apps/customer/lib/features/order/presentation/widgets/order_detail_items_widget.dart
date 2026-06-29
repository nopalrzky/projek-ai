import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderDetailItemsWidget extends StatelessWidget {
  final Order order;

  const OrderDetailItemsWidget({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final items = order.orderItems;

    return AppCard(
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Layanan Terpilih',
              style: context.typography.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: context.space.md),
            if (items == null || items.isEmpty)
              Padding(
                padding: EdgeInsets.symmetric(vertical: context.space.sm),
                child: Center(
                  child: Text(
                    'Layanan belum tersedia',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              )
            else
              ...items.map((item) => _buildItemRow(context, item)),
          ],
        ),
      ),
    );
  }

  Widget _buildItemRow(BuildContext context, OrderItem item) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    final showDash = order.paymentStatus == 'not_yet_priced';

    return Padding(
      padding: EdgeInsets.only(bottom: context.space.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.laundryServiceName ?? '-',
                  style: context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  '${item.quantity} ${item.unitName ?? ""}',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(width: context.space.sm),
          Text(
            showDash ? '—' : formatter.format(item.totalAmount),
            style: context.typography.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
