import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_state.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../widgets/order_card.dart';

class IndexOrderScreen extends StatefulWidget {
  const IndexOrderScreen({super.key});

  @override
  State<IndexOrderScreen> createState() => _IndexOrderScreenState();
}

class _IndexOrderScreenState extends State<IndexOrderScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late ScrollController _scrollController;

  final List<Map<String, dynamic>> _tabs = [
    {'label': 'Semua', 'value': '', 'icon': Icons.receipt_long_outlined},
    {
      'label': 'Menunggu',
      'value': 'requested',
      'icon': Icons.hourglass_empty_rounded,
    },
    {
      'label': 'Diproses',
      'value': 'in_progress',
      'icon': Icons.local_laundry_service_outlined,
    },
    {
      'label': 'Siap Ambil',
      'value': 'ready',
      'icon': Icons.check_circle_outline_rounded,
    },
    {
      'label': 'Selesai',
      'value': 'completed',
      'icon': Icons.done_all_rounded,
    },
    {
      'label': 'Dibatalkan',
      'value': 'cancelled',
      'icon': Icons.cancel_outlined,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _scrollController = ScrollController();

    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        _fetchOrders(isRefresh: true);
      }
    });

    _scrollController.addListener(_onScroll);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchOrders(isRefresh: true);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.9) {
      final state = context.read<OrderCubit>().state;
      if (!state.isFetchingOrders && !state.hasReachedMax) {
        _fetchOrders(page: state.currentPage + 1);
      }
    }
  }

  void _fetchOrders({int page = 1, bool isRefresh = false}) {
    final authState = context.read<CustomerAuthCubit>().state;
    if (authState is CustomerAuthAuthenticated) {
      final statusValue = _tabs[_tabController.index]['value'] as String;
      context.read<OrderCubit>().getAll(
        customerAccountId: authState.customer.id,
        page: page,
        status: statusValue.isEmpty ? null : statusValue,
        isRefresh: isRefresh,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Pesanan Saya',
        actions: [
          IconButton(
            onPressed: () => _fetchOrders(isRefresh: true),
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Muat Ulang',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              color: context.colors.surface,
              border: Border(
                bottom: BorderSide(color: context.colors.border, width: 1),
              ),
            ),
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              dividerColor: Colors.transparent,
              indicator: UnderlineTabIndicator(
                borderSide: BorderSide(color: context.colors.primary, width: 3),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(3),
                ),
              ),
              indicatorSize: TabBarIndicatorSize.label,
              labelColor: context.colors.primary,
              unselectedLabelColor: context.colors.textSecondary,
              labelStyle: context.typography.labelMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
              unselectedLabelStyle: context.typography.labelMedium,
              padding: EdgeInsets.symmetric(horizontal: context.space.sm),
              tabs: _tabs
                  .map(
                    (tab) =>
                        Tab(height: 44, child: Text(tab['label'] as String)),
                  )
                  .toList(),
            ),
          ),

          Expanded(
            child: BlocListener<OrderCubit, OrderState>(
              listener: (context, state) {
                if (state.errorMessage != null && !state.isFetchingOrders) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          const Icon(
                            Icons.error_outline,
                            color: Colors.white,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Expanded(child: Text(state.errorMessage!)),
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
              child: BlocBuilder<OrderCubit, OrderState>(
                builder: (context, state) {
                  if (state.isFetchingOrders && state.orders.isEmpty) {
                    return const Center(child: AppLoadingIndicator());
                  }

                  if (state.orders.isEmpty) {
                    final isAllTab = _tabController.index == 0;
                    return RefreshIndicator(
                      onRefresh: () async => _fetchOrders(isRefresh: true),
                      color: context.colors.primary,
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        child: SizedBox(
                          height: MediaQuery.of(context).size.height * 0.6,
                          child: AppEmptyState.order(
                            title: isAllTab
                                ? 'Belum ada pesanan'
                                : 'Tidak ada pesanan',
                            description: isAllTab
                                ? 'Yuk, laundry pakaianmu dan buat pesanan pertama sekarang!'
                                : 'Tidak ada pesanan untuk kategori ini.',
                            action: AppButton.primary(
                              label: 'Cari Outlet',
                              onPressed: () => context.go('/outlets'),
                            ),
                          ),
                        ),
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async => _fetchOrders(isRefresh: true),
                    color: context.colors.primary,
                    backgroundColor: context.colors.surface,
                    child: ListView.separated(
                      controller: _scrollController,
                      padding: EdgeInsets.symmetric(
                        horizontal: context.space.lg,
                        vertical: context.space.md,
                      ),
                      itemCount:
                          state.orders.length + (state.hasReachedMax ? 0 : 1),
                      separatorBuilder: (_, _) =>
                          SizedBox(height: context.space.md),
                      itemBuilder: (context, index) {
                        if (index >= state.orders.length) {
                          return Padding(
                            padding: EdgeInsets.symmetric(
                              vertical: context.space.lg,
                            ),
                            child: const Center(child: AppLoadingIndicator()),
                          );
                        }
                        final order = state.orders[index];
                        return OrderCard(
                          order: order,
                          isCancelling: state.isCancellingOrder,
                          onTap: () => context.push('/orders/${order.id}'),
                          onCancel: () => _showCancelDialog(context, order),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showCancelDialog(BuildContext context, Order order) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
        ),
        icon: Container(
          padding: EdgeInsets.all(context.space.md),
          decoration: BoxDecoration(
            color: context.colors.error.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.cancel_outlined,
            color: context.colors.error,
            size: 32,
          ),
        ),
        title: const Text('Batalkan Pesanan?', textAlign: TextAlign.center),
        content: Text(
          'Apakah Anda yakin ingin membatalkan pesanan ${order.orderNumber}?\nTindakan ini tidak dapat diurungkan.',
          textAlign: TextAlign.center,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        actionsAlignment: MainAxisAlignment.center,
        actionsPadding: EdgeInsets.fromLTRB(
          context.space.lg,
          0,
          context.space.lg,
          context.space.lg,
        ),
        actions: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: context.colors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                  child: const Text('Tidak'),
                ),
              ),
              SizedBox(width: context.space.md),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.colors.error,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(dialogContext);
                    context.read<OrderCubit>().cancelOrder(order.id);
                  },
                  child: const Text('Ya, Batalkan'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
