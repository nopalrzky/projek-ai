import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../core/widgets/app_dynamic_bottom_bar.dart';
import '../../../../core/widgets/production_tablet_shell.dart';
import '../bloc/order_cubit.dart';
import '../widgets/order_queued_tab.dart';
import '../widgets/order_in_progress_tab.dart';

class IndexOrderScreen extends StatefulWidget {
  const IndexOrderScreen({super.key});

  @override
  State<IndexOrderScreen> createState() => _IndexOrderScreenState();
}

class _IndexOrderScreenState extends State<IndexOrderScreen>
    with WidgetsBindingObserver {
  int _selectedTabIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadOrders();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _loadOrders();
    }
  }

  void _loadOrders() {
    if (_selectedTabIndex == 0) {
      context.read<OrderCubit>().getAll(
        status: 'ready_to_process',
        page: 1,
        perPage: 15,
      );
    } else {
      context.read<OrderCubit>().getAll(
        status: 'in_progress',
        page: 1,
        perPage: 15,
      );
    }
  }

  void _onTabChanged(int index) {
    setState(() {
      _selectedTabIndex = index;
    });
    _loadOrders();
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    if (isCompact) {
      return AppLayout(
        scrollable: false,
        header: AppHeader(
          title: 'Manajemen Order',
          subtitle: 'Kelola order produksi',
          showMenuButton: true,
        ),
        bottomBar: const AppDynamicBottomBar(currentRoute: '/orders'),
        body: Column(
          children: [
            AppTabBar.primary(
              tabs: const ['Siap Dikerjakan', 'Sedang Dikerjakan'],
              selectedIndex: _selectedTabIndex,
              onTabSelected: _onTabChanged,
            ),
            SizedBox(height: context.space.md),
            Expanded(
              child: _selectedTabIndex == 0
                  ? const OrderQueuedTab()
                  : const OrderInProgressTab(),
            ),
          ],
        ),
      );
    }

    return ProductionTabletShell(
      currentRouteId: 'orders',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const PageContentHeader(
            title: 'Antrian Produksi',
            breadcrumbs: [
              BreadcrumbItem(label: 'Antrian Produksi'),
            ],
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: context.space.lg),
            child: Align(
              alignment: Alignment.centerLeft,
              child: AppTabBar.primary(
                tabs: const ['Siap Dikerjakan', 'Sedang Dikerjakan'],
                selectedIndex: _selectedTabIndex,
                onTabSelected: _onTabChanged,
              ),
            ),
          ),
          SizedBox(height: context.space.md),
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: context.space.lg),
              child: _selectedTabIndex == 0
                  ? const OrderQueuedTab()
                  : const OrderInProgressTab(),
            ),
          ),
        ],
      ),
    );
  }
}
