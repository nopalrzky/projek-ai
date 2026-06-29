import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/expense_cubit.dart';
import '../bloc/expense_state.dart';
import '../widgets/expense_search_bar.dart';
import '../widgets/expense_filter_chip.dart';
import '../widgets/expense_list_view.dart';
import 'create_expense_screen.dart';

class IndexExpenseScreen extends StatefulWidget {
  final int outletId;

  const IndexExpenseScreen({super.key, required this.outletId});

  @override
  State<IndexExpenseScreen> createState() => _IndexExpenseScreenState();
}

class _IndexExpenseScreenState extends State<IndexExpenseScreen> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedStatus;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadData({bool forceRefresh = false}) {
    context.read<ExpenseCubit>().getAll(
      outletId: widget.outletId,
      search: _searchController.text.isEmpty ? null : _searchController.text,
      status: _selectedStatus,
    );
  }

  void _handleRefresh() {
    _loadData(forceRefresh: true);
  }

  void _handleStatusFilter(String? status) {
    setState(() {
      _selectedStatus = status;
    });
    _loadData();
  }

  @override
  Widget build(BuildContext context) {
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    return AppLayout(
      header: isCompact ? AppHeader(
        title: 'Pengeluaran Outlet',
        backgroundColor: context.colors.surface,
        onBackPressed: () => Navigator.pop(context),
      ) : null,
      floatingActionButton: isCompact ? FloatingActionButton.extended(
        onPressed: () => _navigateToCreateScreen(),
        backgroundColor: context.colors.warning,
        elevation: 4,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Buat Pengeluaran',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ) : null,
      body: ContentConstraint(
        child: BlocConsumer<ExpenseCubit, ExpenseState>(
          listener: (context, state) {
            if (state is ExpenseActionSuccess) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Row(
                    children: [
                      const Icon(
                        Icons.check_circle_rounded,
                        color: Colors.white,
                      ),
                      SizedBox(width: context.space.sm),
                      Expanded(child: Text(state.message)),
                    ],
                  ),
                  backgroundColor: context.colors.success,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                ),
              );
              _handleRefresh();
            }

            if (state is ExpenseFailure) {
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
      ),
    );
  }

  Widget _buildMobileList(BuildContext context, ExpenseState state) {
    return Column(
      children: [
        ExpenseSearchBar(
          controller: _searchController,
          onSearch: _loadData,
          onClear: () {
            _searchController.clear();
            _loadData();
            setState(() {});
          },
        ),
        ExpenseFilterChip(
          selectedStatus: _selectedStatus,
          onStatusChanged: _handleStatusFilter,
        ),
        Expanded(
          child: _buildMobileContent(context, state),
        ),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, ExpenseState state) {
    if (state is ExpenseLoading) {
      return const AppLoadingIndicator();
    }
    if (state is ExpenseFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: () => _loadData(forceRefresh: true),
      );
    }
    if (state is ExpensesLoaded) {
      if (state.expenses.isEmpty) {
        return AppEmptyState(
          icon: Icons.trending_down_rounded,
          title: 'Belum ada pengeluaran',
          description: _selectedStatus != null
              ? 'Tidak ada pengeluaran dengan status yang dipilih'
              : 'Buat pengeluaran baru untuk mencatat transaksi pengeluaran outlet',
          action: _selectedStatus == null
              ? ElevatedButton.icon(
                  onPressed: () => _navigateToCreateScreen(),
                  icon: const Icon(Icons.add_rounded),
                  label: const Text('Buat Pengeluaran'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.colors.warning,
                    padding: EdgeInsets.symmetric(
                      horizontal: context.space.lg,
                      vertical: context.space.md,
                    ),
                  ),
                )
              : null,
        );
      }
      return ExpenseListView(
        expenses: state.expenses,
        onTap: _handleShow,
        onRefresh: _handleRefresh,
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, ExpenseState state) {
    if (state is ExpenseLoading) return const AppLoadingIndicator();
    if (state is ExpenseFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: () => _loadData(forceRefresh: true),
      );
    }
    
    if (state is ExpensesLoaded) {
      return AppDataView<Expense>(
        rows: state.expenses,
        emptyMessage: _selectedStatus != null
            ? 'Tidak ada pengeluaran dengan status yang dipilih'
            : 'Belum ada data pengeluaran kasir',
        searchHint: 'Cari referensi...',
        searchController: _searchController,
        onSearch: () => _loadData(),
        onSearchClear: () {
          _searchController.clear();
          _loadData();
        },
        primaryActionLabel: 'Buat Pengeluaran',
        onPrimaryAction: _navigateToCreateScreen,
        activeFilters: [
          if (_selectedStatus != null)
            ActiveFilter(
              filterId: 'status',
              filterLabel: 'Status',
              valueLabel: _selectedStatus == 'pending' ? 'Menunggu' : _selectedStatus == 'approved' ? 'Disetujui' : 'Ditolak',
              value: _selectedStatus!,
            ),
        ],
        onFilterRemove: (_) {
          _handleStatusFilter(null);
        },
        onFilterApply: (filter) {
          _handleStatusFilter(filter.value as String);
        },
        onFilterReset: () {
          _handleStatusFilter(null);
        },
        filterConfigs: const [
          FilterConfig(
            id: 'status',
            label: 'Status',
            type: FilterType.singleSelect,
            options: [
              FilterOption(id: 'pending', label: 'Menunggu', value: 'pending'),
              FilterOption(id: 'approved', label: 'Disetujui', value: 'approved'),
              FilterOption(id: 'rejected', label: 'Ditolak', value: 'rejected'),
            ],
          ),
        ],
        columns: [
          DataTableColumnDef<Expense>(
            id: 'code',
            header: 'No Referensi',
            cellBuilder: (context, item) => Text(item.code, style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          DataTableColumnDef<Expense>(
            id: 'description',
            header: 'Deskripsi',
            cellBuilder: (context, item) => Text(item.description ?? '-'),
          ),
          DataTableColumnDef<Expense>(
            id: 'category',
            header: 'Kategori',
            cellBuilder: (context, item) => Text(item.expenseAccountName ?? '-'),
          ),
          DataTableColumnDef<Expense>(
            id: 'amount',
            header: 'Total',
            cellBuilder: (context, item) => Text(item.formattedAmount ?? '-'),
          ),
          DataTableColumnDef<Expense>(
            id: 'date',
            header: 'Tanggal',
            cellBuilder: (context, item) => Text(item.formattedDate ?? item.createdAt ?? '-'),
          ),
          DataTableColumnDef<Expense>(
            id: 'status',
            header: 'Status',
            cellBuilder: (context, item) => StatusChip(
              label: item.statusLabel ?? item.status,
              color: _getStatusColor(context, item.status.toLowerCase()),
            ),
          ),
        ],
        rowActions: [
          DataTableRowAction(
            icon: Icons.visibility_outlined,
            tooltip: 'Lihat Detail',
            onTap: (item) => _handleShow(item),
          ),
        ],
      );
    }
    return const SizedBox.shrink();
  }

  Color _getStatusColor(BuildContext context, String status) {
    if (status == 'pending') return context.colors.warning;
    if (status == 'approved') return context.colors.success;
    if (status == 'rejected') return context.colors.error;
    return context.colors.textSecondary;
  }

  void _navigateToCreateScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CreateExpenseScreen(outletId: widget.outletId),
      ),
    ).then((result) {
      if (result == true) {
        _handleRefresh();
      }
    });
  }

  void _handleShow(Expense expense) {
    // TODO: Implement navigation to detail screen
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Detail: ${expense.description}'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
      ),
    );
  }
}
