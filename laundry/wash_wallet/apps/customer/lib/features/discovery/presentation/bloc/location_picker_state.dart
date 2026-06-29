import 'package:equatable/equatable.dart';

import '../../../customer_address/domain/entities/customer_address.dart';

enum LocationPickerStatus { initial, loading, loaded, confirming, error }

class LocationPickerState extends Equatable {
  final LocationPickerStatus status;
  final CustomerAddress? activeAddress;
  final CustomerAddress? selectedCandidate;
  final List<Map<String, dynamic>> searchResults;
  final List<CustomerAddress> favoriteAddresses;
  final List<CustomerAddress> recentAddresses;
  final String searchKeyword;
  final bool isSearching;
  final bool isResolvingCurrentLocation;
  final bool hasConfirmedAddress;
  final String? errorMessage;

  const LocationPickerState({
    this.status = LocationPickerStatus.initial,
    this.activeAddress,
    this.selectedCandidate,
    this.searchResults = const [],
    this.favoriteAddresses = const [],
    this.recentAddresses = const [],
    this.searchKeyword = '',
    this.isSearching = false,
    this.isResolvingCurrentLocation = false,
    this.hasConfirmedAddress = false,
    this.errorMessage,
  });

  LocationPickerState copyWith({
    LocationPickerStatus? status,
    CustomerAddress? activeAddress,
    CustomerAddress? selectedCandidate,
    List<Map<String, dynamic>>? searchResults,
    List<CustomerAddress>? favoriteAddresses,
    List<CustomerAddress>? recentAddresses,
    String? searchKeyword,
    bool? isSearching,
    bool? isResolvingCurrentLocation,
    bool? hasConfirmedAddress,
    String? errorMessage,
    bool clearSelectedCandidate = false,
    bool clearErrorMessage = false,
  }) {
    return LocationPickerState(
      status: status ?? this.status,
      activeAddress: activeAddress ?? this.activeAddress,
      selectedCandidate: clearSelectedCandidate
          ? null
          : selectedCandidate ?? this.selectedCandidate,
      searchResults: searchResults ?? this.searchResults,
      favoriteAddresses: favoriteAddresses ?? this.favoriteAddresses,
      recentAddresses: recentAddresses ?? this.recentAddresses,
      searchKeyword: searchKeyword ?? this.searchKeyword,
      isSearching: isSearching ?? this.isSearching,
      isResolvingCurrentLocation:
          isResolvingCurrentLocation ?? this.isResolvingCurrentLocation,
      hasConfirmedAddress: hasConfirmedAddress ?? this.hasConfirmedAddress,
      errorMessage: clearErrorMessage
          ? null
          : errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
    status,
    activeAddress,
    selectedCandidate,
    searchResults,
    favoriteAddresses,
    recentAddresses,
    searchKeyword,
    isSearching,
    isResolvingCurrentLocation,
    hasConfirmedAddress,
    errorMessage,
  ];
}
