import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/deposit_cubit.dart';
import '../bloc/deposit_state.dart';
import '../widgets/deposit_search_bar.dart';
import '../widgets/deposit_filter_chip.dart';
import '../widgets/deposit_list_view.dart';
import 'create_deposit_screen.dart';

class IndexDepositScreen extends StatefulWidget {
  final int outletId;

  const IndexDepositScreen({super.key, required this.outletId});

  @override
  State<IndexDepositScreen> createState() => _IndexDepositScreenState();
}

class _IndexDepositScreenState extends State<IndexDepositScreen> {
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
    context.read<DepositCubit>().getAll(
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
      header: isCompact
          ? AppHeader(
              title: 'Setoran Kasir',
              backgroundColor: context.colors.surface,
              onBackPressed: () => Navigator.pop(context),
            )
          : null,
      floatingActionButton: isCompact
          ? FloatingActionButton.extended(
              onPressed: () => _navigateToCreateScreen(),
              backgroundColor: context.colors.primary,
              elevation: 4,
              icon: const Icon(Icons.add_rounded, color: Colors.white),
              label: const Text(
                'Buat Setoran',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            )
          : null,
      body: ContentConstraint(
        child: BlocConsumer<DepositCubit, DepositState>(
          listener: (context, state) {
            if (state is DepositActionSuccess) {
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

            if (state is DepositFailure) {
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

  Widget _buildMobileList(BuildContext context, DepositState state) {
    return Column(
      children: [
        DepositSearchBar(
          controller: _searchController,
          onSearch: _loadData,
          onClear: () {
            _searchController.clear();
            _loadData();
            setState(() {});
          },
        ),
        DepositFilterChip(
          selectedStatus: _selectedStatus,
          onStatusChanged: _handleStatusFilter,
        ),
        Expanded(child: _buildMobileContent(context, state)),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, DepositState state) {
    if (state is DepositLoading) {
      return const AppLoadingIndicator();
    }
    if (state is DepositFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: () => _loadData(forceRefresh: true),
      );
    }
    if (state is DepositsLoaded) {
      if (state.deposits.isEmpty) {
        return AppEmptyState(
          icon: Icons.receipt_long_rounded,
          title: 'Belum ada setoran',
          description: _selectedStatus != null
              ? 'Tidak ada setoran dengan status yang dipilih'
              : 'Buat setoran baru untuk mencatat transaksi setoran kasir',
          action: _selectedStatus == null
              ? ElevatedButton.icon(
                  onPressed: () => _navigateToCreateScreen(),
                  icon: const Icon(Icons.add_rounded),
                  label: const Text('Buat Setoran'),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.space.lg,
                      vertical: context.space.md,
                    ),
                  ),
                )
              : null,
        );
      }
      return DepositListView(
        deposits: state.deposits,
        onTap: _handleShow,
        onRefresh: _handleRefresh,
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, DepositState state) {
    final loadedState = state is DepositsLoaded ? state : null;
    return AppDataView<Deposit>(
      rows: loadedState?.deposits ?? [],
      emptyMessage: _selectedStatus != null
          ? 'Tidak ada setoran dengan status yang dipilih'
          : 'Belum ada data setoran kasir',
      searchHint: 'Cari referensi...',
      searchController: _searchController,
      onSearch: () => _loadData(),
      onSearchClear: () {
        _searchController.clear();
        _loadData();
      },
      primaryActionLabel: 'Buat Setoran',
      onPrimaryAction: _navigateToCreateScreen,
      isLoading: state is DepositLoading ||
          (state is DepositsLoaded && state.isPageLoading),
      errorMessage: state is DepositFailure ? state.failure.message : null,
      totalCount: loadedState?.total,
      currentPage: loadedState?.currentPage,
      lastPage: loadedState?.lastPage,
      from: loadedState?.from,
      to: loadedState?.to,
      onPageChanged: loadedState != null
          ? (page) => context.read<DepositCubit>().changePage(
                page,
                outletId: widget.outletId,
                search: _searchController.text.isEmpty
                    ? null
                    : _searchController.text,
                status: _selectedStatus,
              )
          : null,
      activeFilters: [
        if (_selectedStatus != null)
          ActiveFilter(
            filterId: 'status',
            filterLabel: 'Status',
            valueLabel: _selectedStatus == 'pending'
                ? 'Menunggu'
                : _selectedStatus == 'approved'
                ? 'Disetujui'
                : 'Ditolak',
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
            FilterOption(
              id: 'approved',
              label: 'Disetujui',
              value: 'approved',
            ),
            FilterOption(id: 'rejected', label: 'Ditolak', value: 'rejected'),
          ],
        ),
      ],
      columns: [
        DataTableColumnDef<Deposit>(
          id: 'code',
          header: 'No Referensi',
          cellBuilder: (context, item) => Text(
            item.code,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        DataTableColumnDef<Deposit>(
          id: 'employee',
          header: 'Pegawai',
          cellBuilder: (context, item) => Text(item.cashierName ?? '-'),
        ),
        DataTableColumnDef<Deposit>(
          id: 'amount',
          header: 'Total',
          cellBuilder: (context, item) => Text(item.formattedAmount ?? '-'),
        ),
        DataTableColumnDef<Deposit>(
          id: 'date',
          header: 'Tanggal',
          cellBuilder: (context, item) =>
              Text(item.createdAtFormatted ?? item.createdAtHuman ?? '-'),
        ),
        DataTableColumnDef<Deposit>(
          id: 'status',
          header: 'Status',
          cellBuilder: (context, item) => StatusChip(
            label: item.statusLabel,
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
        builder: (_) => CreateDepositScreen(outletId: widget.outletId),
      ),
    ).then((_) => _handleRefresh());
  }

  void _handleShow(Deposit deposit) {
    // Navigator.push(
    //   context,
    //   MaterialPageRoute(
    //     builder: (_) => ShowDepositScreen(depositId: deposit.id),
    //   ),
    // ).then((_) => _handleRefresh());
  }
}
