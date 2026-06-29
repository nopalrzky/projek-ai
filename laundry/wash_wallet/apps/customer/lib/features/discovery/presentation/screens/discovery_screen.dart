import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/services/location_service.dart';
import '../../domain/entities/discovery_filter.dart';
import '../../domain/entities/discovery_service.dart';
import '../../domain/entities/discovery_top_service.dart';
import '../widgets/discovery_outlet_card_skeleton_widget.dart';
import '../widgets/discovery_outlet_content_widget.dart';
import '../bloc/discovery_cubit.dart';
import '../bloc/discovery_state.dart';
import '../bloc/location_picker_cubit.dart';
import '../bloc/location_picker_state.dart';
import '../widgets/discovery_quick_filter_bar_widget.dart';
import '../widgets/discovery_recommendations_content_widget.dart';
import '../widgets/discovery_search_result_content_widget.dart';
import '../widgets/discovery_sort_selector_widget.dart';
import '../widgets/discovery_sticky_search_header_widget.dart';

class DiscoveryScreen extends StatefulWidget {
  final String? initialQuery;

  const DiscoveryScreen({super.key, this.initialQuery});

  @override
  State<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends State<DiscoveryScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  late DiscoveryFilter _activeFilter;
  bool _didLoadInitial = false;

  @override
  void initState() {
    super.initState();
    _activeFilter = DiscoveryFilter(query: widget.initialQuery);
    if (widget.initialQuery != null) {
      _searchController.text = widget.initialQuery!;
    }

    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitial();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadInitial() async {
    if (_didLoadInitial) return;

    final locationState = context.read<LocationPickerCubit>().state;
    if (locationState.status == LocationPickerStatus.loading ||
        locationState.status == LocationPickerStatus.initial) {
      return;
    }

    _didLoadInitial = true;
    final activeAddress = locationState.activeAddress;
    final hasActiveCoordinate =
        activeAddress?.latitude != null && activeAddress?.longitude != null;

    if (hasActiveCoordinate) {
      context.read<DiscoveryCubit>().setLocationContext(
        latitude: activeAddress!.latitude,
        longitude: activeAddress.longitude,
      );
    }

    if (widget.initialQuery != null && widget.initialQuery!.trim().isNotEmpty) {
      context.read<DiscoveryCubit>().updateFilter(_activeFilter);
    } else {
      if (hasActiveCoordinate) {
        context.read<DiscoveryCubit>().loadRecommendations(
          latitude: activeAddress!.latitude,
          longitude: activeAddress.longitude,
        );
        return;
      }

      final result = await LocationService().getCurrentPosition();
      if (!mounted) return;

      result.when(
        success: (position) =>
            context.read<DiscoveryCubit>().loadRecommendations(
              latitude: position.latitude,
              longitude: position.longitude,
            ),
        failure: (_) => context.read<DiscoveryCubit>().loadRecommendations(),
      );
    }
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      context.read<DiscoveryCubit>().loadMore();
    }
  }

  void _onSearchChanged(String query) {
    _applyFilter(_activeFilter.copyWith(query: query));
  }

  void _onSearchCleared() {
    _applyFilter(_activeFilter.copyWith(clearQuery: true));
  }

  void _applyFilter(DiscoveryFilter filter) {
    setState(() => _activeFilter = filter);

    if (!filter.hasQuery && !filter.hasActiveFilter) {
      context.read<DiscoveryCubit>().clearSearch();
      return;
    }

    context.read<DiscoveryCubit>().updateFilter(filter);
  }

  void _clearAll() {
    _searchController.clear();
    setState(() => _activeFilter = const DiscoveryFilter());
    context.read<DiscoveryCubit>().clearSearch();
  }

  Future<void> _showSortSelector() async {
    final result = await DiscoverySortSelectorWidget.show(
      context,
      currentSort: _activeFilter.serviceSortBy,
    );
    if (!mounted) return;

    if (result != null) {
      if (result == 'nearest' && !_hasActiveAddressCoordinate()) {
        AppSnackbar.warning(
          context,
          message:
              'Pilih alamat terlebih dahulu untuk mengurutkan berdasarkan jarak',
        );
        _applyFilter(_activeFilter.copyWith(serviceSortBy: 'relevant'));
        return;
      }

      _applyFilter(_activeFilter.copyWith(serviceSortBy: result));
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<LocationPickerCubit, LocationPickerState>(
      listener: (context, state) {
        if (!_didLoadInitial &&
            state.status != LocationPickerStatus.initial &&
            state.status != LocationPickerStatus.loading) {
          _loadInitial();
        }

        final address = state.activeAddress;
        if (!state.hasConfirmedAddress ||
            address?.latitude == null ||
            address?.longitude == null) {
          return;
        }

        context.read<DiscoveryCubit>().refreshForLocation(
          latitude: address!.latitude!,
          longitude: address.longitude!,
        );
      },
      child: AppLayout(
        header: DiscoveryStickySearchHeaderWidget(
          controller: _searchController,
          onSearchChanged: _onSearchChanged,
          onSearchCleared: _onSearchCleared,
          onBack: () => context.pop(),
          onSort: _showSortSelector,
          onRefresh: () => context.read<DiscoveryCubit>().refresh(),
        ),
        body: Column(
          children: [
            BlocBuilder<DiscoveryCubit, DiscoveryState>(
              builder: (context, state) {
                return Padding(
                  padding: EdgeInsets.only(
                    top: context.space.sm,
                    bottom: context.space.sm,
                  ),
                  child: DiscoveryQuickFilterBarWidget(
                    activeFilter: _filterForState(state),
                    services: _servicesForState(state),
                    outlets: state is DiscoveryRecommendationsLoaded
                        ? state.topOutlets
                        : const [],
                    onChanged: _applyFilter,
                    onClear: _clearAll,
                  ),
                );
              },
            ),
            Expanded(
              child: BlocBuilder<DiscoveryCubit, DiscoveryState>(
                builder: (context, state) {
                  return switch (state) {
                    DiscoveryInitial() ||
                    DiscoveryLoading() => _buildOutletSkeletons(),
                    DiscoveryFailure(:final failure) => AppEmptyState.error(
                      title: 'Gagal Memuat Discovery',
                      description: failure.message,
                      action: AppButton.primary(
                        label: 'Coba Lagi',
                        onPressed: () => context.read<DiscoveryCubit>().retry(),
                      ),
                    ),
                    DiscoveryOutletsLoaded(
                      :final outlets,
                      :final hasReachedMax,
                      :final isLoadMore,
                    ) =>
                      DiscoveryOutletContentWidget(
                        outlets: outlets,
                        hasReachedMax: hasReachedMax,
                        isLoadMore: isLoadMore,
                        scrollController: _scrollController,
                        onRefresh: () =>
                            context.read<DiscoveryCubit>().refresh(),
                        onOutletTap: (outlet) => context.push(
                          '/outlets/${outlet.id}',
                          extra: _activeLocationExtra(),
                        ),
                        onServiceTap: _openQuickSelectService,
                        onViewAllTap: (outlet) => context.push(
                          '/outlets/${outlet.id}',
                          extra: _activeLocationExtra(),
                        ),
                      ),
                    DiscoveryRecommendationsLoaded(
                      :final bestServices,
                      :final cheapestServices,
                      :final freeShippingServices,
                      :final popularServices,
                      :final topOutlets,
                    ) =>
                      DiscoveryRecommendationsContentWidget(
                        bestServices: bestServices,
                        cheapestServices: cheapestServices,
                        freeShippingServices: freeShippingServices,
                        popularServices: popularServices,
                        topOutlets: topOutlets,
                        onRefresh: () =>
                            context.read<DiscoveryCubit>().refresh(),
                        onServiceTap: _openServiceOutlet,
                        onOutletTap: (outlet) => context.push(
                          '/outlets/${outlet.id}',
                          extra: _activeLocationExtra(),
                        ),
                      ),
                    DiscoverySearchResultLoaded(
                      :final services,
                      :final activeFilter,
                      :final correctedQuery,
                      :final hasReachedMax,
                      :final isLoadMore,
                    ) =>
                      DiscoverySearchResultContentWidget(
                        services: services,
                        activeFilter: activeFilter,
                        correctedQuery: correctedQuery,
                        hasReachedMax: hasReachedMax,
                        isLoadMore: isLoadMore,
                        scrollController: _scrollController,
                        onClear: _clearAll,
                        onRefresh: () =>
                            context.read<DiscoveryCubit>().refresh(),
                        onServiceTap: _openServiceOutlet,
                      ),
                  };
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  DiscoveryFilter _filterForState(DiscoveryState state) {
    if (state is DiscoverySearchResultLoaded) return state.activeFilter;
    return _activeFilter;
  }

  List<DiscoveryService> _servicesForState(DiscoveryState state) {
    if (state is DiscoverySearchResultLoaded) return state.services;
    if (state is DiscoveryRecommendationsLoaded) return state.availableServices;
    return const [];
  }

  void _openServiceOutlet(DiscoveryService service) {
    context.push('/outlets/${service.outletId}', extra: _activeLocationExtra());
  }

  void _openQuickSelectService(DiscoveryTopService service) {
    context.push(
      '/outlets/${service.outletId}?serviceId=${service.id}&openService=true',
      extra: _activeLocationExtra(),
    );
  }

  bool _hasActiveAddressCoordinate() {
    final address = context.read<LocationPickerCubit>().state.activeAddress;
    return address?.latitude != null && address?.longitude != null;
  }

  Map<String, double>? _activeLocationExtra() {
    final address = context.read<LocationPickerCubit>().state.activeAddress;
    if (address?.latitude == null || address?.longitude == null) {
      return null;
    }

    return {'latitude': address!.latitude!, 'longitude': address.longitude!};
  }

  Widget _buildOutletSkeletons() {
    return ListView.builder(
      padding: EdgeInsets.only(bottom: context.space.xxl),
      itemCount: 4,
      itemBuilder: (context, index) =>
          const DiscoveryOutletCardSkeletonWidget(),
    );
  }
}
