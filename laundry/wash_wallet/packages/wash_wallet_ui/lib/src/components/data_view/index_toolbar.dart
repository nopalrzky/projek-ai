import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'models/filter_config.dart';
import 'models/active_filter.dart';
import 'filter_panel.dart';

class IndexToolbar extends StatefulWidget {
  final TextEditingController? searchController;
  final String? searchHint;
  final VoidCallback? onSearch;
  final VoidCallback? onSearchClear;

  final List<FilterConfig> filterConfigs;
  final List<ActiveFilter> activeFilters;
  final void Function(ActiveFilter filter)? onFilterApply;
  final void Function(String filterId)? onFilterRemove;
  final VoidCallback? onFilterReset;
  final void Function(List<ActiveFilter> filters)? onFiltersChanged;

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
    this.onFiltersChanged,
    this.primaryActionLabel,
    this.primaryActionIcon,
    this.onPrimaryAction,
    this.secondaryActions,
    this.sticky = true,
  });

  @override
  State<IndexToolbar> createState() => _IndexToolbarState();
}

class _IndexToolbarState extends State<IndexToolbar> {
  bool _isPanelOpen = false;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 640;
        Widget content = Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildTopBar(context, isNarrow),
            AnimatedSize(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeInOut,
              child: _isPanelOpen && widget.filterConfigs.isNotEmpty
                  ? FilterPanel(
                      filterConfigs: widget.filterConfigs,
                      activeFilters: widget.activeFilters,
                      onApply: (applied) {
                        if (widget.onFiltersChanged != null) {
                          widget.onFiltersChanged!(applied);
                        } else {
                          widget.onFilterReset?.call();
                          for (final f in applied) {
                            widget.onFilterApply?.call(f);
                          }
                        }
                        setState(() => _isPanelOpen = false);
                      },
                      onCancel: () => setState(() => _isPanelOpen = false),
                      onClearAll: () {
                        widget.onFilterReset?.call();
                        setState(() => _isPanelOpen = false);
                      },
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        );

        if (widget.sticky) {
          return content;
        }
        return content;
      },
    );
  }

  Widget _buildTopBar(BuildContext context, bool isNarrow) {
    final hasActiveFilters = widget.activeFilters.isNotEmpty;

    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          bottom: BorderSide(
            color: context.colors.outlineVariant.withValues(alpha: 0.65),
          ),
        ),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: isNarrow ? context.space.md : context.space.lg,
        vertical: context.space.md,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (widget.searchController != null)
            Expanded(
              flex: 2,
              child: SizedBox(
                height: 48,
                child: TextField(
                  controller: widget.searchController,
                  style: context.typography.bodyMedium,
                  textAlignVertical: TextAlignVertical.center,
                  decoration: InputDecoration(
                    hintText: widget.searchHint ?? 'Cari...',
                    hintStyle: context.typography.bodyMedium.copyWith(
                      color: context.colors.textTertiary,
                    ),
                    prefixIcon: Icon(
                      Icons.search_rounded,
                      size: 20,
                      color: context.colors.onSurfaceVariant,
                    ),
                    suffixIcon: widget.searchController!.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 20),
                            onPressed: () {
                              widget.searchController!.clear();
                              widget.onSearchClear?.call();
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: context.colors.surfaceSubtle,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                      borderSide: BorderSide(
                        color: context.colors.outlineVariant,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                      borderSide: BorderSide(
                        color: context.colors.outlineVariant,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                      borderSide: BorderSide(
                        color: context.colors.primary,
                        width: 1.5,
                      ),
                    ),
                  ),
                  onSubmitted: (_) => widget.onSearch?.call(),
                  onChanged: (_) {
                    setState(() {});
                  },
                ),
              ),
            ),

          if (widget.searchController != null)
            SizedBox(width: isNarrow ? context.space.sm : context.space.md),

          if (widget.filterConfigs.isNotEmpty)
            isNarrow
                ? OutlinedButton(
                    onPressed: () {
                      setState(() {
                        _isPanelOpen = !_isPanelOpen;
                      });
                    },
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(48, 48),
                      padding: EdgeInsets.zero,
                      foregroundColor: hasActiveFilters
                          ? context.colors.primary
                          : context.colors.onSurfaceVariant,
                      backgroundColor: hasActiveFilters
                          ? context.colors.primarySurface
                          : context.colors.surface,
                      side: BorderSide(
                        color: hasActiveFilters
                            ? context.colors.primary
                            : context.colors.outlineVariant,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(context.radius.md),
                      ),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        const Icon(Icons.tune_rounded, size: 18),
                        if (hasActiveFilters)
                          Positioned(
                            top: 4,
                            right: 4,
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: BoxDecoration(
                                color: context.colors.primary,
                                shape: BoxShape.circle,
                              ),
                              constraints: const BoxConstraints(
                                minWidth: 14,
                                minHeight: 14,
                              ),
                              child: Text(
                                '${widget.activeFilters.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                      ],
                    ),
                  )
                : OutlinedButton.icon(
                    onPressed: () {
                      setState(() {
                        _isPanelOpen = !_isPanelOpen;
                      });
                    },
                    icon: const Icon(Icons.tune_rounded, size: 18),
                    label: Text(
                      'Filter${hasActiveFilters ? ' (${widget.activeFilters.length})' : ''}',
                    ),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 48),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      foregroundColor: hasActiveFilters
                          ? context.colors.primary
                          : context.colors.onSurfaceVariant,
                      backgroundColor: hasActiveFilters
                          ? context.colors.primarySurface
                          : context.colors.surface,
                      side: BorderSide(
                        color: hasActiveFilters
                            ? context.colors.primary
                            : context.colors.outlineVariant,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(context.radius.md),
                      ),
                    ),
                  ),

          if (widget.activeFilters.isNotEmpty) ...[
            SizedBox(width: isNarrow ? context.space.sm : context.space.md),
            Expanded(
              flex: 3,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    ...widget.activeFilters.map(
                      (filter) => Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: InputChip(
                          label: Text(
                            '${filter.filterLabel}: ${filter.valueLabel}',
                          ),
                          labelStyle: context.typography.labelSmall,
                          onDeleted: widget.onFilterRemove != null
                              ? () => widget.onFilterRemove!(filter.filterId)
                              : null,
                          deleteIconColor: context.colors.onSurfaceVariant,
                          backgroundColor: context.colors.surfaceSubtle,
                          side: BorderSide(
                            color: context.colors.outlineVariant,
                          ),
                        ),
                      ),
                    ),
                    if (widget.onFilterReset != null)
                      TextButton(
                        onPressed: widget.onFilterReset,
                        child: const Text('Reset'),
                      ),
                  ],
                ),
              ),
            ),
          ] else if (widget.searchController == null)
            const Spacer(),

          if (widget.activeFilters.isEmpty && widget.searchController != null) const Spacer(),

          if (widget.secondaryActions != null)
            ...widget.secondaryActions!.map(
              (action) => Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: action,
              ),
            ),

          if (widget.primaryActionLabel != null && widget.onPrimaryAction != null) ...[
            SizedBox(width: isNarrow ? context.space.sm : context.space.md),
            isNarrow
                ? FilledButton(
                    onPressed: widget.onPrimaryAction,
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(48, 48),
                      padding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(context.radius.md),
                      ),
                    ),
                    child: Icon(widget.primaryActionIcon ?? Icons.add_rounded, size: 18),
                  )
                : FilledButton.icon(
                    onPressed: widget.onPrimaryAction,
                    icon: Icon(widget.primaryActionIcon ?? Icons.add_rounded, size: 18),
                    label: Text(widget.primaryActionLabel!),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(0, 48),
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(context.radius.md),
                      ),
                    ),
                  ),
          ],
        ],
      ),
    );
  }
}
