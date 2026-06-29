import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_top_service.dart';
import 'discovery_top_service_card_widget.dart';

class DiscoveryTopServicesWidget extends StatelessWidget {
  final List<DiscoveryTopService> services;
  final void Function(DiscoveryTopService service) onServiceTap;
  final VoidCallback onViewAllTap;

  const DiscoveryTopServicesWidget({
    super.key,
    required this.services,
    required this.onServiceTap,
    required this.onViewAllTap,
  });

  @override
  Widget build(BuildContext context) {
    if (services.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Layanan unggulan',
                style: context.typography.labelLarge.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            AppButton.ghost(
              label: 'Lihat Semua',
              onPressed: onViewAllTap,
              size: AppButtonSize.sm,
            ),
          ],
        ),
        SizedBox(height: context.space.sm),
        SizedBox(
          height: 128,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: services.length,
            separatorBuilder: (context, index) =>
                SizedBox(width: context.space.sm),
            itemBuilder: (context, index) {
              final service = services[index];
              return DiscoveryTopServiceCardWidget(
                service: service,
                onTap: () => onServiceTap(service),
              );
            },
          ),
        ),
      ],
    );
  }
}
