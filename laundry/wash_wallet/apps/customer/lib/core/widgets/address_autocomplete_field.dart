import 'dart:async';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../services/places_service.dart';

class AddressAutocompleteField extends StatefulWidget {
  final TextEditingController controller;
  final void Function(double lat, double lng, String address) onPlaceSelected;
  final bool enabled;
  final String? Function(String?)? validator;
  final String? label;
  final String? hint;

  const AddressAutocompleteField({
    super.key,
    required this.controller,
    required this.onPlaceSelected,
    this.enabled = true,
    this.validator,
    this.label,
    this.hint,
  });

  @override
  State<AddressAutocompleteField> createState() =>
      _AddressAutocompleteFieldState();
}

class _AddressAutocompleteFieldState extends State<AddressAutocompleteField> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  List<Map<String, dynamic>> _predictions = [];
  bool _isLoading = false;
  Timer? _debounce;
  String? _sessionToken;
  late final PlacesService _placesService;

  @override
  void initState() {
    super.initState();
    _placesService = PlacesService(Dio());
    _generateSessionToken();
  }

  @override
  void dispose() {
    _removeOverlay();
    _debounce?.cancel();
    super.dispose();
  }

  void _generateSessionToken() {
    final random = Random();
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    _sessionToken = List.generate(
      32,
      (index) => chars[random.nextInt(chars.length)],
    ).join();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      if (query.isEmpty || query.length < 3) {
        _predictions = [];
        _removeOverlay();
        return;
      }

      setState(() => _isLoading = true);
      final result = await _placesService.getAutocomplete(
        query,
        sessionToken: _sessionToken,
      );
      setState(() => _isLoading = false);

      result.when(
        success: (predictions) {
          setState(() {
            _predictions = predictions;
          });
          if (_predictions.isNotEmpty) {
            _showOverlay();
          } else {
            _removeOverlay();
          }
        },
        failure: (_) {
          _removeOverlay();
        },
      );
    });
  }

  void _showOverlay() {
    _removeOverlay();
    final renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        width: size.width,
        child: CompositedTransformFollower(
          link: _layerLink,
          showWhenUnlinked: false,
          offset: Offset(0, size.height + 5),
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(context.radius.md),
            color: context.colors.surface,
            child: Container(
              constraints: const BoxConstraints(maxHeight: 250),
              decoration: BoxDecoration(
                border: Border.all(color: context.colors.border),
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
              child: ListView.separated(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                itemCount: _predictions.length,
                separatorBuilder: (context, index) => Divider(
                  height: 1,
                  color: context.colors.border.withValues(alpha: 0.5),
                ),
                itemBuilder: (context, index) {
                  final prediction = _predictions[index];
                  return ListTile(
                    dense: true,
                    leading: Icon(
                      Icons.location_on_outlined,
                      size: 20,
                      color: context.colors.primary,
                    ),
                    title: Text(
                      prediction['description'],
                      style: context.typography.bodyMedium,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    onTap: () => _onPredictionSelected(prediction),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  Future<void> _onPredictionSelected(Map<String, dynamic> prediction) async {
    final placeId = prediction['place_id'];

    _removeOverlay();
    FocusScope.of(context).unfocus();

    setState(() => _isLoading = true);
    final result = await _placesService.getPlaceDetails(
      placeId,
      sessionToken: _sessionToken,
    );
    setState(() => _isLoading = false);

    result.when(
      success: (details) {
        final location = details['geometry']['location'];
        final lat = location['lat'] as double;
        final lng = location['lng'] as double;
        final formattedAddress = details['formatted_address'] as String;

        widget.controller.text = formattedAddress;
        widget.onPlaceSelected(lat, lng, formattedAddress);
        _generateSessionToken(); // Reset token after completion
      },
      failure: (failure) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(failure.message)));
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: AppTextField.outlined(
        label: widget.label,
        hint: widget.hint,
        controller: widget.controller,
        enabled: widget.enabled,
        validator: widget.validator,
        maxLines: 3,
        onChanged: _onSearchChanged,
        suffixIcon: _isLoading
            ? Padding(
                padding: const EdgeInsets.all(12.0),
                child: SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      context.colors.primary,
                    ),
                  ),
                ),
              )
            : widget.controller.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear_rounded, size: 20),
                onPressed: () {
                  widget.controller.clear();
                  _onSearchChanged('');
                },
              )
            : null,
      ),
    );
  }
}
