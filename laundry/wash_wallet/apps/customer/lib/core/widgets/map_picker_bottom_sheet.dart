import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geocoding/geocoding.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:dio/dio.dart';
import '../services/location_service.dart';
import '../services/places_service.dart';

class MapPickerBottomSheet extends StatefulWidget {
  final LatLng? initialLocation;

  const MapPickerBottomSheet({super.key, this.initialLocation});

  static Future<Map<String, dynamic>?> show(
    BuildContext context, {
    LatLng? initialLocation,
  }) {
    return showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) =>
          MapPickerBottomSheet(initialLocation: initialLocation),
    );
  }

  @override
  State<MapPickerBottomSheet> createState() => _MapPickerBottomSheetState();
}

class _MapPickerBottomSheetState extends State<MapPickerBottomSheet> {
  late GoogleMapController _mapController;
  LatLng? _currentPosition;
  String _currentAddress = 'Mencari alamat...';
  bool _isLoadingAddress = false;
  String? _villageName;
  String? _districtName;
  String? _regencyName;
  String? _provinceName;

  final _searchController = TextEditingController();
  List<Map<String, dynamic>> _predictions = [];
  Timer? _debounce;
  late final PlacesService _placesService;

  @override
  void initState() {
    super.initState();
    _placesService = PlacesService(Dio());
    _currentPosition =
        widget.initialLocation ??
        const LatLng(-6.200000, 106.816666); // Jakarta default
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      if (query.isEmpty) {
        setState(() => _predictions = []);
        return;
      }

      final result = await _placesService.getAutocomplete(query);
      result.when(
        success: (predictions) {
          setState(() => _predictions = predictions);
        },
        failure: (_) {},
      );
    });
  }

  Future<void> _onPredictionSelected(Map<String, dynamic> prediction) async {
    final placeId = prediction['place_id'];
    final result = await _placesService.getPlaceDetails(placeId);

    result.when(
      success: (details) {
        final location = details['geometry']['location'];
        final latLng = LatLng(location['lat'], location['lng']);

        _mapController.animateCamera(CameraUpdate.newLatLng(latLng));
        setState(() {
          _predictions = [];
          _searchController.clear();
          FocusScope.of(context).unfocus();
        });
      },
      failure: (failure) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(failure.message)));
      },
    );
  }

  Future<void> _getCurrentLocation() async {
    final locationService = LocationService();
    final result = await locationService.getCurrentPosition();

    result.when(
      success: (position) {
        final latLng = LatLng(position.latitude, position.longitude);
        _mapController.animateCamera(CameraUpdate.newLatLng(latLng));
      },
      failure: (failure) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(failure.message)));
      },
    );
  }

  Future<void> _getAddressFromLatLng(LatLng position) async {
    setState(() {
      _isLoadingAddress = true;
      _currentAddress = 'Mencari alamat...';
    });

    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        setState(() {
          _currentAddress =
              '${place.street}, ${place.subLocality}, ${place.locality}, ${place.subAdministrativeArea}';
          _villageName = place.subLocality;
          _districtName = place.locality;
          _regencyName = place.subAdministrativeArea;
          _provinceName = place.administrativeArea;
          _isLoadingAddress = false;
        });
      }
    } catch (e) {
      setState(() {
        _currentAddress = 'Gagal mendapatkan alamat';
        _isLoadingAddress = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(context.radius.xl),
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(context.space.md),
            child: Row(
              children: [
                AppButton.ghost(
                  label: 'Batal',
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
                Expanded(
                  child: Text(
                    'Pilih Lokasi',
                    style: context.typography.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(width: 48), // Spacer for centering
              ],
            ),
          ),

          // Search Bar
          Padding(
            padding: EdgeInsets.symmetric(horizontal: context.space.lg),
            child: Stack(
              children: [
                AppTextField.outlined(
                  controller: _searchController,
                  hint: 'Cari lokasi atau jalan...',
                  prefixIcon: const Icon(Icons.search),
                  onChanged: _onSearchChanged,
                ),
                if (_predictions.isNotEmpty)
                  Positioned(
                    top: 55,
                    left: 0,
                    right: 0,
                    child: Container(
                      constraints: const BoxConstraints(maxHeight: 200),
                      decoration: BoxDecoration(
                        color: context.colors.surface,
                        borderRadius: BorderRadius.circular(context.radius.md),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: _predictions.length,
                        itemBuilder: (context, index) {
                          final prediction = _predictions[index];
                          return ListTile(
                            leading: const Icon(Icons.location_on_outlined),
                            title: Text(prediction['description']),
                            onTap: () => _onPredictionSelected(prediction),
                          );
                        },
                      ),
                    ),
                  ),
              ],
            ),
          ),

          SizedBox(height: context.space.md),

          // Map
          Expanded(
            child: Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: _currentPosition!,
                    zoom: 15,
                  ),
                  onMapCreated: (controller) => _mapController = controller,
                  onCameraMove: (position) {
                    _currentPosition = position.target;
                  },
                  onCameraIdle: () {
                    if (_currentPosition != null) {
                      _getAddressFromLatLng(_currentPosition!);
                    }
                  },
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                ),
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 36),
                    child: Icon(
                      Icons.location_on,
                      size: 48,
                      color: context.colors.primary,
                    ),
                  ),
                ),
                Positioned(
                  bottom: context.space.lg,
                  right: context.space.lg,
                  child: FloatingActionButton(
                    onPressed: _getCurrentLocation,
                    backgroundColor: context.colors.surface,
                    child: Icon(
                      Icons.my_location,
                      color: context.colors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Footer info
          Container(
            padding: EdgeInsets.all(context.space.lg),
            decoration: BoxDecoration(
              color: context.colors.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Alamat Terpilih',
                  style: context.typography.labelSmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.location_on_outlined,
                      size: 18,
                      color: context.colors.primary,
                    ),
                    SizedBox(width: context.space.xs),
                    Expanded(
                      child: Text(
                        _currentAddress,
                        style: context.typography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: context.space.lg),
                AppButton.primary(
                  label: 'Konfirmasi Lokasi',
                  isFullWidth: true,
                  isLoading: _isLoadingAddress,
                  onPressed: () {
                    Navigator.pop(context, {
                      'latitude': _currentPosition?.latitude,
                      'longitude': _currentPosition?.longitude,
                      'address': _currentAddress,
                      'villageName': _villageName,
                      'districtName': _districtName,
                      'regencyName': _regencyName,
                      'provinceName': _provinceName,
                    });
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
