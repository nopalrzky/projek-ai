import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_outlet.dart';
import '../../domain/entities/discovery_top_service.dart';
import 'discovery_outlet_card_widget.dart';

class DiscoveryOutletContentWidget extends StatelessWidget {
  final List<DiscoveryOutlet> outlets;
  final bool hasReachedMax;
  final bool isLoadMore;
  final ScrollController scrollController;
  final VoidCallback onRefresh;
  final void Function(DiscoveryOutlet outlet) onOutletTap;
  final void Function(DiscoveryTopService service) onServiceTap;
  final void Function(DiscoveryOutlet outlet) onViewAllTap;

  const DiscoveryOutletContentWidget({
    super.key,
    required this.outlets,
    required this.hasReachedMax,
    required this.isLoadMore,
    required this.scrollController,
    required this.onRefresh,
    required this.onOutletTap,
    required this.onServiceTap,
    required this.onViewAllTap,
  });

  @override
  Widget build(BuildContext context) {
    if (outlets.isEmpty) {
      return AppEmptyState.search(
        title: 'Belum ada outlet yang cocok',
        description: 'Coba ubah lokasi, kata kunci, atau filter pencarian.',
        action: AppButton.primary(label: 'Coba Lagi', onPressed: onRefresh),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: ListView.builder(
        controller: scrollController,
        padding: EdgeInsets.only(bottom: context.space.xxl),
        itemCount: outlets.length + (isLoadMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= outlets.length) {
            return Padding(
              padding: EdgeInsets.all(context.space.lg),
              child: const AppLoadingIndicator(size: AppEmptyStateSize.sm),
            );
          }

          final outlet = outlets[index];
          return DiscoveryOutletCardWidget(
            outlet: outlet,
            onOutletTap: onOutletTap,
            onServiceTap: onServiceTap,
            onViewAllTap: onViewAllTap,
          );
        },
      ),
    );
  }
}
