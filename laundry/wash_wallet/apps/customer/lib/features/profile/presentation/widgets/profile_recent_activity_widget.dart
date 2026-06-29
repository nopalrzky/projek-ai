import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../home/domain/entities/home_dashboard.dart';
import '../../../home/presentation/bloc/home_dashboard_cubit.dart';
import '../../../home/presentation/bloc/home_dashboard_state.dart';

class ProfileRecentActivityWidget extends StatelessWidget {
  const ProfileRecentActivityWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Aktivitas Terbaru',
            style: context.typography.titleMedium.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.space.sm),
          BlocBuilder<HomeDashboardCubit, HomeDashboardState>(
            builder: (context, state) {
              if (state is HomeDashboardLoading ||
                  state is HomeDashboardInitial) {
                return const AppCard(
                  child: Center(child: AppLoadingIndicator()),
                );
              }

              if (state is HomeDashboardFailure) {
                return const SizedBox.shrink();
              }

              if (state is HomeDashboardSuccess) {
                final orders = state.dashboard.recentOrders.take(5).toList();
                if (orders.isEmpty) {
                  return const AppCard(
                    child: AppEmptyState.order(
                      title: 'Belum ada aktivitas terbaru',
                      description: 'Pesanan terbaru kamu akan muncul di sini.',
                      size: AppEmptyStateSize.sm,
                    ),
                  );
                }

                return AppCard(
                  child: Column(
                    children: [
                      for (var index = 0; index < orders.length; index++)
                        _RecentOrderTile(
                          order: orders[index],
                          showDivider: index != orders.length - 1,
                        ),
                    ],
                  ),
                );
              }

              return const SizedBox.shrink();
            },
          ),
        ],
      ),
    );
  }
}

class _RecentOrderTile extends StatelessWidget {
  final RecentOrder order;
  final bool showDivider;

  const _RecentOrderTile({required this.order, required this.showDivider});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return AppListTile.order(
      title: order.orderNumber,
      subtitle: _buildSubtitle(context),
      leading: Icon(Icons.receipt_long_outlined, color: context.colors.primary),
      price: formatter.format(order.totalAmount),
      status: Wrap(
        spacing: context.space.xs,
        runSpacing: context.space.xs,
        children: [
          OrderStatusBadge(status: order.status),
          PaymentStatusBadge(status: order.paymentStatus),
        ],
      ),
      showDivider: showDivider,
      onTap: () => context.push('/orders/${order.id}'),
    );
  }

  String _buildSubtitle(BuildContext context) {
    final parts = <String>[order.outletName];
    final date = _formatDate(order.orderDate);
    if (date != null) {
      parts.add(date);
    }
    return parts.join(' - ');
  }

  String? _formatDate(String? value) {
    if (value == null || value.trim().isEmpty) return null;

    final parsed = DateTime.tryParse(value);
    if (parsed == null) return value;

    return DateFormat('d MMM yyyy').format(parsed);
  }
}
