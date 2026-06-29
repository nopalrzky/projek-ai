import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_nearby_usecase.dart';

import 'outlet_state.dart';

class OutletCubit extends Cubit<OutletState> {
  final GetAllUsecase _getAllUsecase;
  final GetNearbyUsecase _getNearbyUsecase;
  final GetByIdUsecase _getByIdUsecase;

  double? _lastLatitude;
  double? _lastLongitude;
  String? _lastSearch;
  bool _lastUsedGps = false;
  int _perPage = 15;

  OutletCubit({
    required GetAllUsecase getAllUsecase,
    required GetNearbyUsecase getNearbyUsecase,
    required GetByIdUsecase getByIdUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getNearbyUsecase = getNearbyUsecase,
       _getByIdUsecase = getByIdUsecase,
       super(const OutletInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    bool? isExposure = true,
    String? status,
    int? provinceId,
    int? cityId,
    int? districtId,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    double? latitude,
    double? longitude,
    bool forceRefresh = false,
  }) async {
    _perPage = perPage;
    _lastLatitude = latitude;
    _lastLongitude = longitude;
    _lastSearch = search;
    _lastUsedGps = false;

    if (page == 1 || forceRefresh) {
      emit(const OutletLoading());
    }

    final result = await _getAllUsecase(
      page: page,
      perPage: perPage,
      search: search,
      isExposure: isExposure,
      status: status,
      provinceId: provinceId,
      cityId: cityId,
      districtId: districtId,
      sortBy: sortBy,
      sortDirection: sortDirection,
      latitude: latitude,
      longitude: longitude,
    );

    result.when(
      success: (outlets) {
        if (page == 1 || forceRefresh || state is! OutletsLoaded) {
          emit(
            OutletsLoaded(
              outlets: outlets,
              hasReachedMax: outlets.length < perPage,
              currentPage: page,
              isGpsActive: false,
            ),
          );
          return;
        }

        final currentState = state;
        if (currentState is OutletsLoaded) {
          emit(
            currentState.copyWith(
              outlets: [...currentState.outlets, ...outlets],
              hasReachedMax: outlets.isEmpty || outlets.length < perPage,
              currentPage: page,
              isLoadMore: false,
            ),
          );
        }
      },
      failure: (failure) => emit(OutletFailure(failure)),
    );
  }

  Future<void> getNearby({
    required double latitude,
    required double longitude,
    int page = 1,
    int perPage = 15,
    String? search,
    double radius = 10.0,
    bool forceRefresh = false,
  }) async {
    _perPage = perPage;
    _lastLatitude = latitude;
    _lastLongitude = longitude;
    _lastSearch = search;
    _lastUsedGps = true;

    if (page == 1 || forceRefresh) {
      emit(const OutletLoading());
    }

    final result = await _getNearbyUsecase(
      latitude: latitude,
      longitude: longitude,
      radius: radius,
      page: page,
      perPage: perPage,
      search: search,
    );

    result.when(
      success: (outlets) {
        if (page == 1 || forceRefresh || state is! OutletsLoaded) {
          emit(
            OutletsLoaded(
              outlets: outlets,
              hasReachedMax: outlets.length < perPage,
              currentPage: page,
              isGpsActive: true,
            ),
          );
          return;
        }

        final currentState = state;
        if (currentState is OutletsLoaded) {
          emit(
            currentState.copyWith(
              outlets: [...currentState.outlets, ...outlets],
              hasReachedMax: outlets.isEmpty || outlets.length < perPage,
              currentPage: page,
              isGpsActive: true,
              isLoadMore: false,
            ),
          );
        }
      },
      failure: (failure) => emit(OutletFailure(failure)),
    );
  }

  Future<void> getById({
    required int id,
    double? latitude,
    double? longitude,
  }) async {
    emit(const OutletLoading());

    final result = await _getByIdUsecase(
      id: id,
      latitude: latitude,
      longitude: longitude,
    );
    result.when(
      success: (outlet) => emit(OutletDetailLoaded(outlet)),
      failure: (failure) => emit(OutletFailure(failure)),
    );
  }

  void selectCategory(int? categoryId) {
    final currentState = state;
    if (currentState is OutletDetailLoaded) {
      emit(currentState.copyWith(selectedCategoryId: categoryId));
    }
  }

  Future<void> loadMore() async {
    final currentState = state;
    if (currentState is! OutletsLoaded) return;
    if (currentState.hasReachedMax || currentState.isLoadMore) return;

    emit(currentState.copyWith(isLoadMore: true));

    final nextPage = currentState.currentPage + 1;

    if (_lastUsedGps && _lastLatitude != null && _lastLongitude != null) {
      await getNearby(
        latitude: _lastLatitude!,
        longitude: _lastLongitude!,
        page: nextPage,
        perPage: _perPage,
        search: _lastSearch,
      );
      return;
    }

    await getAll(
      page: nextPage,
      perPage: _perPage,
      isExposure: true,
      search: _lastSearch,
      latitude: _lastLatitude,
      longitude: _lastLongitude,
    );
  }

  Future<void> refresh() async {
    if (_lastUsedGps && _lastLatitude != null && _lastLongitude != null) {
      await getNearby(
        latitude: _lastLatitude!,
        longitude: _lastLongitude!,
        page: 1,
        perPage: _perPage,
        search: _lastSearch,
        forceRefresh: true,
      );
      return;
    }

    await getAll(
      page: 1,
      perPage: _perPage,
      search: _lastSearch,
      latitude: _lastLatitude,
      longitude: _lastLongitude,
      forceRefresh: true,
    );
  }

  Future<void> fetch({
    double? lat,
    double? lng,
    String? search,
    bool useNearby = true,
    bool isRefresh = false,
    int perPage = 15,
  }) async {
    if (lat != null && lng != null && useNearby) {
      await getNearby(
        latitude: lat,
        longitude: lng,
        page: 1,
        perPage: perPage,
        search: search,
        forceRefresh: isRefresh,
      );
      return;
    }

    await getAll(
      page: 1,
      perPage: perPage,
      search: search,
      isExposure: true,
      latitude: lat,
      longitude: lng,
      forceRefresh: isRefresh,
    );
  }

  Future<void> loadById(int id, {double? latitude, double? longitude}) async {
    await getById(id: id, latitude: latitude, longitude: longitude);
  }
}
