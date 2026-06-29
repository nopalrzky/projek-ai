import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_filter.dart';
import '../../domain/entities/discovery_service.dart';
import 'discovery_price_preset_filter_widget.dart';
import 'discovery_price_range_filter_widget.dart';

class DiscoveryFilterBottomSheetWidget extends StatefulWidget {
  final DiscoveryFilter initialFilter;
  final List<DiscoveryService> services;
  final List<Outlet> outlets;

  const DiscoveryFilterBottomSheetWidget({
    super.key,
    required this.initialFilter,
    required this.services,
    required this.outlets,
  });

  static Future<DiscoveryFilter?> show(
    BuildContext context, {
    required DiscoveryFilter initialFilter,
    required List<DiscoveryService> services,
    required List<Outlet> outlets,
  }) {
    return AppBottomSheet.show<DiscoveryFilter>(
      context,
      title: 'Filter',
      variant: AppBottomSheetVariant.filter,
      child: DiscoveryFilterBottomSheetWidget(
        initialFilter: initialFilter,
        services: services,
        outlets: outlets,
      ),
    );
  }

  @override
  State<DiscoveryFilterBottomSheetWidget> createState() =>
      _DiscoveryFilterBottomSheetWidgetState();
}

class _DiscoveryFilterBottomSheetWidgetState
    extends State<DiscoveryFilterBottomSheetWidget> {
  late DiscoveryFilter _filter;
  late TextEditingController _minController;
  late TextEditingController _maxController;

  @override
  void initState() {
    super.initState();
    _filter = widget.initialFilter;
    _minController = TextEditingController(
      text: _filter.priceMin?.toStringAsFixed(0) ?? '',
    );
    _maxController = TextEditingController(
      text: _filter.priceMax?.toStringAsFixed(0) ?? '',
    );
  }

  @override
  void dispose() {
    _minController.dispose();
    _maxController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DiscoveryPriceRangeFilterWidget(
          minController: _minController,
          maxController: _maxController,
          onChanged: (min, max) => setState(() {
            _filter = _filter
                .copyWith(clearPrice: true)
                .copyWith(priceMin: min, priceMax: max);
          }),
        ),
        SizedBox(height: context.space.md),
        DiscoveryPricePresetFilterWidget(
          selectedPreset: _getPresetIndex(),
          onChanged: (preset) {
            setState(() {
              _minController.text = preset.min != null
                  ? preset.min!.toStringAsFixed(0)
                  : '';
              _maxController.text = preset.max != null
                  ? preset.max!.toStringAsFixed(0)
                  : '';
              _filter = _filter
                  .copyWith(clearPrice: true)
                  .copyWith(priceMin: preset.min, priceMax: preset.max);
            });
          },
        ),
        SizedBox(height: context.space.xl),
        Row(
          children: [
            Expanded(
              child: AppButton.outline(
                label: 'Atur Ulang',
                onPressed: () => Navigator.of(
                  context,
                ).pop(DiscoveryFilter(query: widget.initialFilter.query)),
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: AppButton.primary(
                label: 'Terapkan',
                onPressed: () => Navigator.of(context).pop(_normalizedFilter),
              ),
            ),
          ],
        ),
      ],
    );
  }

  int? _getPresetIndex() {
    if (_filter.priceMin == 0 && _filter.priceMax == 25000) return 0;
    if (_filter.priceMin == 25000 && _filter.priceMax == 50000) return 1;
    if (_filter.priceMin == 50000 && _filter.priceMax == 75000) return 2;
    if (_filter.priceMin == 75000 && _filter.priceMax == 100000) return 3;
    if (_filter.priceMin == 100000 && _filter.priceMax == null) return 4;
    return null;
  }

  DiscoveryFilter get _normalizedFilter {
    final min = _filter.priceMin;
    final max = _filter.priceMax;
    if (min != null && max != null && min > max) {
      return _filter
          .copyWith(clearPrice: true)
          .copyWith(priceMin: max, priceMax: min);
    }
    return _filter;
  }
}
