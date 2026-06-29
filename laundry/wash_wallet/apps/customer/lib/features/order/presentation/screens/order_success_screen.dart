import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../widgets/pending_dropoff_instruction_widget.dart';

class OrderSuccessScreen extends StatelessWidget {
  final Order order;

  const OrderSuccessScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final isPendingDropoff = order.status == 'pending_dropoff';

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(context.space.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isPendingDropoff) ...[
                PendingDropoffInstructionWidget(order: order),
              ] else ...[
                Icon(
                  Icons.check_circle_outline_rounded,
                  size: 100,
                  color: context.colors.success,
                ),
                SizedBox(height: context.space.lg),
                Text(
                  'Pesanan Berhasil!',
                  style: context.typography.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: context.space.md),
                Text(
                  'Nomor Pesanan: ${order.orderNumber}',
                  style: context.typography.titleMedium,
                ),
                SizedBox(height: context.space.md),
                Text(
                  'Pesanan Anda telah diterima oleh ${order.outlet?.name ?? 'outlet'}.',
                  textAlign: TextAlign.center,
                  style: context.typography.bodyLarge.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
              SizedBox(height: context.space.xxl),
              AppButton.primary(
                label: 'Lihat Detail Pesanan',
                onPressed: () {
                  context.go('/orders/${order.id}');
                },
              ),
              SizedBox(height: context.space.md),
              AppButton.ghost(
                label: 'Kembali ke Beranda',
                onPressed: () => context.go('/home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
