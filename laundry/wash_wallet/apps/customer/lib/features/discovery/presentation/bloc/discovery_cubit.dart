import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/discovery_filter.dart';
import '../../domain/usecases/get_discovery_outlets_usecase.dart';
import '../../domain/usecases/search_services_usecase.dart';
import 'discovery_state.dart';

class DiscoveryCubit extends Cubit<DiscoveryState> {
  final SearchServicesUsecase _searchServicesUsecase;
  final GetDiscoveryOutletsUsecase _getDiscoveryOutletsUsecase;

  double? _lastLatitude;
  double? _lastLongitude;
  DiscoveryFilter _lastFilter = const DiscoveryFilter();
  int _perPage = 15;
  int _requestSequence = 0;
  final Set<String> _activeSearchRequests = <String>{};

  DiscoveryCubit({
    required SearchServicesUsecase searchServicesUsecase,
    required GetDiscoveryOutletsUsecase getDiscoveryOutletsUsecase,
  }) : _searchServicesUsecase = searchServicesUsecase,
       _getDiscoveryOutletsUsecase = getDiscoveryOutletsUsecase,
       super(const DiscoveryInitial());

  Future<void> loadRecommendations({
    double? latitude,
    double? longitude,
  }) async {
    _lastLatitude = latitude;
    _lastLongitude = longitude;
    _lastFilter = const DiscoveryFilter();

    emit(const DiscoveryLoading());

    final result = await _getDiscoveryOutletsUsecase(
      latitude: latitude,
      longitude: longitude,
      perPage: _perPage,
    );

    result.when(
      success: (outlets) => emit(
        DiscoveryOutletsLoaded(
          outlets: outlets,
          hasReachedMax: outlets.length < _perPage,
          currentPage: 1,
        ),
      ),
      failure: (failure) => emit(DiscoveryFailure(failure)),
    );
  }

  Future<void> search(
    DiscoveryFilter filter, {
    int page = 1,
    int perPage = 15,
    bool forceRefresh = false,
  }) async {
    _lastFilter = filter;
    _perPage = perPage;

    final requestKey = _buildRequestKey(
      filter: filter,
      page: page,
      perPage: perPage,
      forceRefresh: forceRefresh,
    );

    if (!forceRefresh && _activeSearchRequests.contains(requestKey)) {
      return;
    }

    _activeSearchRequests.add(requestKey);
    final thisSequence = ++_requestSequence;

    if (page == 1 || forceRefresh) {
      emit(const DiscoveryLoading());
    }

    try {
      final previousState = state;
      final result = await _searchServicesUsecase(
        filter: filter,
        page: page,
        perPage: perPage,
        latitude: _lastLatitude,
        longitude: _lastLongitude,
      );

      result.when(
        success: (searchResult) {
          if (thisSequence != _requestSequence) return;

          if (page > 1 && previousState is DiscoverySearchResultLoaded) {
            emit(
              DiscoverySearchResultLoaded(
                services: [...previousState.services, ...searchResult.services],
                activeFilter: searchResult.activeFilter,
                correctedQuery: searchResult.correctedQuery,
                hasReachedMax: searchResult.hasReachedMax,
                currentPage: searchResult.currentPage,
              ),
            );
            return;
          }

          emit(
            DiscoverySearchResultLoaded(
              services: searchResult.services,
              activeFilter: searchResult.activeFilter,
              correctedQuery: searchResult.correctedQuery,
              hasReachedMax: searchResult.hasReachedMax,
              currentPage: searchResult.currentPage,
            ),
          );
        },
        failure: (failure) {
          if (thisSequence != _requestSequence) return;
          emit(DiscoveryFailure(failure));
        },
      );
    } finally {
      _activeSearchRequests.remove(requestKey);
    }
  }

  Future<void> loadMore() async {
    final currentState = state;
    if (currentState is DiscoveryOutletsLoaded) {
      return loadMoreOutlets();
    }

    if (currentState is! DiscoverySearchResultLoaded) return;
    if (currentState.hasReachedMax || currentState.isLoadMore) return;

    emit(currentState.copyWith(isLoadMore: true));
    await search(
      currentState.activeFilter,
      page: currentState.currentPage + 1,
      perPage: _perPage,
    );
  }

  Future<void> loadMoreOutlets() async {
    final currentState = state;
    if (currentState is! DiscoveryOutletsLoaded) return;
    if (currentState.hasReachedMax || currentState.isLoadMore) return;

    emit(currentState.copyWith(isLoadMore: true));

    final nextPage = currentState.currentPage + 1;
    final result = await _getDiscoveryOutletsUsecase(
      latitude: _lastLatitude,
      longitude: _lastLongitude,
      page: nextPage,
      perPage: _perPage,
    );

    result.when(
      success: (outlets) => emit(
        DiscoveryOutletsLoaded(
          outlets: [...currentState.outlets, ...outlets],
          hasReachedMax: outlets.length < _perPage,
          currentPage: nextPage,
        ),
      ),
      failure: (failure) => emit(DiscoveryFailure(failure)),
    );
  }

  Future<void> updateFilter(DiscoveryFilter filter) {
    return search(filter, perPage: _perPage);
  }

  void setLocationContext({double? latitude, double? longitude}) {
    _lastLatitude = latitude;
    _lastLongitude = longitude;
  }

  Future<void> clearSearch() {
    _lastFilter = const DiscoveryFilter();
    return loadRecommendations(
      latitude: _lastLatitude,
      longitude: _lastLongitude,
    );
  }

  Future<void> refreshForLocation({
    required double latitude,
    required double longitude,
  }) {
    _lastLatitude = latitude;
    _lastLongitude = longitude;

    if (_lastFilter.hasQuery || _lastFilter.hasActiveFilter) {
      return search(_lastFilter, perPage: _perPage, forceRefresh: true);
    }

    return loadRecommendations(latitude: latitude, longitude: longitude);
  }

  Future<void> refresh() {
    final currentState = state;
    if (currentState is DiscoverySearchResultLoaded) {
      return search(
        currentState.activeFilter,
        perPage: _perPage,
        forceRefresh: true,
      );
    }

    return loadRecommendations(
      latitude: _lastLatitude,
      longitude: _lastLongitude,
    );
  }

  Future<void> retry() {
    if (_lastFilter.hasQuery || _lastFilter.hasActiveFilter) {
      return search(_lastFilter, perPage: _perPage, forceRefresh: true);
    }

    return loadRecommendations(
      latitude: _lastLatitude,
      longitude: _lastLongitude,
    );
  }

  String _buildRequestKey({
    required DiscoveryFilter filter,
    required int page,
    required int perPage,
    required bool forceRefresh,
  }) {
    return [
      filter.query?.trim() ?? '',
      filter.outletId?.toString() ?? '',
      filter.categoryId?.toString() ?? '',
      filter.unitId?.toString() ?? '',
      filter.priceMin?.toString() ?? '',
      filter.priceMax?.toString() ?? '',
      filter.freeShippingEligible?.toString() ?? '',
      filter.supportsCourier?.toString() ?? '',
      filter.serviceSortBy,
      filter.isCurrentlyOpen?.toString() ?? '',
      filter.minRating?.toString() ?? '',
      filter.paymentMethod ?? '',
      page.toString(),
      perPage.toString(),
      forceRefresh.toString(),
      _lastLatitude?.toStringAsFixed(6) ?? '',
      _lastLongitude?.toStringAsFixed(6) ?? '',
    ].join('|');
  }
}
