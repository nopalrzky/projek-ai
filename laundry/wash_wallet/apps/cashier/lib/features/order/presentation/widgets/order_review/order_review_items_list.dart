import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderReviewItemsList extends StatelessWidget {
  final OrderPriceResult priceResult;

  const OrderReviewItemsList({super.key, required this.priceResult});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Text(
              'Rincian Layanan',
              style: context.typography.labelSmall.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: priceResult.itemBreakdowns.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final breakdown = priceResult.itemBreakdowns[index];

              return ListTile(
                title: Text(
                  breakdown.laundryServiceName,
                  style: context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${breakdown.totalQuantity} x ${currencyFormat.format(breakdown.unitPrice)}',
                      style: context.typography.labelSmall,
                    ),
                    if (breakdown.hasQuotaDiscount) ...[
                      SizedBox(height: context.space.xs),
                      Text(
                        'Quota: ${breakdown.quotaCoveredQuantity} (${currencyFormat.format(breakdown.quotaDiscountAmount)})',
                        style: context.typography.labelSmall.copyWith(
                          color: Colors.green,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ],
                ),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (breakdown.hasQuotaDiscount ||
                        breakdown.hasMembershipDiscount)
                      Text(
                        currencyFormat.format(breakdown.subtotalBeforeDiscount),
                        style: context.typography.bodySmall.copyWith(
                          decoration: TextDecoration.lineThrough,
                          color: context.colors.textSecondary,
                        ),
                      ),
                    Text(
                      currencyFormat.format(breakdown.totalAmount),
                      style: context.typography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: breakdown.totalDiscount > 0
                            ? Colors.green
                            : context.colors.textPrimary,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
