import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../widgets/order_card.dart';
import '../widgets/order_search_bar.dart';
import '../widgets/order_filter_chips.dart';
import 'select_customer_for_order_screen.dart';
import 'show_order_screen.dart';

class IndexOrdersScreen extends StatefulWidget {
  final int outletId;
  final String? initialStatusFilter;

  const IndexOrdersScreen({
    super.key,
    required this.outletId,
    this.initialStatusFilter,
  });

  @override
  State<IndexOrdersScreen> createState() => _IndexOrdersScreenState();
}

class _IndexOrdersScreenState extends State<IndexOrdersScreen> {
  final TextEditingController _searchController = TextEditingController();

  String? _selectedStatus;
  int? _selectedOrderId;

  final List<Map<String, String?>> _statusFilters = [
    {'label': 'Semua', 'value': null},
    {'label': 'Diajukan', 'value': 'requested'},
    {'label': 'Diterima', 'value': 'accepted'},
    {'label': 'Dalam Perjalanan', 'value': 'picking_up'},
    {'label': 'Sudah Diambil', 'value': 'picked_up'},
    {'label': 'Di outlet', 'value': 'received'},
    {'label': 'Siap Dikerjakan', 'value': 'ready_to_process'},
    {'label': 'Diproses', 'value': 'in_progress'},
    {'label': 'Siap Ambil', 'value': 'ready'},
    {'label': 'Selesai', 'value': 'completed'},
  ];

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.initialStatusFilter;
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant IndexOrdersScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialStatusFilter != oldWidget.initialStatusFilter) {
      setState(() {
        _selectedStatus = widget.initialStatusFilter;
      });
      _loadData();
    }
  }

  void _loadData() {
    context.read<OrderCubit>().getAll(
      outletId: widget.outletId,
      search: _searchController.text,
      status: _selectedStatus,
    );
  }

  void _onStatusChanged(String? status) {
    setState(() {
      _selectedStatus = status;
    });
    _loadData();
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    return AppLayout(
      userName: authState is Authenticated ? authState.employee.name : null,
      onLogout: () => context.read<AuthCubit>().logout(),
      header: isCompact ? AppHeader(
        title: 'Daftar Pesanan',
        backgroundColor: context.colors.surface,
        showMenuButton: false,
      ) : null,
      floatingActionButton: isCompact ? FloatingActionButton.extended(
        onPressed: () => _navigateToCreateOrder(),
        backgroundColor: context.colors.primary,
        elevation: 4,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Pesanan Baru',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ) : null,
      body: BlocConsumer<OrderCubit, OrderState>(
        listener: (context, state) {
          if (state is OrderActionSuccess) {
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
          if (state is OrderFailure) {
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

  Widget _buildMobileList(BuildContext context, OrderState state) {
    return Column(
      children: [
        OrderSearchBar(
          controller: _searchController,
          onSearch: _loadData,
          onClear: () {
            _searchController.clear();
            _loadData();
            setState(() {});
          },
          onChanged: (val) => setState(() {}),
        ),
        OrderFilterChips(
          selectedStatus: _selectedStatus,
          onStatusChanged: _onStatusChanged,
          statusFilters: _statusFilters,
        ),
        Expanded(
          child: _buildMobileContent(context, state),
        ),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, OrderState state) {
    if (state is OrderLoading) {
      return const AppLoadingIndicator();
    }
    if (state is OrderFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: _loadData,
      );
    }
    if (state is OrdersLoaded) {
      if (state.orders.isEmpty) {
        return AppEmptyState(
          title: 'Tidak ada pesanan',
          description: _searchController.text.isNotEmpty || _selectedStatus != null
              ? 'Coba ubah kata kunci pencarian atau filter status.'
              : 'Belum ada transaksi hari ini.',
          action: _searchController.text.isNotEmpty || _selectedStatus != null
              ? ElevatedButton.icon(
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _selectedStatus = null);
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
              : null,
        );
      }

      return RefreshIndicator(
        onRefresh: () async => _loadData(),
        child: ListView.builder(
          padding: EdgeInsets.fromLTRB(
            context.space.md,
            context.space.sm,
            context.space.md,
            80,
          ),
          itemCount: state.orders.length,
          itemBuilder: (context, index) {
            final order = state.orders[index];
            return OrderCard(
              order: order,
              onTap: () => _navigateToShowOrder(order.id),
            );
          },
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, OrderState state) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: AppDataView<Order>(
            breadcrumbs: const [
              BreadcrumbItem(label: 'Home'),
              BreadcrumbItem(label: 'Transaksi'),
            ],
            pageTitle: 'Daftar Transaksi',
            searchController: _searchController,
            searchHint: 'Cari pesanan...',
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
                options: _statusFilters.map((f) => FilterOption(
                  id: f['value']?.toString() ?? 'all',
                  label: f['label'] as String,
                  value: f['value'],
                )).toList(),
              ),
            ],
            activeFilters: _selectedStatus != null
              ? [
                  ActiveFilter(
                    filterId: 'status',
                    filterLabel: 'Status',
                    value: _selectedStatus,
                    valueLabel: _statusFilters.firstWhere((f) => f['value'] == _selectedStatus, orElse: () => _statusFilters.first)['label'] as String,
                  ),
                ]
              : const [],
            onFilterApply: (filter) {
              if (filter.filterId == 'status') {
                _onStatusChanged(filter.value as String?);
              }
            },
            onFilterRemove: (filterId) {
              if (filterId == 'status') {
                _onStatusChanged(null);
              }
            },
            onFilterReset: () {
              _onStatusChanged(null);
            },
            primaryActionLabel: 'Pesanan Baru',
            primaryActionIcon: Icons.add,
            onPrimaryAction: _navigateToCreateOrder,
            columns: _buildTabletColumnDefs(context),
            rows: state is OrdersLoaded ? state.orders : [],
            isLoading: state is OrderLoading,
            errorMessage: state is OrderFailure ? state.failure.message : null,
            emptyMessage: 'Belum ada transaksi',
            rowActions: [
              DataTableRowAction<Order>(
                icon: Icons.open_in_new_rounded,
                tooltip: 'Lihat',
                onTap: (order) => _navigateToShowOrder(order.id),
              ),
            ],
            onRowTap: (order) => _navigateToShowOrder(order.id),
          ),
        ),
        if (_selectedOrderId != null) ...[
          VerticalDivider(width: 1, color: context.colors.outlineVariant),
          Expanded(
            flex: 1,
            child: ShowOrderScreen(
              key: ValueKey(_selectedOrderId),
              orderId: _selectedOrderId!,
              outletId: widget.outletId,
              isEmbedded: true,
            ),
          ),
        ],
      ],
    );
  }

  List<DataTableColumnDef<Order>> _buildTabletColumnDefs(BuildContext context) {
    return [
      DataTableColumnDef<Order>(
        id: 'orderNumber',
        header: 'No. Pesanan',
        width: 120,
        cellBuilder: (context, order) => Text(order.orderNumber),
      ),
      DataTableColumnDef<Order>(
        id: 'customer',
        header: 'Pelanggan',
        flex: 1,
        cellBuilder: (context, order) => Text(order.customer?.name ?? '-'),
      ),
      DataTableColumnDef<Order>(
        id: 'status',
        header: 'Status',
        width: 100,
        cellBuilder: (context, order) => StatusChip(
          label: order.statusLabel ?? order.status,
          color: _getStatusColor(context, order.statusBadgeVariant),
        ),
      ),
      DataTableColumnDef<Order>(
        id: 'totalAmount',
        header: 'Total',
        width: 120,
        cellBuilder: (context, order) => Text(order.formattedTotalAmount ?? '-'),
      ),
      DataTableColumnDef<Order>(
        id: 'orderDate',
        header: 'Tanggal',
        width: 120,
        cellBuilder: (context, order) => Text(order.formattedOrderDate ?? '-'),
      ),
    ];
  }

  Color? _getStatusColor(BuildContext context, String? variant) {
    final colors = context.colors;
    switch (variant) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      case 'info': return colors.primary;
      default: return colors.surfaceContainerHighest;
    }
  }

  void _navigateToCreateOrder() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SelectCustomerForOrderScreen(outletId: widget.outletId),
      ),
    ).then((_) => _loadData());
  }

  void _navigateToShowOrder(int orderId) {
    final isCompact = MediaQuery.of(context).size.width < AppBreakpoints.medium;
    if (isCompact) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) =>
              ShowOrderScreen(orderId: orderId, outletId: widget.outletId),
        ),
      ).then((_) => _loadData());
    } else {
      setState(() {
        _selectedOrderId = orderId;
      });
    }
  }
}
