import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import '../../theme/density/app_density.dart';
import '../../theme/responsive/app_breakpoints.dart';
import '../empty_state/app_empty_state.dart';
import 'models/data_table_column_def.dart';
import 'models/data_table_action.dart';
import '../pagination/app_pagination.dart';

class AppDataTable<T> extends StatefulWidget {
  final List<DataTableColumnDef<T>> columns;
  final List<T> rows;
  final bool isLoading;
  final String? errorMessage;
  final String emptyMessage;
  final Widget? emptyIcon;
  final List<DataTableRowAction<T>>? rowActions;
  final bool selectable;
  final Set<T>? selectedRows;
  final void Function(Set<T>)? onSelectionChanged;
  final double? rowHeight;
  final bool stickyHeader;
  final AppDensityMode? densityMode;
  final void Function(DataTableColumnDef<T> column, bool ascending)? onSort;
  final String? sortColumnId;
  final bool sortAscending;
  final double headerHeight;
  final double? columnGap;

  // Pagination
  final int? totalCount;
  final int? currentPage;
  final int? pageSize;
  final int? lastPage;
  final int? from;
  final int? to;
  final void Function(int page)? onPageChanged;

  final void Function(T row)? onRowTap;
  final bool Function(T row)? isRowHighlighted;

  const AppDataTable({
    super.key,
    required this.columns,
    required this.rows,
    this.isLoading = false,
    this.errorMessage,
    required this.emptyMessage,
    this.emptyIcon,
    this.rowActions,
    this.selectable = false,
    this.selectedRows,
    this.onSelectionChanged,
    this.rowHeight,
    this.stickyHeader = true,
    this.densityMode,
    this.onSort,
    this.sortColumnId,
    this.sortAscending = true,
    this.headerHeight = 52.0,
    this.columnGap,
    this.totalCount,
    this.currentPage,
    this.pageSize,
    this.lastPage,
    this.from,
    this.to,
    this.onPageChanged,
    this.onRowTap,
    this.isRowHighlighted,
  });

  @override
  State<AppDataTable<T>> createState() => _AppDataTableState<T>();
}

class _AppDataTableState<T> extends State<AppDataTable<T>> {
  AppDensityMode _resolvedDensityMode(BuildContext context) =>
      widget.densityMode ??
      AppDensity.modeForSizeClass(AppBreakpoints.of(context));

  double _resolvedRowHeight(BuildContext context) =>
      widget.rowHeight ??
      AppDensity.tableRowHeight(_resolvedDensityMode(context));

  double _resolvedColumnGap(BuildContext context) =>
      widget.columnGap ??
      AppDensity.tableColumnGap(_resolvedDensityMode(context));

  double _rowActionWidth(BuildContext context) {
    final actionCount = widget.rowActions?.length ?? 0;
    if (actionCount == 0) return 0;
    final mode = _resolvedDensityMode(context);
    final actionSize = AppDensity.tableRowActionSize(mode);
    final gap = AppDensity.tableRowActionGap(mode);
    return (actionCount * actionSize) + ((actionCount - 1) * gap);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isLoading && widget.rows.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (widget.errorMessage != null && widget.rows.isEmpty) {
      return Center(
        child: Text(
          widget.errorMessage!,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.error,
          ),
        ),
      );
    }

    if (widget.rows.isEmpty) {
      return Center(
        child: AppEmptyState(
          title: widget.emptyMessage,
          customIcon: widget.emptyIcon,
        ),
      );
    }

    Widget table = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (widget.isLoading) const LinearProgressIndicator(),
        _buildHeaderRow(context),
        Expanded(
          child: ListView.separated(
            itemCount: widget.rows.length,
            separatorBuilder: (context, index) => Divider(
              height: 1,
              color: context.colors.outlineVariant.withValues(alpha: 0.65),
            ),
            itemBuilder: (context, index) =>
                _buildRow(context, widget.rows[index]),
          ),
        ),
        if (widget.totalCount != null && widget.currentPage != null)
          _buildPagination(context),
      ],
    );

    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border.all(
          color: context.colors.outlineVariant.withValues(alpha: 0.85),
        ),
        borderRadius: BorderRadius.circular(context.radius.md),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: context.isDarkMode ? 0.18 : 0.04,
            ),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(context.radius.md),
        child: table,
      ),
    );
  }

  Widget _buildHeaderRow(BuildContext context) {
    return Container(
      height: widget.headerHeight,
      padding: EdgeInsets.symmetric(horizontal: context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surfaceSubtle,
        border: Border(
          bottom: BorderSide(
            color: context.colors.outlineVariant.withValues(alpha: 0.85),
          ),
        ),
      ),
      child: Row(
        children: [
          if (widget.selectable)
            Padding(
              padding: EdgeInsets.only(right: context.space.md),
              child: Checkbox(
                value: widget.selectedRows?.length == widget.rows.length,
                onChanged: (val) {
                  if (widget.onSelectionChanged != null) {
                    if (val == true) {
                      widget.onSelectionChanged!(Set.from(widget.rows));
                    } else {
                      widget.onSelectionChanged!(<T>{});
                    }
                  }
                },
              ),
            ),
          ..._buildCellsWithGap(
            context,
            widget.columns.map((col) {
              Widget headerCell = Text(
                col.header,
                style: context.typography.labelMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: context.colors.onSurfaceVariant,
                ),
                textAlign: col.headerAlign,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              );

              if (col.sortable) {
                final isSorted = widget.sortColumnId == col.id;
                headerCell = InkWell(
                  onTap: () {
                    if (widget.onSort != null) {
                      widget.onSort!(
                        col,
                        isSorted ? !widget.sortAscending : true,
                      );
                    }
                  },
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      headerCell,
                      const SizedBox(width: 4),
                      Icon(
                        isSorted
                            ? (widget.sortAscending
                                  ? Icons.arrow_upward
                                  : Icons.arrow_downward)
                            : Icons.unfold_more,
                        size: 14,
                        color: isSorted
                            ? context.colors.primary
                            : context.colors.onSurfaceVariant,
                      ),
                    ],
                  ),
                );
              }

              return col.width != null
                  ? SizedBox(width: col.width, child: headerCell)
                  : Expanded(flex: col.flex, child: headerCell);
            }).toList(),
          ),
          if (widget.rowActions != null && widget.rowActions!.isNotEmpty)
            SizedBox(
              width: _rowActionWidth(context),
              child: Text(
                'Aksi',
                style: context.typography.labelMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: context.colors.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildRow(BuildContext context, T row) {
    final isSelected =
        widget.selectable && (widget.selectedRows?.contains(row) ?? false);
    final isHighlighted = widget.isRowHighlighted?.call(row) ?? false;

    Color bgColor = context.colors.surface;
    if (isSelected) {
      bgColor = context.colors.primarySurface;
    } else if (isHighlighted) {
      bgColor = context.colors.surfaceSelected;
    }

    return Material(
      color: bgColor,
      child: InkWell(
        onTap: widget.onRowTap != null ? () => widget.onRowTap!(row) : null,
        hoverColor: context.colors.primarySurface.withValues(alpha: 0.45),
        splashColor: context.colors.primarySurface,
        child: SizedBox(
          height: _resolvedRowHeight(context),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: context.space.md),
            child: Row(
              children: [
                if (widget.selectable)
                  Padding(
                    padding: EdgeInsets.only(right: context.space.md),
                    child: Checkbox(
                      value: isSelected,
                      onChanged: (val) {
                        if (widget.onSelectionChanged != null &&
                            widget.selectedRows != null) {
                          final newSelection = Set<T>.from(
                            widget.selectedRows!,
                          );
                          if (val == true) {
                            newSelection.add(row);
                          } else {
                            newSelection.remove(row);
                          }
                          widget.onSelectionChanged!(newSelection);
                        }
                      },
                    ),
                  ),
                ..._buildCellsWithGap(
                  context,
                  widget.columns.map((col) {
                    final cell = DefaultTextStyle.merge(
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.onSurface,
                      ),
                      child: col.cellBuilder(context, row),
                    );

                    return col.width != null
                        ? SizedBox(width: col.width, child: cell)
                        : Expanded(flex: col.flex, child: cell);
                  }).toList(),
                ),
                if (widget.rowActions != null && widget.rowActions!.isNotEmpty)
                  SizedBox(
                    width: _rowActionWidth(context),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: _buildRowActionButtons(context, row),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildRowActionButtons(BuildContext context, T row) {
    final mode = _resolvedDensityMode(context);
    final actionSize = AppDensity.tableRowActionSize(mode);
    final actionGap = AppDensity.tableRowActionGap(mode);
    final actions = widget.rowActions ?? [];

    final buttons = <Widget>[];
    for (var i = 0; i < actions.length; i++) {
      final action = actions[i];
      final visible = action.isVisible?.call(row) ?? true;
      if (!visible) {
        buttons.add(SizedBox(width: actionSize, height: actionSize));
      } else {
        final enabled = action.isEnabled?.call(row) ?? true;

        buttons.add(
          Tooltip(
            message: action.tooltip,
            child: IconButton(
              icon: Icon(action.icon, size: 18),
              color: enabled
                  ? (action.color ?? context.colors.onSurfaceVariant)
                  : context.colors.onSurface.withValues(alpha: 0.38),
              onPressed: enabled ? () => action.onTap(row) : null,
              constraints: BoxConstraints(
                minWidth: actionSize,
                minHeight: actionSize,
              ),
              padding: EdgeInsets.zero,
              style: IconButton.styleFrom(
                backgroundColor: enabled
                    ? context.colors.surfaceSubtle
                    : Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.sm),
                ),
              ),
            ),
          ),
        );
      }

      if (i < actions.length - 1) {
        buttons.add(SizedBox(width: actionGap));
      }
    }

    return buttons;
  }

  Widget _buildPagination(BuildContext context) {
    if (widget.totalCount == null ||
        widget.currentPage == null ||
        widget.lastPage == null) {
      return const SizedBox.shrink();
    }

    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          top: BorderSide(
            color: context.colors.outlineVariant.withValues(alpha: 0.85),
          ),
        ),
      ),
      child: AppPagination(
        currentPage: widget.currentPage!,
        lastPage: widget.lastPage!,
        total: widget.totalCount!,
        from: widget.from,
        to: widget.to,
        isLoading: widget.isLoading,
        onPageChanged: widget.onPageChanged,
      ),
    );
  }

  List<Widget> _buildCellsWithGap(BuildContext context, List<Widget> cells) {
    final gap = _resolvedColumnGap(context);
    if (gap <= 0 || cells.isEmpty) return cells;
    final result = <Widget>[];
    for (int i = 0; i < cells.length; i++) {
      result.add(cells[i]);
      if (i < cells.length - 1) {
        result.add(SizedBox(width: gap));
      }
    }
    return result;
  }
}
