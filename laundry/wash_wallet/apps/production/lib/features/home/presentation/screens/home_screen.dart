import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../core/widgets/app_dynamic_bottom_bar.dart';
import '../../../../core/widgets/production_tablet_shell.dart';
import '../bloc/home_cubit.dart';
import '../bloc/home_state.dart';
import '../widgets/production_summary_card.dart';
import '../widgets/process_queue_card.dart';
import '../widgets/active_order_list.dart';
import '../widgets/priority_order_card.dart';
import '../widgets/quick_action_buttons.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    context.read<HomeCubit>().loadHome();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeCubit, HomeState>(
      builder: (context, state) {
        String employeeName = 'Loading...';
        String outletName = '';

        if (state is HomeLoaded) {
          employeeName = state.homeData.employeeName;
          outletName = state.homeData.outletName;
        }

        final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

        if (isCompact) {
          return AppLayout(
            header: AppHeader(
              title: 'Dashboard Produksi',
              subtitle: outletName.isNotEmpty
                  ? '$employeeName • $outletName'
                  : employeeName,
              showMenuButton: true,
            ),
            scrollable: true,
            padding: context.space.insetsHorizontal.lg,
            body: _buildBody(context, state),
            bottomBar: const AppDynamicBottomBar(currentRoute: '/home'),
          );
        }

        return ProductionTabletShell(
          currentRouteId: 'home',
          child: SingleChildScrollView(
            padding: context.space.insetsHorizontal.lg,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                PageContentHeader(
                  title: 'Dashboard Produksi',
                  subtitle: outletName.isNotEmpty
                      ? '$employeeName • $outletName'
                      : employeeName,
                  breadcrumbs: const [
                    BreadcrumbItem(label: 'Dashboard Produksi'),
                  ],
                ),
                _buildBody(context, state),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildBody(BuildContext context, HomeState state) {
    if (state is HomeLoading) {
      return const Center(
        child: AppLoadingIndicator(message: 'Memuat data dashboard...'),
      );
    }

    if (state is HomeError) {
      return Center(
        child: AppErrorState(
          message: state.message,
          onRetry: () => context.read<HomeCubit>().loadHome(),
        ),
      );
    }

    if (state is HomeLoaded) {
      final homeData = state.homeData;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: context.space.lg),
          ProductionSummaryCard(summary: homeData.summary),
          SizedBox(height: context.space.xl),
          ProcessQueueCard(processQueue: homeData.processQueue),
          SizedBox(height: context.space.xl),
          ActiveOrderList(activeOrders: homeData.activeOrders),
          SizedBox(height: context.space.xl),
          PriorityOrderCard(priorityOrders: homeData.priorityOrders),
          SizedBox(height: context.space.xl),
          const QuickActionButtons(),
          SizedBox(height: context.space.xl),
        ],
      );
    }

    return const SizedBox.shrink();
  }
}
