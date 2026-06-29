import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/home_dashboard_cubit.dart';
import '../bloc/home_dashboard_state.dart';
import '../widgets/home_branded_header_widget.dart';
import '../widgets/home_quick_info_widget.dart';
import '../widgets/pending_payment_shortcut.dart';
import '../widgets/promo_section.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeDashboardCubit>().getHomeDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeDashboardCubit, HomeDashboardState>(
      builder: (context, state) {
        var addressValue = 'Alamat belum tersedia';
        var depositBalance = 0;
        var activeOrderCount = 0;

        if (state is HomeDashboardSuccess) {
          final primaryAddress = state.dashboard.primaryAddress;
          if (primaryAddress != null) {
            addressValue = '${primaryAddress.label} - ${primaryAddress.street}';
          }
          depositBalance = state.dashboard.customer.depositBalance;
          activeOrderCount = state.dashboard.recentOrders.length;
        }

        if (state is HomeDashboardFailure) {
          addressValue = state.failure.message;
        }

        if (state is HomeDashboardLoading || state is HomeDashboardInitial) {
          return const Scaffold(
            body: Center(child: AppLoadingIndicator()),
          );
        }

        return Scaffold(
          backgroundColor: context.colors.background,
          body: CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: HomeBrandedHeaderWidget(
                  addressLabel: 'Alamat Pengiriman',
                  addressValue: addressValue,
                  cartItemCount: 0, // Managed by CartCubit inside the widget
                  onAddressTap: () async {
                    final homeDashboardCubit = context.read<HomeDashboardCubit>();
                    await context.push('/customer-addresses');

                    if (!mounted) return;
                    homeDashboardCubit.getHomeDashboard();
                  },
                  onCartTap: () => context.push('/order-summary'),
                  onSearchTap: () => context.push('/search'),
                ),
              ),
              SliverPadding(
                padding: EdgeInsets.fromLTRB(
                  context.space.lg,
                  0,
                  context.space.lg,
                  context.space.xxl,
                ),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    HomeQuickInfoWidget(
                      depositBalance: depositBalance,
                      activeOrderCount: activeOrderCount,
                      onTopupTap: () => context.push('/topup'),
                      onOrderHistoryTap: () => context.push('/orders'),
                    ),
                    SizedBox(height: context.space.lg),

                    if (state is HomeDashboardSuccess) ...[
                      Builder(
                        builder: (context) {
                          final pendingOrders = state.dashboard.recentOrders
                              .where((o) => o.paymentStatus == 'unpaid')
                              .toList();

                          if (pendingOrders.isEmpty) {
                            return const SizedBox.shrink();
                          }

                          return Padding(
                            padding: EdgeInsets.only(bottom: context.space.lg),
                            child: PendingPaymentShortcut(
                              pendingOrder: pendingOrders.first,
                            ),
                          );
                        },
                      ),
                    ],

                    const PromoSection(),
                  ]),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
