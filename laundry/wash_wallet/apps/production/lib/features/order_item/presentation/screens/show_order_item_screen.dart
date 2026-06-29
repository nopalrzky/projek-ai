import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_item_cubit.dart';
import '../bloc/order_item_state.dart';
import '../widgets/order_item_action_buttons.dart';
import '../widgets/order_item_info_card.dart';
import '../widgets/order_item_process_list.dart';
import '../widgets/order_item_status_card.dart';
import '../../../../core/widgets/production_tablet_shell.dart';

class ShowOrderItemScreen extends StatefulWidget {
  final int orderItemId;

  const ShowOrderItemScreen({super.key, required this.orderItemId});

  @override
  State<ShowOrderItemScreen> createState() => _ShowOrderItemScreenState();
}

class _ShowOrderItemScreenState extends State<ShowOrderItemScreen> {
  @override
  void initState() {
    super.initState();
    context.read<OrderItemCubit>().getById(widget.orderItemId);
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<OrderItemCubit, OrderItemState>(
      listener: (context, state) {
        if (state is OrderItemStarted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Order item berhasil dimulai'),
              backgroundColor: context.colors.success,
            ),
          );
          context.read<OrderItemCubit>().getById(widget.orderItemId);
        } else if (state is OrderItemCompleted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Order item berhasil diselesaikan'),
              backgroundColor: context.colors.success,
            ),
          );
          context.pop();
        } else if (state is OrderItemError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: context.colors.error,
            ),
          );
        }
      },
      builder: (context, state) {
        if (state is OrderItemDetailLoading) {
          return const Center(
            child: AppLoadingIndicator(message: 'Memuat detail...'),
          );
        }

        if (state is OrderItemDetailLoaded ||
            state is OrderItemStarted ||
            state is OrderItemCompleted) {
          final orderItem = (state is OrderItemDetailLoaded)
              ? state.orderItem
              : (state is OrderItemStarted)
              ? state.orderItem
              : (state as OrderItemCompleted).orderItem;

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      OrderItemInfoCard(orderItem: orderItem),
                      SizedBox(height: context.space.md),
                      OrderItemStatusCard(orderItem: orderItem),
                      SizedBox(height: context.space.md),
                      OrderItemProcessList(orderItem: orderItem),
                      SizedBox(height: context.space.md),
                    ],
                  ),
                ),
              ),
              OrderItemActionButtons(orderItem: orderItem),
            ],
          );
        }

        if (state is OrderItemDetailError) {
          return Center(
            child: AppErrorState(
              message: state.message,
              onRetry: () =>
                  context.read<OrderItemCubit>().getById(widget.orderItemId),
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );

    if (isCompact) {
      return AppLayoutWithDrawer(
        scrollable: false,
        header: AppHeader(
          title: 'Detail Item Order',
          onBackPressed: () => context.pop(),
        ),
        body: content,
      );
    }

    return ProductionTabletShell(
      currentRouteId: 'orders',
      child: Column(
        children: [
          PageContentHeader(
            title: 'Detail Item Order',
            breadcrumbs: const [
              BreadcrumbItem(label: 'Order'),
              BreadcrumbItem(label: 'Detail Item'),
            ],
          ),
          Expanded(
            child: Padding(
              padding: EdgeInsets.all(context.space.lg),
              child: content,
            ),
          ),
        ],
      ),
    );
  }
}
