import 'package:equatable/equatable.dart';

import 'discovery_filter.dart';
import 'discovery_service.dart';

class DiscoverySearchResult extends Equatable {
  final List<DiscoveryService> services;
  final DiscoveryFilter activeFilter;
  final String? correctedQuery;
  final bool hasReachedMax;
  final int currentPage;

  const DiscoverySearchResult({
    required this.services,
    required this.activeFilter,
    this.correctedQuery,
    this.hasReachedMax = false,
    this.currentPage = 1,
  });

  @override
  List<Object?> get props => [
    services,
    activeFilter,
    correctedQuery,
    hasReachedMax,
    currentPage,
  ];
}
