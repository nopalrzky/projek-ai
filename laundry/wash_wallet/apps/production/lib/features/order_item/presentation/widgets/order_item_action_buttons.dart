import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_item_cubit.dart';

class OrderItemActionButtons extends StatelessWidget {
  final OrderItem orderItem;

  const OrderItemActionButtons({super.key, required this.orderItem});

  @override
  Widget build(BuildContext context) {
    final status = orderItem.status.toLowerCase();
    final isNotStarted = status == 'pending';
    final isInProgress = status == 'processing';

    if (status == 'done') {
      return const SizedBox();
    }

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          if (isNotStarted)
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => _showStartOrderItemDialog(context, orderItem),
                icon: const Icon(Icons.play_arrow),
                label: const Text('Mulai Order Item'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.colors.primary,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: context.space.md),
                ),
              ),
            ),
          if (isInProgress)
            Expanded(
              child: ElevatedButton.icon(
                onPressed: orderItem.canCompleteOrderItem
                    ? () => _showCompleteOrderItemDialog(context, orderItem)
                    : null,
                icon: const Icon(Icons.check_circle),
                label: const Text('Selesaikan Order Item'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.colors.success,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: context.space.md),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showStartOrderItemDialog(BuildContext context, OrderItem orderItem) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Mulai Order Item'),
        content: Text(
          'Apakah Anda yakin ingin mulai mengerjakan "${orderItem.laundryServiceName}"?\n\nSemua proses akan dapat dikerjakan secara berurutan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              _startOrderItem(context, orderItem);
            },
            child: const Text('Mulai'),
          ),
        ],
      ),
    );
  }

  void _showCompleteOrderItemDialog(BuildContext context, OrderItem orderItem) {
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Selesaikan Order Item'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Apakah semua proses untuk "${orderItem.laundryServiceName}" sudah selesai?',
            ),
            SizedBox(height: context.space.md),
            TextField(
              controller: notesController,
              decoration: const InputDecoration(
                labelText: 'Catatan (opsional)',
                hintText: 'Tambahkan catatan jika perlu',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Belum'),
          ),
          ElevatedButton(
            onPressed: () {
              final notes = notesController.text.trim();
              Navigator.of(dialogContext).pop();
              _completeOrderItem(
                context,
                orderItem,
                notes.isEmpty ? null : notes,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: context.colors.success,
            ),
            child: const Text('Selesai'),
          ),
        ],
      ),
    );
  }

  void _startOrderItem(BuildContext context, OrderItem orderItem) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: AppLoadingIndicator(message: 'Memulai order item...'),
      ),
    );

    await context.read<OrderItemCubit>().start(orderItem.id);

    if (context.mounted) {
      Navigator.of(context).pop();
    }
  }

  void _completeOrderItem(
    BuildContext context,
    OrderItem orderItem,
    String? notes,
  ) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: AppLoadingIndicator(message: 'Menyelesaikan order item...'),
      ),
    );

    await context.read<OrderItemCubit>().complete(
      id: orderItem.id,
      notes: notes,
    );

    if (context.mounted) {
      Navigator.of(context).pop(); // Close loading
    }
  }
}
