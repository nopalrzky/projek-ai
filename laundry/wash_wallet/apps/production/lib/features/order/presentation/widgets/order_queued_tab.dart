import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import 'order_item_card.dart';
import 'order_detail_dialog.dart';

class OrderQueuedTab extends StatelessWidget {
  const OrderQueuedTab({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
        if (state is OrderLoading) {
          return const Center(
            child: AppLoadingIndicator(message: 'Memuat order siap dikerjakan...'),
          );
        }

        if (state is OrderError) {
          return Center(
            child: AppErrorState(
              message: state.message,
              onRetry: () => context.read<OrderCubit>().getAll(
                status: 'ready_to_process',
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
                title: 'Tidak Ada Order Siap Dikerjakan',
                description: 'Semua order sedang dikerjakan atau belum ada antrian baru',
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              context.read<OrderCubit>().getAll(
                status: 'ready_to_process',
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
                  showProcessButton: true,
                  onDetail: () {
                    context.push('/orders/${order.id}');
                  },
                  onProcess: () {
                    _showProcessConfirmation(context, order);
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

  void _showProcessConfirmation(BuildContext context, dynamic order) {
    OrderDetailDialog.show(
      context,
      order: order,
      confirmLabel: 'Mulai Kerjakan',
      onConfirm: () {
        _startOrder(context, order.id);
      },
    );
  }

  void _startOrder(BuildContext context, int orderId) async {
    final cubit = context.read<OrderCubit>();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          const Center(child: AppLoadingIndicator(message: 'Memulai order...')),
    );

    await cubit.start(orderId: orderId);

    if (context.mounted) {
      Navigator.of(context).pop();
    }

    if (context.mounted) {
      final state = cubit.state;

      if (state is OrderStarted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Order berhasil dimulai'),
            backgroundColor: context.colors.success,
          ),
        );

        cubit.getAll(status: 'ready_to_process', page: 1, perPage: 15);

        context.push('/orders/$orderId');
      } else if (state is OrderError) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(state.message),
            backgroundColor: context.colors.error,
          ),
        );
      }
    }
  }
}
