import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_service.dart';
import 'discovery_search_result_header_widget.dart';
import 'discovery_service_card_widget.dart';

class DiscoverySearchResultListWidget extends StatelessWidget {
  final List<DiscoveryService> services;
  final String? correctedQuery;
  final bool hasReachedMax;
  final bool isLoadMore;
  final ScrollController scrollController;
  final VoidCallback onRefresh;
  final void Function(DiscoveryService service) onServiceTap;

  const DiscoverySearchResultListWidget({
    super.key,
    required this.services,
    this.correctedQuery,
    required this.hasReachedMax,
    required this.isLoadMore,
    required this.scrollController,
    required this.onRefresh,
    required this.onServiceTap,
  });

  @override
  Widget build(BuildContext context) {
    final hasHeader =
        correctedQuery != null && correctedQuery!.trim().isNotEmpty;
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      color: context.colors.primary,
      backgroundColor: context.colors.surface,
      child: ListView.separated(
        controller: scrollController,
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(
          context.space.lg,
          context.space.md,
          context.space.lg,
          context.space.xxl,
        ),
        itemCount:
            services.length + (hasHeader ? 1 : 0) + (hasReachedMax ? 0 : 1),
        separatorBuilder: (_, _) => SizedBox(height: context.space.md),
        itemBuilder: (context, index) {
          if (hasHeader && index == 0) {
            return DiscoverySearchResultHeaderWidget(
              correctedQuery: correctedQuery,
            );
          }

          final serviceIndex = index - (hasHeader ? 1 : 0);
          if (serviceIndex >= services.length) {
            return Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: context.space.md),
                child: const AppLoadingIndicator(),
              ),
            );
          }

          final service = services[serviceIndex];
          return DiscoveryServiceCardWidget(
            service: service,
            onTap: () => onServiceTap(service),
          );
        },
      ),
    );
  }
}
