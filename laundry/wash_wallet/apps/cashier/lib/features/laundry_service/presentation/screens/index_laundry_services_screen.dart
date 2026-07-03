import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../category/presentation/bloc/category_cubit.dart';
import '../../../category/presentation/bloc/category_state.dart';
import '../../../unit/presentation/bloc/unit_cubit.dart';
import '../../../unit/presentation/bloc/unit_state.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:go_router/go_router.dart';

import '../bloc/laundry_service_cubit.dart';
import '../bloc/laundry_service_state.dart';
import '../widgets/laundry_search_bar.dart';
import '../widgets/laundry_filter_chips.dart';
import '../widgets/laundry_service_list_view.dart';
import 'show_laundry_service_screen.dart';

class IndexLaundryServicesScreen extends StatefulWidget {
  final int outletId;

  const IndexLaundryServicesScreen({super.key, required this.outletId});

  @override
  State<IndexLaundryServicesScreen> createState() =>
      _IndexLaundryServicesScreenState();
}

class _IndexLaundryServicesScreenState
    extends State<IndexLaundryServicesScreen> {
  final TextEditingController _searchController = TextEditingController();
  int? _selectedCategoryId;
  int? _selectedUnitId;
  int? _selectedServiceId;

  @override
  void initState() {
    super.initState();
    _loadCategories();
    _loadUnits();
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadCategories() {
    context.read<CategoryCubit>().getAll(outletId: widget.outletId);
  }

  void _loadUnits() {
    context.read<UnitCubit>().getAll();
  }

  void _loadData() {
    context.read<LaundryServiceCubit>().getAll(
      outletId: widget.outletId,
      search: _searchController.text.isEmpty ? null : _searchController.text,
      categoryId: _selectedCategoryId,
      unitId: _selectedUnitId,
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    return AppLayout(
      userName: authState is Authenticated ? authState.employee.name : null,
      onLogout: () => context.read<AuthCubit>().logout(),
      header: isCompact
          ? AppHeader(
              title: 'Layanan Laundry',
              type: AppHeaderType.standard,
              backgroundColor: context.colors.surface,
              onBackPressed: () => context.pop(),
            )
          : null,
      floatingActionButton: isCompact
          ? FloatingActionButton.extended(
              onPressed: () => _navigateToCreateScreen(),
              backgroundColor: context.colors.primary,
              elevation: 4,
              icon: const Icon(Icons.add_rounded, color: Colors.white),
              label: const Text(
                'Tambah',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            )
          : null,
      body: BlocConsumer<LaundryServiceCubit, LaundryServiceState>(
        listener: (context, state) {
          if (state is LaundryServiceActionSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.white),
                    SizedBox(width: context.space.sm),
                    Text(state.message),
                  ],
                ),
                backgroundColor: context.colors.success,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
              ),
            );
            _loadData();
          }
          if (state is LaundryServiceFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.error_rounded, color: Colors.white),
                    SizedBox(width: context.space.sm),
                    Expanded(child: Text(state.failure.message)),
                  ],
                ),
                backgroundColor: context.colors.error,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
              ),
            );
          }
        },
        builder: (context, state) {
          if (isCompact) {
            return _buildMobileList(context, state);
          }
          return _buildTabletTable(context, state);
        },
      ),
    );
  }

  Widget _buildMobileList(BuildContext context, LaundryServiceState state) {
    return Column(
      children: [
        LaundrySearchBar(
          controller: _searchController,
          onSearch: _loadData,
          onClear: () {
            _searchController.clear();
            _loadData();
            setState(() {});
          },
        ),
        _buildFilterChips(context),
        Expanded(child: _buildMobileContent(context, state)),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, LaundryServiceState state) {
    if (state is LaundryServiceLoading) {
      return const AppLoadingIndicator();
    }
    if (state is LaundryServiceFailure) {
      return AppErrorState(message: state.failure.message, onRetry: _loadData);
    }
    if (state is LaundryServicesLoaded) {
      if (state.services.isEmpty) {
        return AppEmptyState(
          title: 'Belum ada layanan',
          description: 'Tambahkan layanan laundry baru (Kiloan, Satuan, dll)',
          action: ElevatedButton.icon(
            onPressed: () => _navigateToCreateScreen(),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Buat Layanan'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(
                horizontal: context.space.lg,
                vertical: context.space.md,
              ),
            ),
          ),
        );
      }
      return LaundryServiceListView(
        services: state.services,
        onEdit: _handleEdit,
        onDelete: _handleDelete,
        onRefresh: _loadData,
        onTap: _handleTap,
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, LaundryServiceState state) {
    return BlocBuilder<CategoryCubit, CategoryState>(
      builder: (context, categoryState) {
        return BlocBuilder<UnitCubit, UnitState>(
          builder: (context, unitState) {
            final categories = categoryState is CategoriesLoaded
                ? categoryState.categories
                : <Category>[];
            final units = unitState is UnitsLoaded ? unitState.units : <Unit>[];

            final activeFilters = <ActiveFilter>[];
            if (_selectedCategoryId != null) {
              final cat = categories.firstWhere(
                (c) => c.id == _selectedCategoryId,
                orElse: () => categories.first,
              );
              activeFilters.add(
                ActiveFilter(
                  filterId: 'category',
                  filterLabel: 'Kategori',
                  value: cat.id,
                  valueLabel: cat.name,
                ),
              );
            }
            if (_selectedUnitId != null) {
              final unit = units.firstWhere(
                (u) => u.id == _selectedUnitId,
                orElse: () => units.first,
              );
              activeFilters.add(
                ActiveFilter(
                  filterId: 'unit',
                  filterLabel: 'Satuan',
                  value: unit.id,
                  valueLabel: unit.name ?? '-',
                ),
              );
            }

            return Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  flex: 2,
                  child: AppDataView<LaundryService>(
                    breadcrumbs: const [
                      BreadcrumbItem(label: 'Home'),
                      BreadcrumbItem(label: 'Layanan Laundry'),
                    ],
                    pageTitle: 'Manajemen Layanan Laundry',
                    searchController: _searchController,
                    searchHint: 'Cari layanan...',
                    onSearch: _loadData,
                    onSearchClear: () {
                      _searchController.clear();
                      _loadData();
                    },
                    filterConfigs: [
                      FilterConfig(
                        id: 'category',
                        label: 'Kategori',
                        type: FilterType.singleSelect,
                        options: categories
                            .map(
                              (c) => FilterOption(
                                id: c.id.toString(),
                                label: c.name,
                                value: c.id,
                              ),
                            )
                            .toList(),
                      ),
                      FilterConfig(
                        id: 'unit',
                        label: 'Satuan',
                        type: FilterType.singleSelect,
                        options: units
                            .map(
                              (u) => FilterOption(
                                id: u.id.toString(),
                                label: u.name ?? '-',
                                value: u.id,
                              ),
                            )
                            .toList(),
                      ),
                    ],
                    activeFilters: activeFilters,
                    onFilterApply: (filter) {
                      setState(() {
                        if (filter.filterId == 'category') {
                          _selectedCategoryId = filter.value is int
                              ? filter.value
                              : int.tryParse(filter.value.toString());
                        } else if (filter.filterId == 'unit') {
                          _selectedUnitId = filter.value is int
                              ? filter.value
                              : int.tryParse(filter.value.toString());
                        }
                      });
                      _loadData();
                    },
                    onFilterRemove: (filterId) {
                      setState(() {
                        if (filterId == 'category') {
                          _selectedCategoryId = null;
                        } else if (filterId == 'unit') {
                          _selectedUnitId = null;
                        }
                      });
                      _loadData();
                    },
                    onFilterReset: () {
                      setState(() {
                        _selectedCategoryId = null;
                        _selectedUnitId = null;
                      });
                      _loadData();
                    },
                    primaryActionLabel: 'Tambah',
                    primaryActionIcon: Icons.add,
                    onPrimaryAction: _navigateToCreateScreen,
                    columns: _buildTabletColumnDefs(context),
                    rows: state is LaundryServicesLoaded ? state.services : [],
                    isLoading: state is LaundryServiceLoading ||
                        (state is LaundryServicesLoaded && state.isPageLoading),
                    errorMessage: state is LaundryServiceFailure
                        ? state.failure.message
                        : null,
                    emptyMessage: 'Belum ada layanan',
                    totalCount: state is LaundryServicesLoaded ? state.total : null,
                    currentPage: state is LaundryServicesLoaded ? state.currentPage : null,
                    lastPage: state is LaundryServicesLoaded ? state.lastPage : null,
                    from: state is LaundryServicesLoaded ? state.from : null,
                    to: state is LaundryServicesLoaded ? state.to : null,
                    onPageChanged: state is LaundryServicesLoaded
                        ? (page) => context.read<LaundryServiceCubit>().changePage(
                              page,
                              outletId: widget.outletId,
                              search: _searchController.text.isEmpty
                                  ? null
                                  : _searchController.text,
                              categoryId: _selectedCategoryId,
                              unitId: _selectedUnitId,
                            )
                        : null,
                    rowActions: [
                      DataTableRowAction<LaundryService>(
                        icon: Icons.visibility_outlined,
                        tooltip: 'Lihat',
                        onTap: _handleTap,
                      ),
                      DataTableRowAction<LaundryService>(
                        icon: Icons.edit_outlined,
                        tooltip: 'Edit',
                        onTap: _handleEdit,
                      ),
                      DataTableRowAction<LaundryService>(
                        icon: Icons.delete_outline,
                        tooltip: 'Hapus',
                        onTap: (service) => _handleDelete(service.id),
                      ),
                    ],
                    onRowTap: _handleTap,
                    isRowHighlighted: (service) => service.id == _selectedServiceId,
                  ),
                ),
                if (_selectedServiceId != null) ...[
                  VerticalDivider(width: 1, color: context.colors.outlineVariant),
                  Expanded(
                    flex: 1,
                    child: ShowLaundryServiceScreen(
                      key: ValueKey(_selectedServiceId),
                      serviceId: _selectedServiceId!,
                      isEmbedded: true,
                      onClose: () => setState(() => _selectedServiceId = null),
                    ),
                  ),
                ],
              ],
            );
          },
        );
      },
    );
  }

  List<DataTableColumnDef<LaundryService>> _buildTabletColumnDefs(
    BuildContext context,
  ) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return [
      DataTableColumnDef<LaundryService>(
        id: 'name',
        header: 'Nama Layanan',
        flex: 1,
        cellBuilder: (context, service) => Text(service.name),
      ),
      DataTableColumnDef<LaundryService>(
        id: 'category',
        header: 'Kategori',
        width: 140,
        cellBuilder: (context, service) => Text(service.category?.name ?? '-'),
      ),
      DataTableColumnDef<LaundryService>(
        id: 'price',
        header: 'Harga',
        width: 120,
        cellBuilder: (context, service) =>
            Text(currencyFormat.format(service.price)),
      ),
      DataTableColumnDef<LaundryService>(
        id: 'unit',
        header: 'Satuan',
        width: 100,
        cellBuilder: (context, service) => Text(service.unit?.name ?? '-'),
      ),
      DataTableColumnDef<LaundryService>(
        id: 'status',
        header: 'Status',
        width: 100,
        cellBuilder: (context, service) => StatusChip(
          label: service.isActive ? 'Aktif' : 'Nonaktif',
          color: service.isActive
              ? context.colors.success
              : context.colors.error,
        ),
      ),
    ];
  }

  Widget _buildFilterChips(BuildContext context) {
    return BlocBuilder<CategoryCubit, CategoryState>(
      builder: (context, categoryState) {
        return BlocBuilder<UnitCubit, UnitState>(
          builder: (context, unitState) {
            final categories = categoryState is CategoriesLoaded
                ? categoryState.categories
                      .map((c) => {'id': c.id, 'name': c.name})
                      .toList()
                : <Map<String, dynamic>>[];

            final units = unitState is UnitsLoaded
                ? unitState.units
                      .map((u) => {'id': u.id, 'name': u.name})
                      .toList()
                : <Map<String, dynamic>>[];

            return LaundryFilterChips(
              selectedCategoryId: _selectedCategoryId,
              selectedUnitId: _selectedUnitId,
              categories: categories,
              units: units,
              onCategoryChanged: (id) {
                setState(() => _selectedCategoryId = id);
                _loadData();
              },
              onUnitChanged: (id) {
                setState(() => _selectedUnitId = id);
                _loadData();
              },
            );
          },
        );
      },
    );
  }

  void _navigateToCreateScreen() {
    context
        .push('/laundry-services/create')
        .then((_) => _loadData());
  }

  void _handleTap(LaundryService service) {
    if (AppBreakpoints.of(context) == WindowSizeClass.compact) {
      context.push('/laundry-services/${service.id}').then((_) => _loadData());
    } else {
      setState(() => _selectedServiceId = service.id);
    }
  }

  void _handleEdit(LaundryService service) {
    context
        .push(
          '/laundry-services/${service.id}/edit',
          extra: service,
        )
        .then((_) => _loadData());
  }

  void _handleDelete(int id) async {
    final result = await AppDialog.destructive(
      context,
      title: 'Hapus Layanan',
      message: 'Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
    );
    if (result == true && mounted) {
      if (_selectedServiceId == id) {
        setState(() => _selectedServiceId = null);
      }
      context.read<LaundryServiceCubit>().destroy(id);
    }
  }
}
