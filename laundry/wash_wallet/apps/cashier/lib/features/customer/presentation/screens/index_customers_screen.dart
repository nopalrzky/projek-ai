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

class IndexCustomersScreen extends StatefulWidget {
  final int outletId;

  const IndexCustomersScreen({super.key, required this.outletId});

  @override
  State<IndexCustomersScreen> createState() => _IndexCustomersScreenState();
}

class _IndexCustomersScreenState extends State<IndexCustomersScreen> {
  final TextEditingController _searchController = TextEditingController();

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
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    return AppLayout(
      userName: authState is Authenticated ? authState.employee.name : null,
      onLogout: () => context.read<AuthCubit>().logout(),
      header: isCompact ? AppHeader(
        title: 'Pelanggan',
        type: AppHeaderType.standard,
        backgroundColor: context.colors.surface,
        onBackPressed: () => context.pop(),
      ) : null,
      floatingActionButton: isCompact ? FloatingActionButton.extended(
        onPressed: () => _navigateToCreateScreen(),
        backgroundColor: context.colors.primary,
        elevation: 4,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Tambah',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ) : null,
      body: BlocConsumer<CustomerCubit, CustomerState>(
        listener: (context, state) {
          if (state is CustomerActionSuccess) {
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
        Expanded(
          child: _buildMobileContent(context, state),
        ),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, CustomerState state) {
    if (state is CustomerLoading) {
      return const AppLoadingIndicator();
    }
    if (state is CustomerFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: _loadData,
      );
    }
    if (state is CustomersLoaded) {
      if (state.customers.isEmpty) {
        return AppEmptyState(
          title: 'Belum ada pelanggan',
          description: 'Tambahkan pelanggan baru untuk mulai bertransaksi',
          action: ElevatedButton.icon(
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
    return AppDataView<Customer>(
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
      primaryActionLabel: 'Tambah',
      primaryActionIcon: Icons.add,
      onPrimaryAction: _navigateToCreateScreen,
      columns: _buildTabletColumnDefs(context),
      rows: state is CustomersLoaded ? state.customers : [],
      isLoading: state is CustomerLoading,
      errorMessage: state is CustomerFailure ? state.failure.message : null,
      emptyMessage: 'Belum ada pelanggan',
      rowActions: [
        DataTableRowAction<Customer>(
          icon: Icons.visibility_outlined,
          tooltip: 'Lihat',
          onTap: _navigateToShowScreen,
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
      onRowTap: _navigateToShowScreen,
    );
  }

  List<DataTableColumnDef<Customer>> _buildTabletColumnDefs(BuildContext context) {
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
        cellBuilder: (context, customer) => Text(customer.ordersCount.toString()),
      ),
      DataTableColumnDef<Customer>(
        id: 'status',
        header: 'Status',
        width: 100,
        cellBuilder: (context, customer) => StatusChip(
          label: customer.isActive ? 'Aktif' : 'Nonaktif',
          color: customer.isActive ? context.colors.success : context.colors.error,
        ),
      ),
    ];
  }

  void _navigateToCreateScreen() {
    context
        .push('/settings/setup-outlet/customers/create')
        .then((_) => _loadData());
  }

  void _navigateToShowScreen(Customer customer) {
    context
        .push('/settings/setup-outlet/customers/${customer.id}')
        .then((_) => _loadData());
  }

  void _handleEdit(Customer customer) {
    context
        .push(
          '/settings/setup-outlet/customers/${customer.id}/edit',
          extra: customer,
        )
        .then((_) => _loadData());
  }

  void _handleDelete(int id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: context.colors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.delete_rounded, color: context.colors.error),
            ),
            SizedBox(width: context.space.sm),
            const Text('Hapus Pelanggan'),
          ],
        ),
        content: const Text(
          'Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<CustomerCubit>().destroy(id);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: context.colors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }
}
