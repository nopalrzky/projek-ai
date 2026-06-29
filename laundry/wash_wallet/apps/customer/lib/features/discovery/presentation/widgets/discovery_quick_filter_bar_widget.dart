import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_filter.dart';
import '../../domain/entities/discovery_service.dart';
import 'discovery_filter_bottom_sheet_widget.dart';

class DiscoveryQuickFilterBarWidget extends StatelessWidget {
  final DiscoveryFilter activeFilter;
  final List<DiscoveryService> services;
  final List<Outlet> outlets;
  final ValueChanged<DiscoveryFilter> onChanged;
  final VoidCallback onClear;

  const DiscoveryQuickFilterBarWidget({
    super.key,
    required this.activeFilter,
    required this.services,
    required this.outlets,
    required this.onChanged,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: EdgeInsets.symmetric(horizontal: context.space.lg),
      child: Row(
        children: [
          AppChip.primary(
            label: _activeFilterCount == 0
                ? 'Filter'
                : 'Filter ($_activeFilterCount)',
            selected: activeFilter.hasActiveFilter,
            leading: const Icon(Icons.tune_rounded, size: 16),
            onTap: () => _openFilter(context),
          ),
          SizedBox(width: context.space.sm),
          AppChip(
            label: 'Semua',
            selected: !activeFilter.hasActiveFilter && !activeFilter.hasQuery,
            onTap: onClear,
          ),
          SizedBox(width: context.space.sm),
          AppChip.success(
            label: 'Di bawah 10rb',
            selected: _isUnderTenThousand,
            leading: const Icon(Icons.payments_outlined, size: 16),
            onTap: () => onChanged(
              _isUnderTenThousand
                  ? activeFilter.copyWith(clearPrice: true)
                  : activeFilter
                        .copyWith(clearPrice: true)
                        .copyWith(priceMax: 10000),
            ),
          ),
          SizedBox(width: context.space.sm),
          AppChip.primary(
            label: 'Pickup',
            selected: activeFilter.supportsCourier == true,
            leading: const Icon(Icons.local_shipping_outlined, size: 16),
            onTap: () => onChanged(
              activeFilter.supportsCourier == true
                  ? activeFilter.copyWith(clearSupportsCourier: true)
                  : activeFilter.copyWith(supportsCourier: true),
            ),
          ),
          SizedBox(width: context.space.sm),
          AppChip.primary(
            label: 'Outlet saja',
            selected: activeFilter.supportsCourier == false,
            leading: const Icon(Icons.directions_walk_rounded, size: 16),
            onTap: () => onChanged(
              activeFilter.supportsCourier == false
                  ? activeFilter.copyWith(clearSupportsCourier: true)
                  : activeFilter.copyWith(supportsCourier: false),
            ),
          ),
          SizedBox(width: context.space.sm),
          AppChip.primary(
            label: 'Promo ongkir',
            selected: activeFilter.freeShippingEligible == true,
            leading: const Icon(Icons.delivery_dining_rounded, size: 16),
            onTap: () => onChanged(
              activeFilter.freeShippingEligible == true
                  ? activeFilter.copyWith(clearFreeShipping: true)
                  : activeFilter.copyWith(freeShippingEligible: true),
            ),
          ),
          SizedBox(width: context.space.sm),
          AppChip.primary(
            label: 'Termurah',
            selected: activeFilter.serviceSortBy == 'cheapest',
            leading: const Icon(Icons.sell_rounded, size: 16),
            onTap: () => onChanged(
              activeFilter.serviceSortBy == 'cheapest'
                  ? activeFilter.copyWith(serviceSortBy: 'relevant')
                  : activeFilter.copyWith(serviceSortBy: 'cheapest'),
            ),
          ),
        ],
      ),
    );
  }

  bool get _isUnderTenThousand =>
      activeFilter.priceMin == null && activeFilter.priceMax == 10000;

  int get _activeFilterCount {
    var count = 0;
    if (activeFilter.outletId != null) count++;
    if (activeFilter.categoryId != null) count++;
    if (activeFilter.unitId != null) count++;
    if (activeFilter.priceMin != null || activeFilter.priceMax != null) {
      count++;
    }
    if (activeFilter.freeShippingEligible == true) count++;
    if (activeFilter.supportsCourier == true ||
        activeFilter.supportsCourier == false) {
      count++;
    }
    if (activeFilter.serviceSortBy != 'relevant') count++;
    return count;
  }

  Future<void> _openFilter(BuildContext context) async {
    final result = await DiscoveryFilterBottomSheetWidget.show(
      context,
      initialFilter: activeFilter,
      services: services,
      outlets: outlets,
    );

    if (result != null) onChanged(result);
  }
}
