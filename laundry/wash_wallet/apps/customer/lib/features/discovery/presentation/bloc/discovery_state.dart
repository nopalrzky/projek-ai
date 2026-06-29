import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../domain/entities/discovery_filter.dart';
import '../../domain/entities/discovery_outlet.dart';
import '../../domain/entities/discovery_service.dart';

sealed class DiscoveryState extends Equatable {
  const DiscoveryState();

  @override
  List<Object?> get props => [];
}

class DiscoveryInitial extends DiscoveryState {
  const DiscoveryInitial();
}

class DiscoveryLoading extends DiscoveryState {
  const DiscoveryLoading();
}

class DiscoveryRecommendationsLoaded extends DiscoveryState {
  final List<DiscoveryService> bestServices;
  final List<DiscoveryService> cheapestServices;
  final List<DiscoveryService> freeShippingServices;
  final List<DiscoveryService> popularServices;
  final List<Outlet> topOutlets;

  const DiscoveryRecommendationsLoaded({
    required this.bestServices,
    required this.cheapestServices,
    required this.freeShippingServices,
    required this.popularServices,
    required this.topOutlets,
  });

  List<DiscoveryService> get availableServices => [
    ...bestServices,
    ...cheapestServices,
    ...freeShippingServices,
    ...popularServices,
  ];

  @override
  List<Object?> get props => [
    bestServices,
    cheapestServices,
    freeShippingServices,
    popularServices,
    topOutlets,
  ];
}

class DiscoveryOutletsLoaded extends DiscoveryState {
  final List<DiscoveryOutlet> outlets;
  final bool hasReachedMax;
  final int currentPage;
  final bool isLoadMore;

  const DiscoveryOutletsLoaded({
    required this.outlets,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.isLoadMore = false,
  });

  DiscoveryOutletsLoaded copyWith({
    List<DiscoveryOutlet>? outlets,
    bool? hasReachedMax,
    int? currentPage,
    bool? isLoadMore,
  }) {
    return DiscoveryOutletsLoaded(
      outlets: outlets ?? this.outlets,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      isLoadMore: isLoadMore ?? this.isLoadMore,
    );
  }

  @override
  List<Object?> get props => [outlets, hasReachedMax, currentPage, isLoadMore];
}

class DiscoverySearchResultLoaded extends DiscoveryState {
  final List<DiscoveryService> services;
  final DiscoveryFilter activeFilter;
  final String? correctedQuery;
  final bool hasReachedMax;
  final int currentPage;
  final bool isLoadMore;

  const DiscoverySearchResultLoaded({
    required this.services,
    required this.activeFilter,
    this.correctedQuery,
    this.hasReachedMax = false,
    this.currentPage = 1,
    this.isLoadMore = false,
  });

  DiscoverySearchResultLoaded copyWith({
    List<DiscoveryService>? services,
    DiscoveryFilter? activeFilter,
    String? correctedQuery,
    bool clearCorrectedQuery = false,
    bool? hasReachedMax,
    int? currentPage,
    bool? isLoadMore,
  }) {
    return DiscoverySearchResultLoaded(
      services: services ?? this.services,
      activeFilter: activeFilter ?? this.activeFilter,
      correctedQuery: clearCorrectedQuery
          ? null
          : correctedQuery ?? this.correctedQuery,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      isLoadMore: isLoadMore ?? this.isLoadMore,
    );
  }

  @override
  List<Object?> get props => [
    services,
    activeFilter,
    correctedQuery,
    hasReachedMax,
    currentPage,
    isLoadMore,
  ];
}

class DiscoveryFailure extends DiscoveryState {
  final Failure failure;

  const DiscoveryFailure(this.failure);

  @override
  List<Object?> get props => [failure];
}
