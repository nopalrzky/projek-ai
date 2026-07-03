import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:intl/intl.dart';

import '../../../../core/services/production_notification_service.dart';
import '../../../../core/widgets/app_dynamic_bottom_bar.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../widgets/pickup/pickup_date_selector.dart';
import '../widgets/pickup/pickup_order_card.dart';
import '../widgets/pickup/pickup_outlet_filter.dart';
import '../widgets/pickup/pickup_start_bottom_sheet.dart';
import 'pickup_order_detail_screen.dart';

class PickupScheduleScreen extends StatefulWidget {
  const PickupScheduleScreen({super.key});

  @override
  State<PickupScheduleScreen> createState() => _PickupScheduleScreenState();
}

class _PickupScheduleScreenState extends State<PickupScheduleScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTime _selectedDate = DateTime.now();
  int? _selectedOutletId;
  StreamSubscription<NewPickupPayload>? _newPickupSubscription;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) return;
      final authState = context.read<AuthCubit>().state;
      if (authState is Authenticated) {
        final outletIds = _selectedOutletId != null
            ? [_selectedOutletId!]
            : authState.employee.accessibleOutletIds;

        if (_tabController.index == 1) {
          // 'Dalam Perjalanan' tab — fetch only in-progress
          context.read<OrderCubit>().getPickupSchedule(
            outletIds: outletIds,
            date: _selectedDate,
            fetchAccepted: false,
            fetchInProgress: true,
            fetchPickedUp: true,
          );
        } else {
          // 'Siap Dijemput' tab — fetch only accepted
          context.read<OrderCubit>().getPickupSchedule(
            outletIds: outletIds,
            date: _selectedDate,
            fetchAccepted: true,
            fetchInProgress: false,
          );
        }
      }
    });

    // initial load: fetch only accepted (Siap Dijemput)
    _loadData();
    _newPickupSubscription = ProductionNotificationService.instance.onNewPickup
        .listen((_) => _loadData());
  }

  void _loadData() {
    final authState = context.read<AuthCubit>().state;
    if (authState is Authenticated) {
      final outletIds = _selectedOutletId != null
          ? [_selectedOutletId!]
          : authState.employee.accessibleOutletIds;
      final isInProgressTab = _tabController.index == 1;

      context.read<OrderCubit>().getPickupSchedule(
        outletIds: outletIds,
        date: _selectedDate,
        fetchAccepted: !isInProgressTab,
        fetchInProgress: isInProgressTab,
        fetchPickedUp: isInProgressTab,
      );
    }
  }

  @override
  void dispose() {
    _newPickupSubscription?.cancel();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final body = Column(
      children: [
        PickupDateSelector(
          selectedDate: _selectedDate,
          onDateSelected: (date) {
            setState(() {
              _selectedDate = date;
            });
            _loadData();
          },
        ),
        SizedBox(height: context.space.sm),
        Builder(
          builder: (context) {
            final authState = context.read<AuthCubit>().state;
            if (authState is Authenticated) {
              return PickupOutletFilter(
                outlets: authState.employee.accessibleOutlets,
                selectedOutletId: _selectedOutletId,
                onOutletSelected: (outletId) {
                  setState(() => _selectedOutletId = outletId);
                  _loadData();
                },
              );
            }
            return const SizedBox.shrink();
          },
        ),
        SizedBox(height: context.space.md),
        TabBar(
          controller: _tabController,
          indicatorColor: context.colors.primary,
          labelColor: context.colors.primary,
          unselectedLabelColor: context.colors.textSecondary,
          tabs: const [
            Tab(text: 'Siap Dijemput'),
            Tab(text: 'Dalam Perjalanan'),
          ],
        ),
        Expanded(
          child: BlocConsumer<OrderCubit, OrderState>(
            listener: (context, state) {
              if (state is OrderError) {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text(state.message)));
              }
            },
            builder: (context, state) {
              if (state is OrderLoading) {
                return const Center(child: AppLoadingIndicator());
              }

              if (state is PickupScheduleLoaded) {
                return TabBarView(
                  controller: _tabController,
                  children: [
                    _buildScheduledTab(context, state),
                    _buildOrderList(context, state.inProgressOrders, true),
                  ],
                );
              }

              return AppEmptyState(
                title: 'Gagal memuat data',
                description: 'Silakan coba lagi nanti',
                action: AppButton.primary(
                  label: 'Coba Lagi',
                  onPressed: _loadData,
                ),
              );
            },
          ),
        ),
      ],
    );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Jadwal Penjemputan',
          subtitle: DateFormat('EEEE, d MMMM yyyy').format(_selectedDate),
          type: AppHeaderType.standard,
          showMenuButton: false,
        ),
        bottomBar: const AppDynamicBottomBar(currentRoute: '/pickup-schedule'),
        body: body,
      );
    }

    return Column(
      children: [
        PageContentHeader(
          title: 'Jadwal Pickup',
          subtitle: DateFormat('EEEE, d MMMM yyyy').format(_selectedDate),
          breadcrumbs: const [BreadcrumbItem(label: 'Jadwal Pickup')],
        ),
        Expanded(child: body),
      ],
    );
  }

  Widget _buildScheduledTab(BuildContext context, PickupScheduleLoaded state) {
    if (state.overdueOrders.isEmpty && state.scheduledOrders.isEmpty) {
      return Center(
        child: AppEmptyState(
          title: 'Tidak ada pesanan',
          description: 'Belum ada jadwal penjemputan untuk hari ini',
          size: AppEmptyStateSize.md,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => _loadData(),
      child: ListView(
        padding: EdgeInsets.all(context.space.lg),
        children: [
          if (state.overdueOrders.isNotEmpty) ...[
            _buildSectionHeader(context, 'Segera Dijemput', isOverdue: true),
            ...state.overdueOrders.map(
              (order) => PickupOrderCard(
                order: order,
                isPickingUp: false,
                isOverdue: true,
                onAction: () => _handleAction(context, order, false),
              ),
            ),
            SizedBox(height: context.space.md),
          ],
          if (state.scheduledOrders.isNotEmpty)
            ..._buildGroupedOrders(context, state.scheduledOrders, false),
        ],
      ),
    );
  }

  List<Widget> _buildGroupedOrders(
    BuildContext context,
    List<Order> orders,
    bool isPickingUp,
  ) {
    final grouped = <String, List<Order>>{};
    for (final order in orders) {
      final time = order.pickupSchedule != null
          ? DateFormat('HH:00').format(order.pickupSchedule!)
          : 'Lainnya';
      grouped.putIfAbsent(time, () => []).add(order);
    }

    final sortedSlots = grouped.keys.toList()..sort();

    return sortedSlots.expand((slot) {
      final slotOrders = grouped[slot]!;
      return [
        _buildSectionHeader(
          context,
          slot == 'Lainnya' ? slot : '$slot - ${_nextSlot(slot)}',
        ),
        ...slotOrders.map(
          (order) => PickupOrderCard(
            order: order,
            isPickingUp: isPickingUp,
            onAction: () => _handleAction(context, order, isPickingUp),
          ),
        ),
      ];
    }).toList();
  }

  Widget _buildSectionHeader(
    BuildContext context,
    String title, {
    bool isOverdue = false,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: context.space.md),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: isOverdue ? context.colors.error : context.colors.primary,
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: context.space.sm),
          Text(
            title,
            style: context.typography.headlineSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: isOverdue
                  ? context.colors.error
                  : context.colors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderList(
    BuildContext context,
    List<Order> orders,
    bool isPickingUp,
  ) {
    if (orders.isEmpty) {
      return Center(
        child: AppEmptyState(
          title: 'Tidak ada pesanan',
          description: isPickingUp
              ? 'Belum ada pesanan yang sedang dijemput'
              : 'Belum ada jadwal penjemputan untuk hari ini',
          size: AppEmptyStateSize.md,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => _loadData(),
      child: ListView(
        padding: EdgeInsets.all(context.space.lg),
        children: _buildGroupedOrders(context, orders, isPickingUp),
      ),
    );
  }

  String _nextSlot(String slot) {
    final hour = int.tryParse(slot.split(':').first);
    if (hour == null) return '';
    return '${(hour + 2).toString().padLeft(2, '0')}:00';
  }

  void _handleAction(BuildContext context, Order order, bool isPickingUp) {
    if (isPickingUp) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => PickupOrderDetailScreen(order: order),
        ),
      ).then((_) => _loadData());
    } else {
      PickupStartBottomSheet.show(context, order).then((_) => _loadData());
    }
  }
}
