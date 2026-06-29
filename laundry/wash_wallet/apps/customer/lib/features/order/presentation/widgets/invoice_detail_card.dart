import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'invoice_amount_row.dart';

class InvoiceDetailCard extends StatelessWidget {
  final Order order;
  final NumberFormat formatter;

  const InvoiceDetailCard({
    super.key,
    required this.order,
    required this.formatter,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Detail Tagihan', style: context.typography.headlineSmall),
                Text(order.orderNumber, style: context.typography.bodySmall),
              ],
            ),
            Divider(height: context.space.lg),
            if (order.orderItems != null)
              ...order.orderItems!.map(
                (item) => Padding(
                  padding: EdgeInsets.only(bottom: context.space.xs),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.laundryServiceName ?? '-',
                              style: context.typography.bodyMedium,
                            ),
                            Text(
                              '${item.quantity} ${item.unitName ?? ""}',
                              style: context.typography.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      Text(
                        formatter.format(item.totalAmount),
                        style: context.typography.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
            Divider(height: context.space.lg),
            InvoiceAmountRow(
              label: 'Subtotal',
              amount: order.subtotal,
              formatter: formatter,
            ),
            if (order.pickupFee > 0)
              InvoiceAmountRow(
                label: 'Biaya Jemput',
                amount: order.pickupFee,
                formatter: formatter,
              ),
            if (order.deliveryFee > 0)
              InvoiceAmountRow(
                label: 'Biaya Antar',
                amount: order.deliveryFee,
                formatter: formatter,
              ),
            if (order.discountAmount > 0)
              InvoiceAmountRow(
                label: 'Diskon',
                amount: -order.discountAmount,
                formatter: formatter,
                color: context.colors.primary,
              ),
            Divider(height: context.space.lg),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: context.typography.headlineMedium),
                Text(
                  formatter.format(order.totalAmount),
                  style: context.typography.headlineMedium.copyWith(
                    color: context.colors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
