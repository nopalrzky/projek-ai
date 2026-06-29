import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import 'order_item_card.dart';

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

          return RefreshIndicator(
            onRefresh: () async {
              context.read<OrderCubit>().getAll(
                status: 'in_progress',
                page: 1,
                perPage: 15,
              );
            },
            child: ListView.separated(
              padding: EdgeInsets.all(context.space.md),
              itemCount: state.orders.length,
              separatorBuilder: (context, index) =>
                  SizedBox(height: context.space.md),
              itemBuilder: (context, index) {
                final order = state.orders[index];
                return OrderItemCard(
                  order: order,
                  onDetail: () {
                    context.push('/orders/${order.id}');
                  },
                );
              },
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }
}
