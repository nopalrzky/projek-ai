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

  String? _selectedPaymentStatus;
  String? _orderDateFrom;
  String? _orderDateTo;
  String? _estimatedCompletionFrom;
  String? _estimatedCompletionTo;
  double? _totalAmountMin;
  double? _totalAmountMax;

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

  final List<Map<String, String?>> _paymentStatusFilters = [
    {'label': 'Semua', 'value': null},
    {'label': 'Belum Dihargai', 'value': 'not_yet_priced'},
    {'label': 'Belum Bayar', 'value': 'unpaid'},
    {'label': 'Sebagian', 'value': 'partial'},
    {'label': 'Lunas', 'value': 'paid'},
    {'label': 'Refund', 'value': 'refunded'},
    {'label': 'Paket', 'value': 'paid_by_package'},
    {'label': 'COD', 'value': 'cod'},
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
      paymentStatus: _selectedPaymentStatus,
      orderDateFrom: _orderDateFrom,
      orderDateTo: _orderDateTo,
      estimatedCompletionFrom: _estimatedCompletionFrom,
      estimatedCompletionTo: _estimatedCompletionTo,
      totalAmountMin: _totalAmountMin,
      totalAmountMax: _totalAmountMax,
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
      header: isCompact
          ? AppHeader(
              title: 'Daftar Pesanan',
              backgroundColor: context.colors.surface,
              showMenuButton: false,
            )
          : null,
      floatingActionButton: isCompact
          ? FloatingActionButton.extended(
              onPressed: () => _navigateToCreateOrder(),
              backgroundColor: context.colors.primary,
              elevation: 4,
              icon: const Icon(Icons.add_rounded, color: Colors.white),
              label: const Text(
                'Pesanan Baru',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            )
          : null,
      body: BlocConsumer<OrderCubit, OrderState>(
        listener: (context, state) {
          if (state is OrderActionSuccess) {
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
        Padding(
          padding: EdgeInsets.symmetric(horizontal: context.space.md),
          child: Row(
            children: [
              Expanded(
                child: AppDropdown<String?>(
                  label: 'Status Order',
                  hint: 'Pilih status',
                  value: _selectedStatus,
                  items: _statusFilters.map((e) => e['value']).toList(),
                  itemLabel: (val) => _labelFor(_statusFilters, val),
                  onChanged: (val) {
                    if (val == null) return;
                    _onStatusChanged(val);
                  },
                ),
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: AppDropdown<String?>(
                  label: 'Status Pembayaran',
                  hint: 'Pilih status',
                  value: _selectedPaymentStatus,
                  items: _paymentStatusFilters.map((e) => e['value']).toList(),
                  itemLabel: (val) => _labelFor(_paymentStatusFilters, val),
                  onChanged: (val) {
                    if (val == null) return;
                    setState(() => _selectedPaymentStatus = val);
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

  Widget _buildMobileContent(BuildContext context, OrderState state) {
    if (state is OrderLoading) {
      return const AppLoadingIndicator();
    }
    if (state is OrderFailure) {
      return AppErrorState(message: state.failure.message, onRetry: _loadData);
    }
    if (state is OrdersLoaded) {
      if (state.orders.isEmpty) {
        return AppEmptyState(
          title: 'Tidak ada pesanan',
          description:
              _searchController.text.isNotEmpty || _selectedStatus != null
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
    final loadedState = state is OrdersLoaded ? state : null;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          flex: 2,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isCondensedTable = constraints.maxWidth < 760;

              return AppDataView<Order>(
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
                    label: 'Status Order',
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
                    id: 'paymentStatus',
                    label: 'Status Pembayaran',
                    type: FilterType.singleSelect,
                    options: _paymentStatusFilters
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
                    id: 'orderDate',
                    label: 'Tanggal Order',
                    type: FilterType.dateRange,
                    fromHint: 'Dari tanggal',
                    toHint: 'Sampai tanggal',
                  ),
                  FilterConfig(
                    id: 'estimatedCompletion',
                    label: 'Estimasi Selesai',
                    type: FilterType.dateRange,
                    fromHint: 'Dari tanggal',
                    toHint: 'Sampai tanggal',
                  ),
                  FilterConfig(
                    id: 'totalAmount',
                    label: 'Range Nominal',
                    type: FilterType.numberRange,
                    fromHint: 'Nominal min',
                    toHint: 'Nominal max',
                  ),
                ],
                activeFilters: _buildActiveFilters(),
                onFiltersChanged: _applyFilters,
                onFilterRemove: (filterId) {
                  setState(() {
                    switch (filterId) {
                      case 'status':
                        _selectedStatus = null;
                        break;
                      case 'paymentStatus':
                        _selectedPaymentStatus = null;
                        break;
                      case 'orderDate':
                        _orderDateFrom = null;
                        _orderDateTo = null;
                        break;
                      case 'estimatedCompletion':
                        _estimatedCompletionFrom = null;
                        _estimatedCompletionTo = null;
                        break;
                      case 'totalAmount':
                        _totalAmountMin = null;
                        _totalAmountMax = null;
                        break;
                    }
                  });
                  _loadData();
                },
                onFilterReset: () {
                  setState(() {
                    _selectedStatus = null;
                    _selectedPaymentStatus = null;
                    _orderDateFrom = null;
                    _orderDateTo = null;
                    _estimatedCompletionFrom = null;
                    _estimatedCompletionTo = null;
                    _totalAmountMin = null;
                    _totalAmountMax = null;
                  });
                  _loadData();
                },
                primaryActionLabel: 'Pesanan Baru',
                primaryActionIcon: Icons.add_rounded,
                onPrimaryAction: _navigateToCreateOrder,
                columns: _buildTabletColumnDefs(
                  context,
                  isCondensed: isCondensedTable,
                ),
                rows: loadedState?.orders ?? [],
                isLoading: state is OrderLoading ||
                    (state is OrdersLoaded && state.isPageLoading),
                errorMessage: state is OrderFailure
                    ? state.failure.message
                    : null,
                emptyMessage: 'Belum ada transaksi',
                totalCount: loadedState?.total,
                currentPage: loadedState?.currentPage,
                lastPage: loadedState?.lastPage,
                from: loadedState?.from,
                to: loadedState?.to,
                onPageChanged: loadedState != null
                    ? (page) => context.read<OrderCubit>().changePage(
                          page,
                          outletId: widget.outletId,
                          search: _searchController.text,
                          status: _selectedStatus,
                          paymentStatus: _selectedPaymentStatus,
                          orderDateFrom: _orderDateFrom,
                          orderDateTo: _orderDateTo,
                          estimatedCompletionFrom: _estimatedCompletionFrom,
                          estimatedCompletionTo: _estimatedCompletionTo,
                          totalAmountMin: _totalAmountMin,
                          totalAmountMax: _totalAmountMax,
                        )
                    : null,
                rowHeight: isCondensedTable ? 108 : 96,
                columnGap: AppDensity.tableColumnGap(AppDensityMode.compact),
                rowActions: [
                  DataTableRowAction<Order>(
                    icon: Icons.visibility_outlined,
                    tooltip: 'Lihat detail',
                    onTap: (order) => _navigateToShowOrder(order.id),
                  ),
                ],
                onRowTap: (order) => _navigateToShowOrder(order.id),
                isRowHighlighted: (order) => order.id == _selectedOrderId,
              );
            },
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

  List<DataTableColumnDef<Order>> _buildTabletColumnDefs(
    BuildContext context, {
    required bool isCondensed,
  }) {
    if (isCondensed) {
      return [
        DataTableColumnDef<Order>(
          id: 'customerOrder',
          header: 'Pelanggan',
          flex: 2,
          cellBuilder: _buildCustomerOrderCell,
        ),
        DataTableColumnDef<Order>(
          id: 'status',
          header: 'Status',
          width: 142,
          cellBuilder: _buildTabletStatusCell,
        ),
        DataTableColumnDef<Order>(
          id: 'summary',
          header: 'Ringkasan',
          width: 176,
          headerAlign: TextAlign.right,
          cellBuilder: _buildCondensedSummaryCell,
        ),
      ];
    }

    return [
      DataTableColumnDef<Order>(
        id: 'orderDate',
        header: 'Tanggal Pesan',
        width: 126,
        cellBuilder: _buildDateCell,
      ),
      DataTableColumnDef<Order>(
        id: 'customerOrder',
        header: 'Customer',
        flex: 2,
        cellBuilder: _buildCustomerOrderCell,
      ),
      DataTableColumnDef<Order>(
        id: 'status',
        header: 'Status',
        width: 156,
        cellBuilder: _buildTabletStatusCell,
      ),
      DataTableColumnDef<Order>(
        id: 'paymentStatus',
        header: 'Pembayaran',
        width: 172,
        cellBuilder: _buildPaymentCell,
      ),
      DataTableColumnDef<Order>(
        id: 'totalAmount',
        header: 'Total',
        width: 130,
        headerAlign: TextAlign.right,
        cellBuilder: _buildTotalCell,
      ),
    ];
  }

  Widget _buildOrderNumberPill(BuildContext context, Order order) {
    return Tooltip(
      message: order.orderNumber,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: context.colors.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(context.radius.sm),
          border: Border.all(
            color: context.colors.primary.withValues(alpha: 0.16),
          ),
        ),
        child: Text(
          order.orderNumber,
          style: context.typography.caption.copyWith(
            color: context.colors.primary,
            fontWeight: FontWeight.w800,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );
  }

  Widget _buildCustomerOrderCell(BuildContext context, Order order) {
    final customerName = _customerName(order.customer);
    final customerMeta = _customerMeta(order);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          customerName,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.onSurface,
            fontWeight: FontWeight.w800,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 6),
        _buildMetaRow(context, icon: Icons.call_outlined, text: customerMeta),
        const SizedBox(height: 7),
        Row(
          children: [
            Flexible(child: _buildOrderNumberPill(context, order)),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                _orderItemLabel(order),
                style: context.typography.caption.copyWith(
                  color: context.colors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTotalCell(BuildContext context, Order order) {
    return Align(
      alignment: Alignment.centerRight,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            order.formattedTotalAmount ?? '-',
            style: context.typography.labelMedium.copyWith(
              color: context.colors.onSurface,
              fontWeight: FontWeight.w800,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerRight,
            child: PaymentStatusBadge(
              status: order.paymentStatus,
              label: order.paymentStatusLabel,
              size: AppBadgeSize.sm,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateCell(BuildContext context, Order order) {
    final (date, time) = _splitFormattedDate(order.formattedOrderDate);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          date,
          style: context.typography.labelSmall.copyWith(
            color: context.colors.onSurface,
            fontWeight: FontWeight.w800,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        if (time != null) ...[
          const SizedBox(height: 7),
          _buildMetaRow(context, icon: Icons.schedule_outlined, text: time),
        ],
      ],
    );
  }

  Widget _buildPaymentCell(BuildContext context, Order order) {
    final paymentProgress = _paymentProgressLabel(order);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: PaymentStatusBadge(
              status: order.paymentStatus,
              label: order.paymentStatusLabel,
              size: AppBadgeSize.sm,
            ),
          ),
        ),
        if (paymentProgress != null) ...[
          const SizedBox(height: 7),
          Text(
            paymentProgress,
            style: context.typography.caption.copyWith(
              color: context.colors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ],
    );
  }

  Widget _buildCondensedSummaryCell(BuildContext context, Order order) {
    final (date, time) = _splitFormattedDate(order.formattedOrderDate);

    return Align(
      alignment: Alignment.centerRight,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            order.formattedTotalAmount ?? '-',
            style: context.typography.labelMedium.copyWith(
              color: context.colors.onSurface,
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.right,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Text(
            time == null ? date : '$date, $time',
            style: context.typography.caption.copyWith(
              color: context.colors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.right,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerRight,
            child: PaymentStatusBadge(
              status: order.paymentStatus,
              label: order.paymentStatusLabel,
              size: AppBadgeSize.sm,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabletStatusCell(BuildContext context, Order order) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: OrderStatusBadge(
              status: order.status,
              label: order.statusLabel,
              size: AppBadgeSize.sm,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaRow(
    BuildContext context, {
    required IconData icon,
    required String text,
  }) {
    return Row(
      children: [
        Icon(icon, size: 13, color: context.colors.textTertiary),
        const SizedBox(width: 5),
        Expanded(
          child: Text(
            text,
            style: context.typography.caption.copyWith(
              color: context.colors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  String _customerName(Customer? customer) {
    final value = customer?.name.trim();
    if (value == null || value.isEmpty) return 'Guest';
    return value;
  }

  String _customerMeta(Order order) {
    final phone = order.customer?.phone?.trim();
    if (phone != null && phone.isNotEmpty) return phone;
    return 'Customer #${order.customerId}';
  }

  String _orderItemLabel(Order order) {
    final itemCount = order.orderItemsCount;
    return itemCount > 0 ? '$itemCount item' : 'Order #${order.id}';
  }

  String? _paymentProgressLabel(Order order) {
    if (order.paymentStatus != 'partial') return null;

    final paid = order.formattedPaidAmount;
    final total = order.formattedTotalAmount;
    if (paid == null || paid.isEmpty || total == null || total.isEmpty) {
      return null;
    }

    return '$paid / $total';
  }

  (String, String?) _splitFormattedDate(String? value) {
    final text = value?.trim();
    if (text == null || text.isEmpty) return ('-', null);

    final parts = text.split(',');
    if (parts.length < 2) return (text, null);

    final date = parts.first.trim();
    final time = parts.sublist(1).join(',').trim();
    return (date.isEmpty ? text : date, time.isEmpty ? null : time);
  }

  void _applyFilters(List<ActiveFilter> filters) {
    String? newStatus;
    String? newPaymentStatus;
    String? newOrderDateFrom;
    String? newOrderDateTo;
    String? newEstimatedFrom;
    String? newEstimatedTo;
    double? newTotalMin;
    double? newTotalMax;

    for (final filter in filters) {
      switch (filter.filterId) {
        case 'status':
          newStatus = filter.value as String?;
          break;
        case 'paymentStatus':
          newPaymentStatus = filter.value as String?;
          break;
        case 'orderDate':
          final v = filter.value as Map;
          newOrderDateFrom = v['from'] as String?;
          newOrderDateTo = v['to'] as String?;
          break;
        case 'estimatedCompletion':
          final v = filter.value as Map;
          newEstimatedFrom = v['from'] as String?;
          newEstimatedTo = v['to'] as String?;
          break;
        case 'totalAmount':
          final v = filter.value as Map;
          newTotalMin = v['min'] as double?;
          newTotalMax = v['max'] as double?;
          break;
      }
    }

    setState(() {
      _selectedStatus = newStatus;
      _selectedPaymentStatus = newPaymentStatus;
      _orderDateFrom = newOrderDateFrom;
      _orderDateTo = newOrderDateTo;
      _estimatedCompletionFrom = newEstimatedFrom;
      _estimatedCompletionTo = newEstimatedTo;
      _totalAmountMin = newTotalMin;
      _totalAmountMax = newTotalMax;
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

    if (_selectedPaymentStatus != null) {
      filters.add(
        ActiveFilter(
          filterId: 'paymentStatus',
          filterLabel: 'Pembayaran',
          valueLabel: _labelFor(_paymentStatusFilters, _selectedPaymentStatus),
          value: _selectedPaymentStatus,
        ),
      );
    }

    if (_orderDateFrom != null || _orderDateTo != null) {
      final from = _orderDateFrom ?? '...';
      final to = _orderDateTo ?? '...';
      filters.add(
        ActiveFilter(
          filterId: 'orderDate',
          filterLabel: 'Tanggal',
          valueLabel: '$from - $to',
          value: {'from': _orderDateFrom, 'to': _orderDateTo},
        ),
      );
    }

    if (_estimatedCompletionFrom != null || _estimatedCompletionTo != null) {
      final from = _estimatedCompletionFrom ?? '...';
      final to = _estimatedCompletionTo ?? '...';
      filters.add(
        ActiveFilter(
          filterId: 'estimatedCompletion',
          filterLabel: 'Est. Selesai',
          valueLabel: '$from - $to',
          value: {
            'from': _estimatedCompletionFrom,
            'to': _estimatedCompletionTo,
          },
        ),
      );
    }

    if (_totalAmountMin != null || _totalAmountMax != null) {
      final min = _totalAmountMin != null
          ? _formatCurrency(_totalAmountMin!)
          : '...';
      final max = _totalAmountMax != null
          ? _formatCurrency(_totalAmountMax!)
          : '...';
      filters.add(
        ActiveFilter(
          filterId: 'totalAmount',
          filterLabel: 'Nominal',
          valueLabel: '$min - $max',
          value: {'min': _totalAmountMin, 'max': _totalAmountMax},
        ),
      );
    }

    return filters;
  }

  String _labelFor(List<Map<String, String?>> options, String? value) {
    return options.firstWhere(
          (f) => f['value'] == value,
          orElse: () => options.first,
        )['label'] ??
        '-';
  }

  String _formatCurrency(double amount) {
    return amount
        .toStringAsFixed(0)
        .replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
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
