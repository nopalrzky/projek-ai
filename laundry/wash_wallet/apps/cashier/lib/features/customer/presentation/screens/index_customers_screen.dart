import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

import 'package:go_router/go_router.dart';
import '../bloc/customer_cubit.dart';
import '../bloc/customer_state.dart';
import '../widgets/customer_search_bar.dart';
import '../widgets/customer_list_view.dart';
import 'show_customer_screen.dart';

class IndexCustomersScreen extends StatefulWidget {
  final int outletId;

  const IndexCustomersScreen({super.key, required this.outletId});

  @override
  State<IndexCustomersScreen> createState() => _IndexCustomersScreenState();
}

class _IndexCustomersScreenState extends State<IndexCustomersScreen> {
  final TextEditingController _searchController = TextEditingController();

  String? _selectedStatus;
  String? _selectedGender;
  int? _selectedCustomerId;

  final List<Map<String, String?>> _statusFilters = [
    {'label': 'Semua', 'value': null},
    {'label': 'Aktif', 'value': 'active'},
    {'label': 'Nonaktif', 'value': 'inactive'},
  ];

  final List<Map<String, String?>> _genderFilters = [
    {'label': 'Semua', 'value': null},
    {'label': 'Laki-laki', 'value': 'L'},
    {'label': 'Perempuan', 'value': 'P'},
  ];

  String _labelFor(List<Map<String, String?>> list, String? val) {
    return list.firstWhere(
      (e) => e['value'] == val,
      orElse: () => {'label': 'Semua'},
    )['label']!;
  }

  void _applyFilters(List<ActiveFilter> filters) {
    String? newStatus;
    String? newGender;

    for (final filter in filters) {
      if (filter.filterId == 'status') newStatus = filter.value as String?;
      if (filter.filterId == 'gender') newGender = filter.value as String?;
    }

    setState(() {
      _selectedStatus = newStatus;
      _selectedGender = newGender;
    });

    _loadData();
  }

  List<ActiveFilter> _buildActiveFilters() {
    final filters = <ActiveFilter>[];

    if (_selectedStatus != null) {
      filters.add(
        ActiveFilter(
          filterId: 'status',
          filterLabel: 'Status',
          valueLabel: _labelFor(_statusFilters, _selectedStatus),
          value: _selectedStatus,
        ),
      );
    }

    if (_selectedGender != null) {
      filters.add(
        ActiveFilter(
          filterId: 'gender',
          filterLabel: 'Gender',
          valueLabel: _labelFor(_genderFilters, _selectedGender),
          value: _selectedGender,
        ),
      );
    }

    return filters;
  }


  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _loadData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadData() {
    context.read<CustomerCubit>().getAll(
      outletId: widget.outletId,
      search: _searchController.text.isEmpty ? null : _searchController.text,
      gender: _selectedGender,
      isActive: _selectedStatus == 'active'
          ? true
          : (_selectedStatus == 'inactive' ? false : null),
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
                title: 'Pelanggan',
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
        body: BlocConsumer<CustomerCubit, CustomerState>(
          listener: (context, state) {
            if (state is CustomerActionSuccess) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Row(
                    children: [
                      const Icon(
                        Icons.check_circle_rounded,
                        color: Colors.white,
                      ),
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
            if (state is CustomerFailure) {
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

  Widget _buildMobileList(BuildContext context, CustomerState state) {
    return Column(
      children: [
        CustomerSearchBar(
          controller: _searchController,
          onSearch: _loadData,
          onClear: () {
            _searchController.clear();
            _loadData();
            setState(() {});
          },
        ),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: context.space.md),
          child: Row(
            children: [
              Expanded(
                child: AppDropdown<String?>(
                  label: 'Status',
                  hint: 'Pilih',
                  value: _selectedStatus,
                  items: _statusFilters.map((e) => e['value']).toList(),
                  itemLabel: (val) => _labelFor(_statusFilters, val),
                  onChanged: (val) {
                    if (val == null) return;
                    setState(() => _selectedStatus = val);
                    _loadData();
                  },
                ),
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: AppDropdown<String?>(
                  label: 'Gender',
                  hint: 'Pilih',
                  value: _selectedGender,
                  items: _genderFilters.map((e) => e['value']).toList(),
                  itemLabel: (val) => _labelFor(_genderFilters, val),
                  onChanged: (val) {
                    if (val == null) return;
                    setState(() => _selectedGender = val);
                    _loadData();
                  },
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: context.space.md),
        Expanded(child: _buildMobileContent(context, state)),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, CustomerState state) {
    if (state is CustomerLoading) {
      return const AppLoadingIndicator();
    }
    if (state is CustomerFailure) {
      return AppErrorState(message: state.failure.message, onRetry: _loadData);
    }
    if (state is CustomersLoaded) {
      if (state.customers.isEmpty) {
        return AppEmptyState(
          title: 'Belum ada pelanggan',
          description:
              _searchController.text.isNotEmpty ||
                  _selectedStatus != null ||
                  _selectedGender != null
              ? 'Coba ubah kata kunci pencarian atau filter.'
              : 'Tambahkan pelanggan baru untuk mulai bertransaksi',
          action:
              _searchController.text.isNotEmpty ||
                  _selectedStatus != null ||
                  _selectedGender != null
              ? ElevatedButton.icon(
                  onPressed: () {
                    _searchController.clear();
                    setState(() {
                      _selectedStatus = null;
                      _selectedGender = null;
                    });
                    _loadData();
                  },
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Reset Filter'),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.space.lg,
                      vertical: context.space.md,
                    ),
                  ),
                )
              : ElevatedButton.icon(
                  onPressed: () => _navigateToCreateScreen(),
                  icon: const Icon(Icons.add_rounded),
                  label: const Text('Tambah Pelanggan'),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.space.lg,
                      vertical: context.space.md,
                    ),
                  ),
                ),
        );
      }
      return CustomerListView(
        customers: state.customers,
        onEdit: _handleEdit,
        onDelete: _handleDelete,
        onRefresh: _loadData,
        onTap: (customer) {
          _navigateToShowScreen(customer);
        },
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, CustomerState state) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          flex: 2,
          child: AppDataView<Customer>(
            breadcrumbs: const [
              BreadcrumbItem(label: 'Home'),
              BreadcrumbItem(label: 'Pelanggan'),
            ],
            pageTitle: 'Daftar Pelanggan',
            searchController: _searchController,
            searchHint: 'Cari pelanggan...',
            onSearch: _loadData,
            onSearchClear: () {
              _searchController.clear();
              _loadData();
            },
            filterConfigs: [
              FilterConfig(
                id: 'status',
                label: 'Status',
                type: FilterType.singleSelect,
                options: _statusFilters
                    .map(
                      (f) => FilterOption(
                        id: f['value']?.toString() ?? 'all',
                        label: f['label'] as String,
                        value: f['value'],
                      ),
                    )
                    .toList(),
              ),
              FilterConfig(
                id: 'gender',
                label: 'Gender',
                type: FilterType.singleSelect,
                options: _genderFilters
                    .map(
                      (f) => FilterOption(
                        id: f['value']?.toString() ?? 'all',
                        label: f['label'] as String,
                        value: f['value'],
                      ),
                    )
                    .toList(),
              ),
            ],
            activeFilters: _buildActiveFilters(),
            onFiltersChanged: _applyFilters,
            onFilterRemove: (filterId) {
              setState(() {
                if (filterId == 'status') _selectedStatus = null;
                if (filterId == 'gender') _selectedGender = null;
              });
              _loadData();
            },
            onFilterReset: () {
              setState(() {
                _selectedStatus = null;
                _selectedGender = null;
              });
              _loadData();
            },
            primaryActionLabel: 'Tambah',
            primaryActionIcon: Icons.add,
            onPrimaryAction: _navigateToCreateScreen,
            columns: _buildTabletColumnDefs(context),
            rows: state is CustomersLoaded ? state.customers : [],
            isLoading: state is CustomerLoading ||
                (state is CustomersLoaded && state.isPageLoading),
            errorMessage: state is CustomerFailure
                ? state.failure.message
                : null,
            emptyMessage: 'Belum ada pelanggan',
            totalCount: state is CustomersLoaded ? state.total : null,
            currentPage: state is CustomersLoaded ? state.currentPage : null,
            lastPage: state is CustomersLoaded ? state.lastPage : null,
            from: state is CustomersLoaded ? state.from : null,
            to: state is CustomersLoaded ? state.to : null,
            onPageChanged: state is CustomersLoaded
                ? (page) => context.read<CustomerCubit>().changePage(
                      page,
                      outletId: widget.outletId,
                      search: _searchController.text.isEmpty
                          ? null
                          : _searchController.text,
                      gender: _selectedGender,
                      isActive: _selectedStatus == 'active'
                          ? true
                          : (_selectedStatus == 'inactive' ? false : null),
                    )
                : null,
            rowHeight: AppDensity.tableTwoLineRowHeight(AppDensityMode.compact),
            columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
            rowActions: [
              DataTableRowAction<Customer>(
                icon: Icons.visibility_outlined,
                tooltip: 'Lihat',
                onTap: (customer) =>
                    setState(() => _selectedCustomerId = customer.id),
              ),
              DataTableRowAction<Customer>(
                icon: Icons.edit_outlined,
                tooltip: 'Edit',
                onTap: _handleEdit,
              ),
              DataTableRowAction<Customer>(
                icon: Icons.delete_outline,
                tooltip: 'Hapus',
                color: context.colors.error,
                onTap: (customer) => _handleDelete(customer.id),
              ),
            ],
            onRowTap: (customer) =>
                setState(() => _selectedCustomerId = customer.id),
            isRowHighlighted: (customer) => customer.id == _selectedCustomerId,
          ),
        ),
        if (_selectedCustomerId != null) ...[
          VerticalDivider(width: 1, color: context.colors.outlineVariant),
          Expanded(
            flex: 1,
            child: ShowCustomerScreen(
              key: ValueKey(_selectedCustomerId),
              customerId: _selectedCustomerId!,
              isEmbedded: true,
              onClose: () => setState(() => _selectedCustomerId = null),
            ),
          ),
        ],
      ],
    );
  }

  List<DataTableColumnDef<Customer>> _buildTabletColumnDefs(
    BuildContext context,
  ) {
    return [
      DataTableColumnDef<Customer>(
        id: 'name',
        header: 'Nama',
        flex: 2,
        cellBuilder: (context, customer) => Text(customer.name),
      ),
      DataTableColumnDef<Customer>(
        id: 'phone',
        header: 'No. HP',
        flex: 1,
        cellBuilder: (context, customer) => Text(customer.phone ?? '-'),
      ),
      DataTableColumnDef<Customer>(
        id: 'ordersCount',
        header: 'Total Pesanan',
        width: 150,
        cellBuilder: (context, customer) =>
            Text(customer.ordersCount.toString()),
      ),
      DataTableColumnDef<Customer>(
        id: 'status',
        header: 'Status',
        width: 100,
        cellBuilder: (context, customer) => StatusChip(
          label: customer.isActive ? 'Aktif' : 'Nonaktif',
          color: customer.isActive
              ? context.colors.success
              : context.colors.error,
        ),
      ),
    ];
  }

  void _navigateToCreateScreen() {
    context
        .push('/customers/create')
        .then((_) => _loadData());
  }

  void _navigateToShowScreen(Customer customer) {
    context
        .push('/customers/${customer.id}')
        .then((_) => _loadData());
  }

  void _handleEdit(Customer customer) {
    context
        .push(
          '/customers/${customer.id}/edit',
          extra: customer,
        )
        .then((_) => _loadData());
  }

  void _handleDelete(int id) async {
    final result = await AppDialog.destructive(
      context,
      title: 'Hapus Pelanggan',
      message: 'Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
    );
    if (result == true && mounted) {
      if (_selectedCustomerId == id) {
        setState(() => _selectedCustomerId = null);
      }
      context.read<CustomerCubit>().destroy(id);
    }
  }
}
