import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_outlet.dart';
import '../../domain/entities/discovery_top_service.dart';
import 'discovery_outlet_info_widget.dart';
import 'discovery_top_services_widget.dart';

class DiscoveryOutletCardWidget extends StatelessWidget {
  final DiscoveryOutlet outlet;
  final void Function(DiscoveryOutlet outlet) onOutletTap;
  final void Function(DiscoveryTopService service) onServiceTap;
  final void Function(DiscoveryOutlet outlet) onViewAllTap;

  const DiscoveryOutletCardWidget({
    super.key,
    required this.outlet,
    required this.onOutletTap,
    required this.onServiceTap,
    required this.onViewAllTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard.elevated(
      margin: EdgeInsets.symmetric(
        horizontal: context.space.md,
        vertical: context.space.sm,
      ),
      padding: EdgeInsets.all(context.space.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DiscoveryOutletInfoWidget(
            outlet: outlet,
            onTap: () => onOutletTap(outlet),
          ),
          if (outlet.topServices.isNotEmpty) ...[
            SizedBox(height: context.space.md),
            const AppDivider.soft(),
            SizedBox(height: context.space.md),
            DiscoveryTopServicesWidget(
              services: outlet.topServices,
              onServiceTap: onServiceTap,
              onViewAllTap: () => onViewAllTap(outlet),
            ),
          ],
        ],
      ),
    );
  }
}
