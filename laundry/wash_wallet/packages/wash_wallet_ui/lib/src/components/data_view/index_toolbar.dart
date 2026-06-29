import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'models/filter_config.dart';
import 'models/active_filter.dart';

class IndexToolbar extends StatelessWidget {
  final TextEditingController? searchController;
  final String? searchHint;
  final VoidCallback? onSearch;
  final VoidCallback? onSearchClear;

  final List<FilterConfig> filterConfigs;
  final List<ActiveFilter> activeFilters;
  final void Function(ActiveFilter filter)? onFilterApply;
  final void Function(String filterId)? onFilterRemove;
  final VoidCallback? onFilterReset;

  final String? primaryActionLabel;
  final IconData? primaryActionIcon;
  final VoidCallback? onPrimaryAction;

  final List<Widget>? secondaryActions;
  final bool sticky;

  const IndexToolbar({
    super.key,
    this.searchController,
    this.searchHint,
    this.onSearch,
    this.onSearchClear,
    this.filterConfigs = const [],
    this.activeFilters = const [],
    this.onFilterApply,
    this.onFilterRemove,
    this.onFilterReset,
    this.primaryActionLabel,
    this.primaryActionIcon,
    this.onPrimaryAction,
    this.secondaryActions,
    this.sticky = true,
  });

  void _showFilterPanel(BuildContext context) {
    // TODO: Implement filter panel bottom sheet / popover logic here
  }

  @override
  Widget build(BuildContext context) {
    Widget content = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
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
                  prefixIcon: const Icon(Icons.search, size: 20),
                  suffixIcon: searchController!.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 20),
                          onPressed: () {
                            searchController!.clear();
                            onSearchClear?.call();
                          },
                        )
                      : null,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(color: context.colors.outlineVariant),
                  ),
                ),
                onSubmitted: (_) => onSearch?.call(),
                onChanged: (_) {
                  (context as Element).markNeedsBuild();
                },
              ),
            ),
          
          if (searchController != null) const SizedBox(width: 16),
          
          if (filterConfigs.isNotEmpty)
            OutlinedButton.icon(
              onPressed: () => _showFilterPanel(context),
              icon: const Icon(Icons.tune_rounded, size: 18),
              label: Text('Filter${activeFilters.isNotEmpty ? ' (${activeFilters.length})' : ''}'),
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(context.radius.md)),
              ),
            ),
            
          if (activeFilters.isNotEmpty) ...[
            const SizedBox(width: 16),
            Expanded(
              flex: 3,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    ...activeFilters.map((filter) => Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: InputChip(
                            label: Text('${filter.filterLabel}: ${filter.valueLabel}'),
                            labelStyle: context.typography.labelSmall,
                            onDeleted: onFilterRemove != null ? () => onFilterRemove!(filter.filterId) : null,
                            deleteIconColor: context.colors.onSurfaceVariant,
                            backgroundColor: context.colors.surfaceContainerHighest,
                          ),
                        )),
                    if (onFilterReset != null)
                      TextButton(
                        onPressed: onFilterReset,
                        child: const Text('Reset'),
                      ),
                  ],
                ),
              ),
            ),
          ] else if (searchController == null)
            const Spacer(),
            
          if (activeFilters.isEmpty && searchController != null)
            const Spacer(),
            
          if (secondaryActions != null)
            ...secondaryActions!.map((action) => Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: action,
                )),
                
          if (primaryActionLabel != null && onPrimaryAction != null)
            FilledButton.icon(
              onPressed: onPrimaryAction,
              icon: Icon(primaryActionIcon ?? Icons.add_rounded, size: 18),
              label: Text(primaryActionLabel!),
              style: FilledButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(context.radius.md)),
              ),
            ),
        ],
      ),
    );

    if (sticky) {
      return Container(
        color: context.colors.surface,
        child: content,
      );
    }
    return content;
  }
}
