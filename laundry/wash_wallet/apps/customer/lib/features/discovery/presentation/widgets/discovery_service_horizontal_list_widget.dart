import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_service.dart';
import 'discovery_service_card_widget.dart';

class DiscoveryServiceHorizontalListWidget extends StatelessWidget {
  final List<DiscoveryService> services;
  final void Function(DiscoveryService service) onServiceTap;

  const DiscoveryServiceHorizontalListWidget({
    super.key,
    required this.services,
    required this.onServiceTap,
  });

  @override
  Widget build(BuildContext context) {
    if (services.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 228,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: services.length,
        separatorBuilder: (_, _) => SizedBox(width: context.space.md),
        itemBuilder: (context, index) {
          final service = services[index];
          return SizedBox(
            width: 312,
            child: DiscoveryServiceCardWidget(
              service: service,
              onTap: () => onServiceTap(service),
            ),
          );
        },
      ),
    );
  }
}
