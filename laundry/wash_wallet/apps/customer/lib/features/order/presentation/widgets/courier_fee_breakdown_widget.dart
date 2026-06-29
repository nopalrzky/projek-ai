import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../courier_pricing/domain/entities/courier_pricing_result.dart';

class CourierFeeBreakdownWidget extends StatelessWidget {
  final CourierPricingResult result;

  const CourierFeeBreakdownWidget({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRow(
          context,
          'Jarak Pengiriman',
          '${result.distanceKm.toStringAsFixed(1)} km',
        ),
        _buildRow(
          context,
          'Biaya Dasar (${result.pricingMethod})',
          formatter.format(result.baseFee),
        ),
        if (result.nightSurcharge > 0)
          _buildRow(
            context,
            'Surcharge Malam',
            formatter.format(result.nightSurcharge),
          ),
        if (result.weekendSurcharge > 0)
          _buildRow(
            context,
            'Surcharge Akhir Pekan',
            formatter.format(result.weekendSurcharge),
          ),
        if (result.surgeMultiplier > 1)
          _buildRow(
            context,
            'Biaya Lonjakan (x${result.surgeMultiplier})',
            'Sesuai sistem',
          ),
        Divider(height: context.space.md),
        _buildRow(
          context,
          'Total Biaya Kurir',
          formatter.format(result.finalFee),
          isBold: true,
        ),
        if (result.merchantSubsidy > 0)
          _buildRow(
            context,
            'Subsidi Outlet',
            '- ${formatter.format(result.merchantSubsidy)}',
            valueColor: context.colors.success,
          ),
        if (result.discountSource != null)
          _buildRow(
            context,
            _discountSourceLabel(result.discountSource!),
            'Potongan Penuh',
            valueColor: context.colors.success,
          ),
        Divider(height: context.space.md),
        _buildRow(
          context,
          'Biaya yang Anda Bayar',
          result.customerPays == 0
              ? 'Gratis'
              : formatter.format(result.customerPays),
          isBold: true,
          isPrimary: true,
          valueColor: result.customerPays == 0 ? context.colors.success : null,
        ),
      ],
    );
  }

  Widget _buildRow(
    BuildContext context,
    String label,
    String value, {
    bool isBold = false,
    bool isPrimary = false,
    Color? valueColor,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: context.space.xxs),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
                fontWeight: isBold ? FontWeight.bold : null,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: context.typography.bodyMedium.copyWith(
                color:
                    valueColor ??
                    (isPrimary
                        ? context.colors.primary
                        : context.colors.textPrimary),
                fontWeight: isBold ? FontWeight.bold : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _discountSourceLabel(String discountSource) {
    switch (discountSource) {
      case 'outlet_free_shipping_all':
        return 'Gratis Ongkir Outlet';
      default:
        return 'Promo: $discountSource';
    }
  }
}
