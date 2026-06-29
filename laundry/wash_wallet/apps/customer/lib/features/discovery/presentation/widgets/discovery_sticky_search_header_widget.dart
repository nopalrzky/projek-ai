import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'discovery_header_icon_button_widget.dart';
import 'discovery_location_header_widget.dart';
import 'discovery_search_bar_widget.dart';
import 'location_picker/location_picker_bottom_sheet_widget.dart';

class DiscoveryStickySearchHeaderWidget extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onSearchCleared;
  final VoidCallback onBack;
  final VoidCallback onSort;
  final VoidCallback onRefresh;

  const DiscoveryStickySearchHeaderWidget({
    super.key,
    required this.controller,
    required this.onSearchChanged,
    required this.onSearchCleared,
    required this.onBack,
    required this.onSort,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          bottom: BorderSide(
            color: context.colors.border.withValues(alpha: 0.7),
          ),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            context.space.md,
            context.space.sm,
            context.space.md,
            context.space.md,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DiscoveryLocationHeaderWidget(
                onBack: onBack,
                onAddressTap: () =>
                    LocationPickerBottomSheetWidget.show(context),
                onHistoryTap: () =>
                    LocationPickerBottomSheetWidget.show(context),
              ),
              SizedBox(height: context.space.sm),
              Row(
                children: [
                  Expanded(
                    child: DiscoverySearchBarWidget(
                      controller: controller,
                      onChanged: onSearchChanged,
                      onClear: onSearchCleared,
                    ),
                  ),
                  SizedBox(width: context.space.sm),
                  DiscoveryHeaderIconButtonWidget(
                    tooltip: 'Urutkan',
                    icon: Icons.sort_rounded,
                    onTap: onSort,
                  ),
                  SizedBox(width: context.space.xs),
                  DiscoveryHeaderIconButtonWidget(
                    tooltip: 'Muat ulang',
                    icon: Icons.refresh_rounded,
                    onTap: onRefresh,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
