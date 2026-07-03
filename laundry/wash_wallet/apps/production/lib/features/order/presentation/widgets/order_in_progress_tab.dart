import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import 'order_grid_list.dart';

class OrderInProgressTab extends StatelessWidget {
  const OrderInProgressTab({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
        if (state is OrderLoading) {
          return const Center(
            child: AppLoadingIndicator(
              message: 'Memuat order sedang dikerjakan...',
            ),
          );
        }

        if (state is OrderError) {
          return Center(
            child: AppErrorState(
              message: state.message,
              onRetry: () => context.read<OrderCubit>().getAll(
                status: 'in_progress',
                page: 1,
                perPage: 15,
              ),
            ),
          );
        }

        if (state is OrdersLoaded) {
          if (state.orders.isEmpty) {
            return const Center(
              child: AppEmptyState.order(
                title: 'Tidak Ada Order Sedang Dikerjakan',
                description: 'Belum ada order yang sedang dikerjakan',
              ),
            );
          }

          final isTablet = !AppBreakpoints.isCompact(context);

          Widget listWidget = OrderGridList(
            orders: state.orders,
            showProcessButton: false,
            onRefresh: () async {
              context.read<OrderCubit>().getAll(
                status: 'in_progress',
                page: 1,
                perPage: 15,
              );
            },
            onDetail: (order) {
              context.push('/orders/${order.id}');
            },
          );

          if (isTablet) {
            return Column(
              children: [
                Expanded(child: listWidget),
                Container(
                  decoration: BoxDecoration(
                    color: context.colors.surface,
                    border: Border(
                      top: BorderSide(
                        color: context.colors.outlineVariant.withValues(alpha: 0.85),
                      ),
                    ),
                  ),
                  child: AppPagination(
                    currentPage: state.currentPage,
                    lastPage: state.lastPage,
                    total: state.total,
                    from: state.from,
                    to: state.to,
                    isLoading: state.isPageLoading,
                    onPageChanged: (page) {
                      context.read<OrderCubit>().changePage(
                        page,
                        status: 'in_progress',
                      );
                    },
                  ),
                ),
              ],
            );
          }

          return listWidget;
        }

        return const SizedBox.shrink();
      },
    );
  }
}
