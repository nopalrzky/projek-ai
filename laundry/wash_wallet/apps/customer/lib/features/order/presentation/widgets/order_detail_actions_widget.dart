import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';

class OrderDetailActionsWidget extends StatelessWidget {
  final Order order;

  const OrderDetailActionsWidget({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final canCancel = order.status == 'requested' ||
        order.status == 'pending' ||
        order.status == 'pending_dropoff';
    final canPay = order.canPay && order.status != 'cancelled';
    final canSchedule =
        order.canScheduleDelivery &&
        order.deliverySchedule == null &&
        order.status != 'cancelled';
    final canComplete = order.status == 'delivered';

    if (!canCancel && !canPay && !canSchedule && !canComplete) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: EdgeInsets.all(context.space.lg),
      decoration: BoxDecoration(
        color: context.colors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (canPay) ...[
              AppButton.primary(
                onPressed: () => context.push('/orders/${order.id}/invoice'),
                label: 'Bayar Sekarang',
              ),
              if (canCancel || canSchedule) SizedBox(height: context.space.sm),
            ],
            if (canSchedule) ...[
              AppButton.primary(
                onPressed: () =>
                    context.push('/orders/${order.id}/schedule-delivery'),
                label: 'Jadwalkan Antar',
              ),
              if (canCancel || canComplete) SizedBox(height: context.space.sm),
            ],
            if (canComplete) ...[
              AppButton.success(
                onPressed: () => _showCompleteDialog(context, order),
                label: 'Pesanan Selesai',
                icon: Icon(Icons.verified),
              ),
              if (canCancel) SizedBox(height: context.space.sm),
            ],
            if (canCancel)
              AppButton.danger(
                onPressed: () => _showCancelDialog(context, order),
                label: 'Batalkan Pesanan',
              ),
          ],
        ),
      ),
    );
  }

  void _showCompleteDialog(BuildContext context, Order order) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
        ),
        icon: Container(
          padding: EdgeInsets.all(context.space.md),
          decoration: BoxDecoration(
            color: context.colors.success.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.check_circle_outline,
            color: context.colors.success,
            size: 32,
          ),
        ),
        title: const Text('Pesanan Selesai?', textAlign: TextAlign.center),
        content: Text(
          'Apakah Anda yakin pesanan ${order.orderNumber} telah Anda terima dengan baik?\nTindakan ini tidak dapat diurungkan.',
          textAlign: TextAlign.center,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        actionsAlignment: MainAxisAlignment.center,
        actionsPadding: EdgeInsets.fromLTRB(
          context.space.lg,
          0,
          context.space.lg,
          context.space.lg,
        ),
        actions: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: context.colors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                  child: const Text('Belum'),
                ),
              ),
              SizedBox(width: context.space.md),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.colors.success,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(dialogContext);
                    context.read<OrderCubit>().completeOrder(order.id);
                  },
                  child: const Text('Ya, Selesai'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showCancelDialog(BuildContext context, Order order) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
        ),
        icon: Container(
          padding: EdgeInsets.all(context.space.md),
          decoration: BoxDecoration(
            color: context.colors.error.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.cancel_outlined,
            color: context.colors.error,
            size: 32,
          ),
        ),
        title: const Text('Batalkan Pesanan?', textAlign: TextAlign.center),
        content: Text(
          'Apakah Anda yakin ingin membatalkan pesanan ${order.orderNumber}?\nTindakan ini tidak dapat diurungkan.',
          textAlign: TextAlign.center,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        actionsAlignment: MainAxisAlignment.center,
        actionsPadding: EdgeInsets.fromLTRB(
          context.space.lg,
          0,
          context.space.lg,
          context.space.lg,
        ),
        actions: [
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: context.colors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                  child: const Text('Tidak'),
                ),
              ),
              SizedBox(width: context.space.md),
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.colors.error,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(dialogContext);
                    context.read<OrderCubit>().cancelOrder(order.id);
                  },
                  child: const Text('Ya, Batalkan'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
