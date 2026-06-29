import 'package:flutter/material.dart';

import '../../domain/entities/discovery_filter.dart';
import '../../domain/entities/discovery_service.dart';
import 'discovery_search_empty_state_widget.dart';
import 'discovery_search_result_list_widget.dart';
import 'discovery_search_typo_empty_state_widget.dart';

class DiscoverySearchResultContentWidget extends StatelessWidget {
  final List<DiscoveryService> services;
  final DiscoveryFilter activeFilter;
  final String? correctedQuery;
  final bool hasReachedMax;
  final bool isLoadMore;
  final ScrollController scrollController;
  final VoidCallback onClear;
  final VoidCallback onRefresh;
  final void Function(DiscoveryService service) onServiceTap;

  const DiscoverySearchResultContentWidget({
    super.key,
    required this.services,
    required this.activeFilter,
    this.correctedQuery,
    required this.hasReachedMax,
    required this.isLoadMore,
    required this.scrollController,
    required this.onClear,
    required this.onRefresh,
    required this.onServiceTap,
  });

  @override
  Widget build(BuildContext context) {
    if (services.isEmpty) {
      final query = activeFilter.query?.trim();
      if (query != null && query.isNotEmpty) {
        return DiscoverySearchTypoEmptyStateWidget(
          query: query,
          onClear: onClear,
        );
      }

      return DiscoverySearchEmptyStateWidget(
        onClear: onClear,
        activeQuery: query,
      );
    }

    return DiscoverySearchResultListWidget(
      services: services,
      correctedQuery: correctedQuery,
      hasReachedMax: hasReachedMax,
      isLoadMore: isLoadMore,
      scrollController: scrollController,
      onRefresh: onRefresh,
      onServiceTap: onServiceTap,
    );
  }
}
