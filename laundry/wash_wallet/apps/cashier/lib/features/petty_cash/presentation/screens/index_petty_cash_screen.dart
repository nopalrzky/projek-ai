import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/petty_cash_cubit.dart';
import '../bloc/petty_cash_state.dart';
import '../widgets/petty_cash_search_bar.dart';
import '../widgets/petty_cash_filter_chip.dart';
import '../widgets/petty_cash_list_view.dart';
import 'create_petty_cash_screen.dart';

class IndexPettyCashScreen extends StatefulWidget {
  final int? cashierId;

  const IndexPettyCashScreen({super.key, this.cashierId});

  @override
  State<IndexPettyCashScreen> createState() => _IndexPettyCashScreenState();
}

class _IndexPettyCashScreenState extends State<IndexPettyCashScreen> {
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
    if (widget.cashierId != null) {
      context.read<PettyCashCubit>().loadPettyCashesByCashierId(
        cashierId: widget.cashierId!,
        search: _searchController.text.isEmpty ? null : _searchController.text,
        status: _selectedStatus,
      );
    } else {
      context.read<PettyCashCubit>().getAll(
        search: _searchController.text.isEmpty ? null : _searchController.text,
        status: _selectedStatus,
      );
    }
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
        title: 'Kas Kecil',
        backgroundColor: context.colors.surface,
        onBackPressed: () => Navigator.pop(context),
      ) : null,
      floatingActionButton: isCompact ? FloatingActionButton.extended(
        onPressed: () => _navigateToCreateScreen(),
        backgroundColor: context.colors.primary,
        elevation: 4,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Buat Permintaan',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ) : null,
      body: ContentConstraint(
        child: BlocConsumer<PettyCashCubit, PettyCashState>(
          listener: (context, state) {
            if (state is PettyCashActionSuccess) {
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

            if (state is PettyCashFailure) {
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

  Widget _buildMobileList(BuildContext context, PettyCashState state) {
    return Column(
      children: [
        PettyCashSearchBar(
          controller: _searchController,
          onSearch: _loadData,
          onClear: () {
            _searchController.clear();
            _loadData();
            setState(() {});
          },
        ),
        PettyCashFilterChip(
          selectedStatus: _selectedStatus,
          onStatusChanged: _handleStatusFilter,
        ),
        Expanded(
          child: _buildMobileContent(context, state),
        ),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, PettyCashState state) {
    if (state is PettyCashLoading) {
      return const AppLoadingIndicator();
    }
    if (state is PettyCashFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: () => _loadData(forceRefresh: true),
      );
    }
    if (state is PettyCashesLoaded) {
      if (state.pettyCashes.isEmpty) {
        return AppEmptyState(
          icon: Icons.account_balance_wallet_rounded,
          title: 'Belum ada permintaan kas kecil',
          description: _selectedStatus != null
              ? 'Tidak ada permintaan dengan status yang dipilih'
              : 'Buat permintaan kas kecil baru untuk mencatat pengeluaran operasional',
          action: _selectedStatus == null
              ? ElevatedButton.icon(
                  onPressed: () => _navigateToCreateScreen(),
                  icon: const Icon(Icons.add_rounded),
                  label: const Text('Buat Permintaan'),
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
      return PettyCashListView(
        pettyCashes: state.pettyCashes,
        onTap: _handleShow,
        onRefresh: _handleRefresh,
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, PettyCashState state) {
    if (state is PettyCashLoading) return const AppLoadingIndicator();
    if (state is PettyCashFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: () => _loadData(forceRefresh: true),
      );
    }
    
    if (state is PettyCashesLoaded) {
      return AppDataView<PettyCash>(
        rows: state.pettyCashes,
        emptyMessage: _selectedStatus != null
            ? 'Tidak ada permintaan dengan status yang dipilih'
            : 'Belum ada data permintaan kas kecil',
        searchHint: 'Cari referensi...',
        searchController: _searchController,
        onSearch: () => _loadData(),
        onSearchClear: () {
          _searchController.clear();
          _loadData();
        },
        primaryActionLabel: 'Buat Permintaan',
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
          DataTableColumnDef<PettyCash>(
            id: 'code',
            header: 'No Referensi',
            cellBuilder: (context, item) => Text(item.code ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          DataTableColumnDef<PettyCash>(
            id: 'employee',
            header: 'Pegawai',
            cellBuilder: (context, item) => Text((item.cashier?['name'] as String?) ?? '-'),
          ),
          DataTableColumnDef<PettyCash>(
            id: 'amount',
            header: 'Total',
            cellBuilder: (context, item) => Text(item.formattedAmount ?? '-'),
          ),
          DataTableColumnDef<PettyCash>(
            id: 'date',
            header: 'Tanggal',
            cellBuilder: (context, item) => Text(item.createdAtFormatted ?? item.createdAtHuman ?? '-'),
          ),
          DataTableColumnDef<PettyCash>(
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
      MaterialPageRoute(builder: (_) => const CreatePettyCashScreen()),
    ).then((result) {
      if (result == true) {
        _handleRefresh();
      }
    });
  }

  void _handleShow(PettyCash pettyCash) {
    // TODO: Implement navigation to detail screen
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Detail: ${pettyCash.code}'),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
      ),
    );
  }
}
