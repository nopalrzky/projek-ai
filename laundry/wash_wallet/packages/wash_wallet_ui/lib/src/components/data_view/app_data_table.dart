import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import '../../theme/density/app_density.dart';
import '../empty_state/app_empty_state.dart';
import 'models/data_table_column_def.dart';
import 'models/data_table_action.dart';

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
  final double rowHeight;
  final bool stickyHeader;
  final AppDensityMode densityMode;
  final void Function(DataTableColumnDef<T> column, bool ascending)? onSort;
  final String? sortColumnId;
  final bool sortAscending;

  // Pagination
  final int? totalCount;
  final int? currentPage;
  final int? pageSize;
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
    this.rowHeight = 56.0,
    this.stickyHeader = true,
    this.densityMode = AppDensityMode.compact,
    this.onSort,
    this.sortColumnId,
    this.sortAscending = true,
    this.totalCount,
    this.currentPage,
    this.pageSize,
    this.onPageChanged,
    this.onRowTap,
    this.isRowHighlighted,
  });

  @override
  State<AppDataTable<T>> createState() => _AppDataTableState<T>();
}

class _AppDataTableState<T> extends State<AppDataTable<T>> {
  @override
  Widget build(BuildContext context) {
    if (widget.isLoading && widget.rows.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (widget.errorMessage != null && widget.rows.isEmpty) {
      return Center(
        child: Text(
          widget.errorMessage!,
          style: context.typography.bodyMedium.copyWith(color: context.colors.error),
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
        const Divider(height: 1),
        Expanded(
          child: ListView.separated(
            itemCount: widget.rows.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) => _buildRow(context, widget.rows[index]),
          ),
        ),
        if (widget.totalCount != null && widget.currentPage != null)
          _buildPagination(context),
      ],
    );

    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border.all(color: context.colors.outlineVariant),
        borderRadius: BorderRadius.circular(context.radius.md),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(context.radius.md),
        child: table,
      ),
    );
  }

  Widget _buildHeaderRow(BuildContext context) {
    return Container(
      height: widget.rowHeight,
      color: context.colors.surfaceContainerHighest.withValues(alpha: 0.5),
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        children: [
          if (widget.selectable)
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
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
          ...widget.columns.map((col) {
            Widget headerCell = Text(
              col.header,
              style: context.typography.labelMedium.copyWith(
                fontWeight: FontWeight.bold,
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
                    widget.onSort!(col, isSorted ? !widget.sortAscending : true);
                  }
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    headerCell,
                    const SizedBox(width: 4),
                    Icon(
                      isSorted
                          ? (widget.sortAscending ? Icons.arrow_upward : Icons.arrow_downward)
                          : Icons.unfold_more,
                      size: 14,
                      color: isSorted ? context.colors.primary : context.colors.onSurfaceVariant,
                    ),
                  ],
                ),
              );
            }

            return col.width != null
                ? SizedBox(width: col.width, child: headerCell)
                : Expanded(flex: col.flex, child: headerCell);
          }),
          if (widget.rowActions != null && widget.rowActions!.isNotEmpty)
            SizedBox(
              width: widget.rowActions!.length * 44.0,
              child: Text(
                'Aksi',
                style: context.typography.labelMedium.copyWith(
                  fontWeight: FontWeight.bold,
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
    final isSelected = widget.selectable && (widget.selectedRows?.contains(row) ?? false);
    final isHighlighted = widget.isRowHighlighted?.call(row) ?? false;
    
    Color bgColor = Colors.transparent;
    if (isSelected) {
      bgColor = context.colors.primaryContainer.withValues(alpha: 0.3);
    } else if (isHighlighted) {
      bgColor = context.colors.secondarySurface.withValues(alpha: 0.2);
    }

    return InkWell(
      onTap: widget.onRowTap != null ? () => widget.onRowTap!(row) : null,
      child: Container(
        height: widget.rowHeight,
        color: bgColor,
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Row(
          children: [
            if (widget.selectable)
              Padding(
                padding: const EdgeInsets.only(right: 16.0),
                child: Checkbox(
                  value: isSelected,
                  onChanged: (val) {
                    if (widget.onSelectionChanged != null && widget.selectedRows != null) {
                      final newSelection = Set<T>.from(widget.selectedRows!);
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
            ...widget.columns.map((col) {
              final cell = col.width != null
                  ? SizedBox(width: col.width, child: col.cellBuilder(context, row))
                  : Expanded(flex: col.flex, child: col.cellBuilder(context, row));
              return cell;
            }),
            if (widget.rowActions != null && widget.rowActions!.isNotEmpty)
              SizedBox(
                width: widget.rowActions!.length * 44.0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: widget.rowActions!.map((action) {
                    final visible = action.isVisible?.call(row) ?? true;
                    if (!visible) return const SizedBox(width: 44, height: 44);
                    
                    final enabled = action.isEnabled?.call(row) ?? true;
                    
                    return Tooltip(
                      message: action.tooltip,
                      child: IconButton(
                        icon: Icon(action.icon, size: 20),
                        color: enabled ? (action.color ?? context.colors.onSurfaceVariant) : context.colors.onSurface.withValues(alpha: 0.38),
                        onPressed: enabled ? () => action.onTap(row) : null,
                        constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                        padding: EdgeInsets.zero,
                      ),
                    );
                  }).toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPagination(BuildContext context) {
    final totalPages = widget.pageSize != null && widget.pageSize! > 0 
        ? (widget.totalCount! / widget.pageSize!).ceil() 
        : 1;
        
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(top: BorderSide(color: context.colors.outlineVariant)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            'Total: ${widget.totalCount}',
            style: context.typography.bodySmall.copyWith(color: context.colors.onSurfaceVariant),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: widget.currentPage! > 1 && widget.onPageChanged != null
                ? () => widget.onPageChanged!(widget.currentPage! - 1)
                : null,
          ),
          Text(
            'Page ${widget.currentPage} of $totalPages',
            style: context.typography.bodySmall,
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: widget.currentPage! < totalPages && widget.onPageChanged != null
                ? () => widget.onPageChanged!(widget.currentPage! + 1)
                : null,
          ),
        ],
      ),
    );
  }
}
