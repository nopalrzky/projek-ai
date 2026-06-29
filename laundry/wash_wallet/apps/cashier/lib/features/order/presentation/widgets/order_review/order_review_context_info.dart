import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderReviewContextInfo extends StatelessWidget {
  final OrderPriceResult priceResult;

  const OrderReviewContextInfo({super.key, required this.priceResult});

  @override
  Widget build(BuildContext context) {
    final hasMembership = priceResult.hasMembershipDiscount;
    final hasQuota = priceResult.hasQuotaDiscount;
    final isFullyCoveredByPackage =
        priceResult.totalQuotaDiscount > 0 &&
        priceResult.itemBreakdowns.isNotEmpty &&
        priceResult.itemBreakdowns.every((item) => item.payableQuantity <= 0);

    if (!hasMembership && !hasQuota) {
      return const SizedBox.shrink();
    }

    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.green.shade50, Colors.green.shade100],
        ),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: Colors.green.shade300, width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(context.space.sm),
                decoration: BoxDecoration(
                  color: Colors.green.shade200,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.check_circle_rounded,
                  color: Colors.green.shade800,
                  size: 24,
                ),
              ),
              SizedBox(width: context.space.md),
              Expanded(
                child: Text(
                  'Benefit Anda',
                  style: context.typography.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.green.shade900,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
          if (hasQuota) ...[
            _buildBenefitRow(
              context,
              icon: Icons.local_offer_rounded,
              label: 'Paket Deposit',
              value:
                  '- ${currencyFormat.format(priceResult.totalQuotaDiscount)}',
              description: 'Menggunakan quota paket langganan',
            ),
            if (hasMembership) SizedBox(height: context.space.sm),
          ],
          if (hasMembership) ...[
            _buildBenefitRow(
              context,
              icon: Icons.card_membership_rounded,
              label: 'Membership Discount',
              value:
                  '- ${currencyFormat.format(priceResult.totalMembershipDiscount)}',
              description: 'Diskon dari membership aktif',
            ),
          ],
          if (isFullyCoveredByPackage) ...[
            SizedBox(height: context.space.sm),
            Divider(color: Colors.green.shade300, thickness: 1),
            SizedBox(height: context.space.sm),
            _buildBenefitRow(
              context,
              icon: Icons.inventory_2_rounded,
              label: 'Status Pembayaran',
              value: 'Ditanggung Paket',
              description: 'Order ini lunas penuh menggunakan quota paket',
            ),
          ],
          SizedBox(height: context.space.sm),
          Divider(color: Colors.green.shade300, thickness: 1),
          SizedBox(height: context.space.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Hemat',
                style: context.typography.labelMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.green.shade900,
                ),
              ),
              Text(
                currencyFormat.format(priceResult.totalDiscount),
                style: context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.green.shade700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitRow(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required String description,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.green.shade700, size: 20),
        SizedBox(width: context.space.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: context.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: Colors.green.shade900,
                ),
              ),
              SizedBox(height: context.space.xs),
              Text(
                description,
                style: context.typography.bodySmall.copyWith(
                  color: Colors.green.shade700,
                ),
              ),
            ],
          ),
        ),
        Text(
          value,
          style: context.typography.labelMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.green.shade700,
          ),
        ),
      ],
    );
  }
}
