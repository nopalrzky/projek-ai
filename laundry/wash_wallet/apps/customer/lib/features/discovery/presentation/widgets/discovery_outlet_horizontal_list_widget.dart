import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../outlet/presentation/widgets/outlet_card.dart';

class DiscoveryOutletHorizontalListWidget extends StatelessWidget {
  final List<Outlet> outlets;
  final void Function(Outlet outlet) onOutletTap;

  const DiscoveryOutletHorizontalListWidget({
    super.key,
    required this.outlets,
    required this.onOutletTap,
  });

  @override
  Widget build(BuildContext context) {
    if (outlets.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 148,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: outlets.length,
        separatorBuilder: (_, _) => SizedBox(width: context.space.md),
        itemBuilder: (context, index) {
          final outlet = outlets[index];
          return SizedBox(
            width: 340,
            child: OutletCard(outlet: outlet, onTap: () => onOutletTap(outlet)),
          );
        },
      ),
    );
  }
}
