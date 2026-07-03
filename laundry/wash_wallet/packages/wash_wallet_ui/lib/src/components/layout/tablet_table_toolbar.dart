import 'package:flutter/material.dart';
import '../data_view/index_toolbar.dart';
import '../data_view/models/filter_config.dart';
import '../data_view/models/active_filter.dart';

class TabletTableToolbar extends StatelessWidget {
  final TextEditingController? searchController;
  final String? searchHint;
  final VoidCallback? onSearch;
  final VoidCallback? onSearchClear;
  final List<Widget> filterChips;
  final String? primaryActionLabel;
  final IconData? primaryActionIcon;
  final VoidCallback? onPrimaryAction;

  // Optional new parameters for backward-compatible upgrade
  final List<FilterConfig>? filterConfigs;
  final List<ActiveFilter>? activeFilters;
  final void Function(ActiveFilter)? onFilterApply;
  final void Function(String)? onFilterRemove;
  final VoidCallback? onFilterReset;
  final List<Widget>? secondaryActions;
  final bool sticky;

  const TabletTableToolbar({
    super.key,
    this.searchController,
    this.searchHint,
    this.onSearch,
    this.onSearchClear,
    this.filterChips = const [],
    this.primaryActionLabel,
    this.primaryActionIcon,
    this.onPrimaryAction,
    this.filterConfigs,
    this.activeFilters,
    this.onFilterApply,
    this.onFilterRemove,
    this.onFilterReset,
    this.secondaryActions,
    this.sticky = false,
  });

  @override
  Widget build(BuildContext context) {
    if (filterConfigs != null) {
      return IndexToolbar(
        searchController: searchController,
        searchHint: searchHint,
        onSearch: onSearch,
        onSearchClear: onSearchClear,
        filterConfigs: filterConfigs!,
        activeFilters: activeFilters ?? const [],
        onFilterApply: onFilterApply,
        onFilterRemove: onFilterRemove,
        onFilterReset: onFilterReset,
        primaryActionLabel: primaryActionLabel,
        primaryActionIcon: primaryActionIcon,
        onPrimaryAction: onPrimaryAction,
        secondaryActions: secondaryActions,
        sticky: sticky,
      );
    }

    // Legacy behavior
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (searchController != null)
            Expanded(
              flex: 2,
              child: TextField(
                controller: searchController,
                decoration: InputDecoration(
                  hintText: searchHint ?? 'Cari...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: searchController!.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            searchController!.clear();
                            onSearchClear?.call();
                          },
                        )
                      : null,
                  border: const OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(8)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                ),
                onSubmitted: (_) => onSearch?.call(),
                onChanged: (_) {
                  // Rebuild to show/hide clear icon
                  (context as Element).markNeedsBuild();
                },
              ),
            )
          else
            const Spacer(),
          const SizedBox(width: 16),
          if (filterChips.isNotEmpty) ...[
            Expanded(
              flex: 3,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: filterChips
                      .map(
                        (chip) => Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: chip,
                        ),
                      )
                      .toList(),
                ),
              ),
            ),
            const SizedBox(width: 16),
          ],
          if (secondaryActions != null)
            ...secondaryActions!.map(
              (action) => Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: action,
              ),
            ),
          if (primaryActionLabel != null && onPrimaryAction != null)
            FilledButton.icon(
              onPressed: onPrimaryAction,
              icon: Icon(primaryActionIcon ?? Icons.add_rounded),
              label: Text(primaryActionLabel!),
            ),
        ],
      ),
    );
  }
}
