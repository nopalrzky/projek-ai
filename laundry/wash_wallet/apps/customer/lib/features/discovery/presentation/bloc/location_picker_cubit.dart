import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geocoding/geocoding.dart';

import '../../../../core/services/location_service.dart';
import '../../../../core/services/places_service.dart';
import '../../../customer_address/domain/entities/customer_address.dart';
import '../../../customer_address/domain/usecases/get_all_usecase.dart'
    as customer_address;
import '../../domain/usecases/recent_address/get_all_usecase.dart'
    as recent_address;
import '../../domain/usecases/recent_address/save_usecase.dart'
    as recent_address;
import 'location_picker_state.dart';

class LocationPickerCubit extends Cubit<LocationPickerState> {
  final customer_address.GetAllUsecase _getCustomerAddressesUsecase;
  final recent_address.GetAllUsecase _getRecentAddressesUsecase;
  final recent_address.SaveUsecase _saveRecentAddressUsecase;
  final LocationService _locationService;
  final PlacesService _placesService;

  LocationPickerCubit({
    required customer_address.GetAllUsecase getCustomerAddressesUsecase,
    required recent_address.GetAllUsecase getRecentAddressesUsecase,
    required recent_address.SaveUsecase saveRecentAddressUsecase,
    required LocationService locationService,
    required PlacesService placesService,
  }) : _getCustomerAddressesUsecase = getCustomerAddressesUsecase,
       _getRecentAddressesUsecase = getRecentAddressesUsecase,
       _saveRecentAddressUsecase = saveRecentAddressUsecase,
       _locationService = locationService,
       _placesService = placesService,
       super(const LocationPickerState());

  Future<void> init() async {
    emit(state.copyWith(status: LocationPickerStatus.loading));

    var favorites = const <CustomerAddress>[];
    var recents = const <CustomerAddress>[];
    String? errorMessage;

    final favoriteResult = await _getCustomerAddressesUsecase(perPage: 50);
    favoriteResult.when(
      success: (addresses) => favorites = addresses,
      failure: (failure) => errorMessage = failure.message,
    );

    final recentResult = await _getRecentAddressesUsecase();
    recentResult.when(
      success: (addresses) => recents = addresses,
      failure: (failure) => errorMessage ??= failure.message,
    );

    final primaryAddress = favorites.where((address) => address.isPrimary);
    final activeAddress = recents.isNotEmpty
        ? recents.first
        : primaryAddress.isNotEmpty
        ? primaryAddress.first
        : favorites.isNotEmpty
        ? favorites.first
        : null;

    emit(
      state.copyWith(
        status: errorMessage == null
            ? LocationPickerStatus.loaded
            : LocationPickerStatus.error,
        activeAddress: activeAddress,
        favoriteAddresses: favorites,
        recentAddresses: recents,
        errorMessage: errorMessage,
      ),
    );
  }

  Future<void> searchAddress({required String keyword}) async {
    final trimmedKeyword = keyword.trim();

    if (trimmedKeyword.length < 3) {
      emit(
        state.copyWith(
          searchKeyword: keyword,
          searchResults: const [],
          isSearching: false,
          clearErrorMessage: true,
        ),
      );
      return;
    }

    emit(
      state.copyWith(
        status: LocationPickerStatus.loaded,
        searchKeyword: keyword,
        isSearching: true,
        clearErrorMessage: true,
      ),
    );

    final result = await _placesService.getAutocomplete(trimmedKeyword);
    result.when(
      success: (predictions) => emit(
        state.copyWith(
          searchResults: predictions,
          isSearching: false,
          clearErrorMessage: true,
        ),
      ),
      failure: (failure) => emit(
        state.copyWith(
          searchResults: const [],
          isSearching: false,
          errorMessage: failure.message,
        ),
      ),
    );
  }

  void clearSearch() {
    emit(
      state.copyWith(
        searchKeyword: '',
        searchResults: const [],
        isSearching: false,
        clearErrorMessage: true,
      ),
    );
  }

  Future<void> selectSearchResult({
    required Map<String, dynamic> result,
  }) async {
    final placeId = result['place_id']?.toString();
    final description = result['description']?.toString() ?? '';

    if (placeId == null || placeId.isEmpty) {
      emit(state.copyWith(errorMessage: 'Alamat tidak valid.'));
      return;
    }

    emit(state.copyWith(isSearching: true, clearErrorMessage: true));

    final detailResult = await _placesService.getPlaceDetails(placeId);
    detailResult.when(
      success: (details) {
        final location = details['geometry']?['location'];
        final latitude = _toDouble(location?['lat']);
        final longitude = _toDouble(location?['lng']);
        final address = details['formatted_address']?.toString() ?? description;

        emit(
          state.copyWith(
            selectedCandidate: _buildCandidate(
              label: 'Alamat baru',
              street: address,
              latitude: latitude,
              longitude: longitude,
            ),
            isSearching: false,
            clearErrorMessage: true,
          ),
        );
      },
      failure: (failure) => emit(
        state.copyWith(isSearching: false, errorMessage: failure.message),
      ),
    );
  }

  Future<void> useCurrentLocation() async {
    emit(
      state.copyWith(isResolvingCurrentLocation: true, clearErrorMessage: true),
    );

    final result = await _locationService.getCurrentPosition();
    await result.when(
      success: (position) async {
        final address = await _resolveAddress(
          latitude: position.latitude,
          longitude: position.longitude,
        );

        emit(
          state.copyWith(
            selectedCandidate: _buildCandidate(
              label: 'Lokasi saat ini',
              street: address,
              latitude: position.latitude,
              longitude: position.longitude,
            ),
            isResolvingCurrentLocation: false,
            clearErrorMessage: true,
          ),
        );
      },
      failure: (failure) async {
        emit(
          state.copyWith(
            isResolvingCurrentLocation: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  void selectFavoriteAddress({required CustomerAddress address}) {
    emit(state.copyWith(selectedCandidate: address, clearErrorMessage: true));
  }

  void selectRecentAddress({required CustomerAddress address}) {
    emit(state.copyWith(selectedCandidate: address, clearErrorMessage: true));
  }

  void selectMapResult({required Map<String, dynamic> result}) {
    final latitude = _toDouble(result['latitude']);
    final longitude = _toDouble(result['longitude']);
    final address = result['address']?.toString() ?? '';

    if (latitude == null || longitude == null || address.isEmpty) {
      emit(state.copyWith(errorMessage: 'Alamat dari peta belum valid.'));
      return;
    }

    emit(
      state.copyWith(
        selectedCandidate: _buildCandidate(
          label: 'Pin peta',
          street: address,
          latitude: latitude,
          longitude: longitude,
          villageName: result['villageName']?.toString(),
          districtName: result['districtName']?.toString(),
          regencyName: result['regencyName']?.toString(),
          provinceName: result['provinceName']?.toString(),
        ),
        clearErrorMessage: true,
      ),
    );
  }

  Future<CustomerAddress?> confirmAddress() async {
    final selectedAddress = state.selectedCandidate;
    if (selectedAddress == null ||
        selectedAddress.latitude == null ||
        selectedAddress.longitude == null) {
      emit(state.copyWith(errorMessage: 'Pilih alamat yang valid.'));
      return null;
    }

    emit(state.copyWith(status: LocationPickerStatus.confirming));

    final result = await _saveRecentAddressUsecase(selectedAddress);
    CustomerAddress? confirmedAddress;
    result.when(
      success: (_) {
        confirmedAddress = selectedAddress;
      },
      failure: (failure) {
        emit(
          state.copyWith(
            status: LocationPickerStatus.error,
            errorMessage: failure.message,
          ),
        );
      },
    );

    if (confirmedAddress == null) return null;

    final recentResult = await _getRecentAddressesUsecase();
    var recents = state.recentAddresses;
    recentResult.when(
      success: (addresses) => recents = addresses,
      failure: (_) {},
    );

    emit(
      state.copyWith(
        status: LocationPickerStatus.loaded,
        activeAddress: confirmedAddress,
        recentAddresses: recents,
        hasConfirmedAddress: true,
        clearSelectedCandidate: true,
        clearErrorMessage: true,
      ),
    );

    emit(state.copyWith(hasConfirmedAddress: false));
    return confirmedAddress;
  }

  void resetSelection() {
    emit(state.copyWith(clearSelectedCandidate: true, clearErrorMessage: true));
  }

  Future<String> _resolveAddress({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final placemarks = await placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isEmpty) return 'Lokasi saat ini';
      final place = placemarks.first;
      return [
        place.street,
        place.subLocality,
        place.locality,
        place.subAdministrativeArea,
      ].where((part) => part != null && part.isNotEmpty).join(', ');
    } catch (_) {
      return 'Lokasi saat ini';
    }
  }

  CustomerAddress _buildCandidate({
    required String label,
    required String street,
    double? latitude,
    double? longitude,
    String? villageName,
    String? districtName,
    String? regencyName,
    String? provinceName,
  }) {
    return CustomerAddress(
      id: 0,
      label: label,
      recipientName: '',
      recipientPhone: '',
      street: street,
      latitude: latitude,
      longitude: longitude,
      isPrimary: false,
      villageName: villageName,
      districtName: districtName,
      regencyName: regencyName,
      provinceName: provinceName,
    );
  }

  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }
}
