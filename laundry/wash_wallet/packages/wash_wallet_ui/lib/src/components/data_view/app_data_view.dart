import 'package:flutter/material.dart';
import '../../theme/density/app_density.dart';
import '../../theme/extensions/theme_context_extension.dart';
import '../../theme/responsive/app_breakpoints.dart';
import 'app_data_table.dart';
import 'index_toolbar.dart';
import '../layout/page_content_header/page_content_header.dart';
import '../layout/page_content_header/models/breadcrumb_item.dart';
import 'models/data_table_column_def.dart';
import 'models/data_table_action.dart';
import 'models/filter_config.dart';
import 'models/active_filter.dart';

class AppDataView<T> extends StatelessWidget {
  // Page header
  final List<BreadcrumbItem>? breadcrumbs;
  final String? pageTitle;
  final String? pageSubtitle;
  final List<Widget>? pageActions;

  // Toolbar
  final TextEditingController? searchController;
  final String? searchHint;
  final VoidCallback? onSearch;
  final VoidCallback? onSearchClear;
  final List<FilterConfig> filterConfigs;
  final List<ActiveFilter> activeFilters;
  final void Function(ActiveFilter)? onFilterApply;
  final void Function(String filterId)? onFilterRemove;
  final VoidCallback? onFilterReset;
  final void Function(List<ActiveFilter> filters)? onFiltersChanged;
  final String? primaryActionLabel;
  final IconData? primaryActionIcon;
  final VoidCallback? onPrimaryAction;
  final List<Widget>? secondaryToolbarActions;

  // Table
  final List<DataTableColumnDef<T>> columns;
  final List<T> rows;
  final bool isLoading;
  final String? errorMessage;
  final String emptyMessage;
  final List<DataTableRowAction<T>>? rowActions;
  final void Function(T row)? onRowTap;
  final bool Function(T row)? isRowHighlighted;
  final double? rowHeight;
  final double? columnGap;
  final AppDensityMode? densityMode;
  final bool twoLineRows;

  // Pagination
  final int? totalCount;
  final int? currentPage;
  final int? pageSize;
  final int? lastPage;
  final int? from;
  final int? to;
  final void Function(int page)? onPageChanged;

  const AppDataView({
    super.key,
    this.breadcrumbs,
    this.pageTitle,
    this.pageSubtitle,
    this.pageActions,
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
    this.secondaryToolbarActions,
    required this.columns,
    required this.rows,
    this.isLoading = false,
    this.errorMessage,
    required this.emptyMessage,
    this.rowActions,
    this.onRowTap,
    this.isRowHighlighted,
    this.rowHeight,
    this.columnGap,
    this.densityMode,
    this.twoLineRows = false,
    this.totalCount,
    this.currentPage,
    this.pageSize,
    this.lastPage,
    this.from,
    this.to,
    this.onPageChanged,
  });

  @override
  Widget build(BuildContext context) {
    final resolvedMode =
        densityMode ?? AppDensity.modeForSizeClass(AppBreakpoints.of(context));
    final resolvedRowHeight =
        rowHeight ??
        (twoLineRows
            ? AppDensity.tableTwoLineRowHeight(resolvedMode)
            : AppDensity.tableRowHeight(resolvedMode));
    final resolvedColumnGap =
        columnGap ?? AppDensity.tableColumnGap(resolvedMode);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (breadcrumbs != null || pageTitle != null)
          PageContentHeader(
            breadcrumbs: breadcrumbs ?? [],
            title: pageTitle ?? '',
            subtitle: pageSubtitle,
            actions: pageActions,
          ),

        IndexToolbar(
          searchController: searchController,
          searchHint: searchHint,
          onSearch: onSearch,
          onSearchClear: onSearchClear,
          filterConfigs: filterConfigs,
          activeFilters: activeFilters,
          onFilterApply: onFilterApply,
          onFilterRemove: onFilterRemove,
          onFilterReset: onFilterReset,
          onFiltersChanged: onFiltersChanged,
          primaryActionLabel: primaryActionLabel,
          primaryActionIcon: primaryActionIcon,
          onPrimaryAction: onPrimaryAction,
          secondaryActions: secondaryToolbarActions,
          sticky: true,
        ),

        Expanded(
          child: Padding(
            padding: EdgeInsets.all(context.space.lg),
            child: AppDataTable<T>(
              columns: columns,
              rows: rows,
              isLoading: isLoading,
              errorMessage: errorMessage,
              emptyMessage: emptyMessage,
              rowActions: rowActions,
              onRowTap: onRowTap,
              isRowHighlighted: isRowHighlighted,
              rowHeight: resolvedRowHeight,
              densityMode: resolvedMode,
              columnGap: resolvedColumnGap,
              totalCount: totalCount,
              currentPage: currentPage,
              pageSize: pageSize,
              lastPage: lastPage,
              from: from,
              to: to,
              onPageChanged: onPageChanged,
            ),
          ),
        ),
      ],
    );
  }
}
