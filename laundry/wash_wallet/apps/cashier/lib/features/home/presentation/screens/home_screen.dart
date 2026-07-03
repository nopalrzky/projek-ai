import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_cashier/core/services/notification_service.dart';

import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../../../features/auth/presentation/bloc/auth_state.dart';
import '../../../../features/order/presentation/screens/select_customer_for_order_screen.dart';
import '../../../../features/order/presentation/bloc/order_cubit.dart';

import '../bloc/home_cubit.dart';
import '../bloc/home_state.dart';
import '../sections/employee_info_section.dart';
import '../sections/transaction_reports_section.dart';
import '../sections/quick_actions_section.dart';
import '../widgets/new_order_banner.dart';
import '../layouts/cashier_dashboard_grid.dart';
import '../widgets/dashboard/shift_outlet_panel.dart';
import '../widgets/dashboard/cash_summary_panel.dart';
import '../widgets/dashboard/order_status_panel.dart';
import '../widgets/dashboard/quick_actions_panel.dart';
import '../widgets/dashboard/notification_panel.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  StreamSubscription<NewOrderPayload>? _newOrderSubscription;
  NewOrderPayload? _visibleBanner;
  Timer? _bannerTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    NotificationService.instance.setOnReconnectCallback(() {
      if (mounted) _syncNotificationBadge();
    });
    Future.microtask(() {
      if (mounted) {
        context.read<HomeCubit>().getHomeData();
      }
      _syncNotificationBadge();
    });
    _newOrderSubscription = NotificationService.instance.onNewOrder.listen(
      _handleNewOrder,
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    NotificationService.instance.setOnReconnectCallback(() {});
    _newOrderSubscription?.cancel();
    _bannerTimer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _syncNotificationBadge();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<HomeCubit, HomeState>(
      listener: (context, state) {
        if (state is HomeError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.failure.message),
              backgroundColor: context.colors.error,
              action: SnackBarAction(
                label: 'Tutup',
                textColor: context.colors.onError,
                onPressed: () {
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                },
              ),
            ),
          );
        }
      },
      builder: (context, state) {
        return BlocConsumer<AuthCubit, AuthState>(
          listenWhen: (prev, curr) =>
              curr is Authenticated &&
              curr.shouldPromptRemember &&
              !(prev is Authenticated && (prev).shouldPromptRemember),
          listener: (context, state) {
            _showSaveAccountBottomSheet(context);
          },
          builder: (context, authState) {
            final sizeClass = AppBreakpoints.of(context);
            final isCompact = sizeClass == WindowSizeClass.compact;

            if (!isCompact) {
              return Scaffold(
                body: Stack(
                  children: [
                    _buildTabletBody(context, state, authState),
                    if (_visibleBanner != null)
                      Positioned(
                        top: 0,
                        left: 0,
                        right: 0,
                        child: NewOrderBanner(
                          payload: _visibleBanner!,
                          onTap: () =>
                              _openOrderFromNotification(_visibleBanner!),
                          onClose: _hideBanner,
                        ),
                      ),
                  ],
                ),
              );
            }

            return Stack(
              children: [
                AppLayout(
                  userName: authState is Authenticated
                      ? authState.employee.name
                      : null,
                  onLogout: () => context.read<AuthCubit>().logout(),
                  header: AppHeader(
                    title: 'Wash Wallet',
                    subtitle: 'Selamat Bekerja',
                    type: AppHeaderType.standard,
                    backgroundColor: context.colors.surface,
                    showMenuButton: false,
                    actions: [
                      IconButton(
                        onPressed: () => context.push('/switch-employee'),
                        icon: const Icon(Icons.people_outline),
                        tooltip: 'Ganti Pegawai',
                      ),
                      _NotificationBadgeButton(
                        onPressed: () => _handleNotificationTap(context),
                      ),
                    ],
                  ),
                  body: _buildMobileBody(context, state),
                ),
                if (_visibleBanner != null)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: NewOrderBanner(
                      payload: _visibleBanner!,
                      onTap: () => _openOrderFromNotification(_visibleBanner!),
                      onClose: _hideBanner,
                    ),
                  ),
              ],
            );
          },
        );
      },
    );
  }

  void _showSaveAccountBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Simpan info login?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Simpan akun ini agar Anda bisa login lebih cepat dengan PIN di lain waktu.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                context.read<AuthCubit>().rememberCurrentEmployee();
                Navigator.pop(context);
              },
              child: const Text('Simpan'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Nanti saja'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileBody(BuildContext context, HomeState state) {
    if (state is HomeLoading) {
      return const AppLoadingIndicator(message: 'Memuat dashboard...');
    }

    if (state is HomeError) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: () => context.read<HomeCubit>().getHomeData(),
      );
    }

    if (state is HomeLoaded) {
      return RefreshIndicator(
        onRefresh: () => context.read<HomeCubit>().refresh(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.symmetric(vertical: context.space.lg),
          child: ContentConstraint(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                EmployeeInfoSection(
                  employeeName: state.employeeName,
                  employeePhone: state.employeePhone,
                ),
                SizedBox(height: context.space.xl),
                TransactionReportsSection(
                  cashBalance: state.cashBalance,
                  ordersInProduction: state.ordersInProduction,
                  ordersNotPickedUp: state.ordersNotPickedUp,
                  ordersPickedUp: state.ordersPickedUp,
                  onSetorTap: () => _handleSetorTap(context),
                  onProductionTap: () =>
                      context.go('/orders?status=production'),
                  onNotPickedUpTap: () =>
                      context.go('/orders?status=not_picked_up'),
                  onPickedUpTap: () => context.go('/orders?status=picked_up'),
                ),
                SizedBox(height: context.space.xl),
                QuickActionsSection(
                  onCreateTransaction: () => _handleCreateTransaction(context),
                  onViewTransactions: () => _handleViewTransactions(context),
                  onManageCustomers: () => _handleManageCustomers(context),
                  onManageFinances: () => _handleManageFinances(context),
                ),
                SizedBox(height: context.space.xxl),
              ],
            ),
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildTabletBody(
    BuildContext context,
    HomeState state,
    AuthState authState,
  ) {
    if (state is HomeLoading) {
      return const AppLoadingIndicator(message: 'Memuat dashboard...');
    }

    if (state is HomeError) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: () => context.read<HomeCubit>().getHomeData(),
      );
    }

    if (state is HomeLoaded) {
      final employeeName = state.employeeName;
      final outletName = authState is Authenticated
          ? 'Outlet ${authState.employee.outletId}'
          : 'Outlet';

      return Column(
        children: [
          PageContentHeader(
            title: 'Dashboard Kasir',
            subtitle: '$outletName • $employeeName',
            breadcrumbs: const [BreadcrumbItem(label: 'Dashboard Kasir')],
            actions: [
              IconButton(
                onPressed: () => context.read<HomeCubit>().refresh(),
                icon: const Icon(Icons.refresh),
                tooltip: 'Refresh',
              ),
              IconButton(
                onPressed: () => context.push('/switch-employee'),
                icon: const Icon(Icons.people_outline),
                tooltip: 'Ganti Pegawai',
              ),
              _NotificationBadgeButton(
                onPressed: () => _handleNotificationTap(context),
              ),
            ],
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => context.read<HomeCubit>().refresh(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: CashierDashboardGrid(
                  children: [
                    CashierShiftOutletPanel(
                      employeeName: employeeName,
                      outletName: outletName,
                    ),
                    CashierCashSummaryPanel(
                      cashBalance: state.cashBalance,
                      ordersPickedUp: state.ordersPickedUp,
                    ),
                    CashierOrderStatusPanel(
                      ordersInProduction: state.ordersInProduction,
                      ordersNotPickedUp: state.ordersNotPickedUp,
                      ordersPickedUp: state.ordersPickedUp,
                      onStatusTap: (status) =>
                          context.go('/orders?status=$status'),
                    ),
                    CashierQuickActionsPanel(
                      onCreateOrder: () => _handleCreateTransaction(context),
                      onCheckOrders: () => _handleViewTransactions(context),
                      onCustomers: () => _handleManageCustomers(context),
                      onSetorKas: () => _handleManageFinances(context),
                    ),
                    CashierNotificationPanel(
                      newOrderBanner: _visibleBanner != null
                          ? NewOrderBanner(
                              payload: _visibleBanner!,
                              onTap: () =>
                                  _openOrderFromNotification(_visibleBanner!),
                              onClose: _hideBanner,
                            )
                          : null,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      );
    }
    return const SizedBox.shrink();
  }

  void _handleNewOrder(NewOrderPayload payload) {
    if (!mounted) return;
    setState(() {
      _visibleBanner = payload;
    });
    _bannerTimer?.cancel();
    _bannerTimer = Timer(const Duration(seconds: 8), _hideBanner);
  }

  void _hideBanner() {
    if (!mounted) return;
    setState(() {
      _visibleBanner = null;
    });
  }

  Future<void> _syncNotificationBadge() async {
    await NotificationService.instance.syncBadgeFromBackend(
      () => context.read<OrderCubit>().getNewOrderCount(),
    );
  }

  void _handleNotificationTap(BuildContext context) {
    final authState = context.read<AuthCubit>().state;
    if (authState is! Authenticated) return;

    NotificationService.instance.clearBadge();
    context.go('/orders?status=requested');
    context.read<HomeCubit>().refresh();
  }

  void _openOrderFromNotification(NewOrderPayload payload) {
    if (!mounted) return;

    NotificationService.instance.clearBadge();
    _hideBanner();
    context.push('/orders/${payload.orderId}').then((_) {
      if (mounted) {
        context.read<HomeCubit>().refresh();
        _syncNotificationBadge();
      }
    });
  }

  void _handleSetorTap(BuildContext context) {
    context.go('/finances');
  }

  void _handleCreateTransaction(BuildContext context) {
    final authState = context.read<AuthCubit>().state;
    if (authState is Authenticated) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => SelectCustomerForOrderScreen(
            outletId: authState.employee.outletId,
          ),
        ),
      ).then((_) {
        if (context.mounted) {
          context.read<HomeCubit>().refresh();
        }
      });
    }
  }

  void _handleViewTransactions(BuildContext context) {
    context.go('/orders');
  }

  void _handleManageCustomers(BuildContext context) {
    context.push('/customers');
  }

  void _handleManageFinances(BuildContext context) {
    context.go('/finances');
  }
}

class _NotificationBadgeButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _NotificationBadgeButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: NotificationService.instance.onBadgeCountChanged,
      initialData: NotificationService.instance.badgeCount,
      builder: (context, snapshot) {
        final count = snapshot.data ?? 0;
        return Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              onPressed: onPressed,
              icon: const Icon(Icons.notifications_outlined),
            ),
            if (count > 0)
              Positioned(
                right: 6,
                top: 6,
                child: Container(
                  constraints: const BoxConstraints(
                    minWidth: 18,
                    minHeight: 18,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 5),
                  decoration: BoxDecoration(
                    color: context.colors.error,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    count > 99 ? '99+' : count.toString(),
                    style: TextStyle(
                      color: context.colors.onError,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}
