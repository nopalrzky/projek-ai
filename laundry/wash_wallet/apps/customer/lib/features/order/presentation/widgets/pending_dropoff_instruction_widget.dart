import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:url_launcher/url_launcher.dart';

class PendingDropoffInstructionWidget extends StatelessWidget {
  final Order order;
  final bool showSuccessHeader;

  const PendingDropoffInstructionWidget({
    super.key,
    required this.order,
    this.showSuccessHeader = true,
  });

  @override
  Widget build(BuildContext context) {
    final outlet = order.outlet;
    final showCoords = outlet != null && outlet.latitude != null && outlet.longitude != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showSuccessHeader) ...[
          Center(
            child: Column(
              children: [
                Icon(
                  Icons.check_circle_outline,
                  size: 64,
                  color: context.colors.success,
                ),
                SizedBox(height: context.space.md),
                Text(
                  'Pesanan Berhasil!',
                  style: context.typography.headlineLarge.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: context.space.lg),
        ],
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Langkah Selanjutnya:',
                style: context.typography.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: context.space.md),
              _buildStepRow(context, '1', 'Bawa laundry Anda ke outlet'),
              SizedBox(height: context.space.sm),
              _buildStepRow(context, '2', 'Kasir akan menerima dan menimbang laundry'),
              SizedBox(height: context.space.sm),
              _buildStepRow(context, '3', 'Total harga akan ditentukan oleh kasir'),
              SizedBox(height: context.space.sm),
              _buildStepRow(context, '4', 'Pembayaran dilakukan setelah kasir meng-ACC order'),
            ],
          ),
        ),
        if (outlet != null) ...[
          SizedBox(height: context.space.lg),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Lokasi Outlet:',
                  style: context.typography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: context.space.sm),
                Text(
                  outlet.name,
                  style: context.typography.bodyLarge.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(
                  outlet.fullAddress ?? '-',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                if (showCoords) ...[
                  SizedBox(height: context.space.md),
                  AppButton.outline(
                    label: 'Petunjuk Arah (Google Maps)',
                    icon: const Icon(Icons.map_outlined),
                    onPressed: () async {
                      final uri = Uri.parse(
                        'https://www.google.com/maps/search/?api=1&query=${outlet.latitude},${outlet.longitude}',
                      );
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri);
                      }
                    },
                  ),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStepRow(BuildContext context, String number, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: context.colors.primaryContainer,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              number,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        SizedBox(width: context.space.sm),
        Expanded(
          child: Text(
            text,
            style: context.typography.bodyMedium,
          ),
        ),
      ],
    );
  }
}
