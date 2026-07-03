import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'package:wash_wallet_customer/features/home/presentation/bloc/home_dashboard_cubit.dart';
import 'package:wash_wallet_customer/features/home/presentation/bloc/home_dashboard_state.dart';
import '../bloc/topup_cubit.dart';
import '../widgets/topup_history_card.dart';

class IndexTopupScreen extends StatefulWidget {
  const IndexTopupScreen({super.key});

  @override
  State<IndexTopupScreen> createState() => _IndexTopupScreenState();
}

class _IndexTopupScreenState extends State<IndexTopupScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TopupCubit>().getHistory();
      context.read<HomeDashboardCubit>().getHomeDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Saldo Deposit',
        onBackPressed: () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/home');
          }
        },
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          context.read<TopupCubit>().getHistory();
          context.read<HomeDashboardCubit>().getHomeDashboard();
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            const SliverToBoxAdapter(child: _BalanceSummaryCard()),
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: context.space.lg),
                child: AppCard.elevated(
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Butuh isi saldo?',
                              style: context.typography.titleMedium,
                            ),
                            Text(
                              'Topup sekarang untuk transaksi lebih mudah',
                              style: context.typography.bodySmall.copyWith(
                                color: context.colors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      AppButton.primary(
                        label: 'Topup',
                        size: AppButtonSize.sm,
                        onPressed: () => context.push('/topup/create'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SliverPadding(
              padding: EdgeInsets.all(context.space.lg),
              sliver: SliverToBoxAdapter(
                child: Text(
                  'Riwayat Transaksi',
                  style: context.typography.headlineSmall,
                ),
              ),
            ),
            const _TopupHistoryList(),
          ],
        ),
      ),
    );
  }
}

class _BalanceSummaryCard extends StatelessWidget {
  const _BalanceSummaryCard();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HomeDashboardCubit, HomeDashboardState>(
      builder: (context, state) {
        int balance = 0;
        if (state is HomeDashboardSuccess) {
          balance = state.dashboard.customer.depositBalance;
        }

        return Container(
          margin: EdgeInsets.all(context.space.lg),
          padding: EdgeInsets.all(context.space.xl),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                context.colors.primary,
                context.colors.primary.withAlpha(200),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(context.radius.lg),
            boxShadow: [
              BoxShadow(
                color: context.colors.primary.withAlpha(100),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Saldo Deposit Anda',
                    style: context.typography.bodyMedium.copyWith(
                      color: Colors.white.withAlpha(200),
                    ),
                  ),
                  const AppBadge.success(label: 'Aktif', size: AppBadgeSize.sm),
                ],
              ),
              SizedBox(height: context.space.sm),
              Text(
                'Rp ${balance.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}',
                style: context.typography.headlineLarge.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: context.space.md),
              Divider(color: Colors.white.withAlpha(50)),
              SizedBox(height: context.space.sm),
              Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.white, size: 16),
                  SizedBox(width: context.space.xs),
                  Text(
                    'Dapat digunakan untuk semua layanan',
                    style: context.typography.bodySmall.copyWith(
                      color: Colors.white.withAlpha(200),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _TopupHistoryList extends StatelessWidget {
  const _TopupHistoryList();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TopupCubit, TopupState>(
      builder: (context, state) {
        if (state.status == TopupStatus.loading && state.history.isEmpty) {
          return const SliverToBoxAdapter(
            child: Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: AppLoadingIndicator(),
              ),
            ),
          );
        }

        if (state.history.isEmpty &&
            state.status == TopupStatus.historyLoaded) {
          return const SliverToBoxAdapter(
            child: AppEmptyState(
              title: 'Belum ada transaksi',
              description: 'Riwayat topup kamu akan muncul di sini.',
            ),
          );
        }

        if (state.status == TopupStatus.error && state.history.isEmpty) {
          return SliverToBoxAdapter(
            child: Center(
              child: Text(state.errorMessage ?? 'Terjadi kesalahan'),
            ),
          );
        }

        return SliverPadding(
          padding: EdgeInsets.symmetric(horizontal: context.space.lg),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate((context, index) {
              final topup = state.history[index];
              return Padding(
                padding: EdgeInsets.only(bottom: context.space.md),
                child: TopupHistoryCard(
                  topup: topup,
                  onTap: () => context.push('/topup/${topup.id}'),
                ),
              );
            }, childCount: state.history.length),
          ),
        );
      },
    );
  }
}
