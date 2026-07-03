import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../widgets/order_detail_actions_widget.dart';
import '../widgets/order_detail_header_widget.dart';
import '../widgets/order_detail_info_widget.dart';
import '../widgets/order_detail_items_widget.dart';
import '../widgets/order_detail_pricing_summary_widget.dart';
import '../widgets/pending_dropoff_instruction_widget.dart';

class ShowOrderScreen extends StatefulWidget {
  final int orderId;

  const ShowOrderScreen({super.key, required this.orderId});

  @override
  State<ShowOrderScreen> createState() => _ShowOrderScreenState();
}

class _ShowOrderScreenState extends State<ShowOrderScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderCubit>().getById(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Detail Pesanan',
        onBackPressed: () => context.pop(),
      ),
      body: BlocConsumer<OrderCubit, OrderState>(
        listener: (context, state) {
          if (state.errorMessage != null && !state.isFetchingOrderDetail) {
            AppSnackbar.error(context, message: state.errorMessage!);
          }
        },
        builder: (context, state) {
          if (state.isFetchingOrderDetail) {
            return const Center(child: AppLoadingIndicator());
          }

          if (state.errorMessage != null && state.selectedOrder == null) {
            return AppErrorState(
              title: 'Gagal Memuat',
              message: state.errorMessage!,
              onRetry: () => context.read<OrderCubit>().getById(widget.orderId),
            );
          }

          final order = state.selectedOrder;
          if (order == null) {
            return AppEmptyState(
              title: 'Pesanan Tidak Ditemukan',
              description: 'Data pesanan tidak tersedia.',
              icon: Icons.receipt_long_outlined,
            );
          }

          return Stack(
            children: [
              SingleChildScrollView(
                padding: EdgeInsets.fromLTRB(
                  context.space.lg,
                  context.space.lg,
                  context.space.lg,
                  150, // Bottom padding for actions
                ),
                child: Column(
                  children: [
                    if (order.status == 'pending_dropoff') ...[
                      PendingDropoffInstructionWidget(
                        order: order,
                        showSuccessHeader: false,
                      ),
                      SizedBox(height: context.space.lg),
                    ],
                    OrderDetailHeaderWidget(order: order),
                    SizedBox(height: context.space.lg),
                    OrderDetailInfoWidget(order: order),
                    SizedBox(height: context.space.lg),
                    OrderDetailItemsWidget(order: order),
                    SizedBox(height: context.space.lg),
                    OrderDetailPricingSummaryWidget(order: order),
                  ],
                ),
              ),
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: OrderDetailActionsWidget(order: order),
              ),
              if (state.isCancellingOrder)
                Container(
                  color: Colors.black.withValues(alpha: 0.3),
                  child: const Center(child: AppLoadingIndicator()),
                ),
            ],
          );
        },
      ),
    );
  }
}
