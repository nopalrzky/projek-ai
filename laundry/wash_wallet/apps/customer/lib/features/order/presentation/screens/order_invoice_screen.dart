import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_state.dart';
import '../widgets/invoice_detail_card.dart';
import '../widgets/wallet_balance_summary_widget.dart';
import '../widgets/payment_confirm_sheet.dart';
import '../widgets/payment_method_summary_widget.dart';

class OrderInvoiceScreen extends StatelessWidget {
  final int orderId;

  const OrderInvoiceScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return BlocListener<OrderCubit, OrderState>(
      listener: (context, state) async {
        if (state.paymentSuccess) {
          AppSnackbar.success(context, message: 'Pembayaran berhasil!');
          context.read<OrderCubit>().clearPaymentFlags();
          context.pushReplacement('/orders/$orderId/schedule-delivery');
        }
        if (state.midtransPaymentUrl != null) {
          final url = Uri.parse(state.midtransPaymentUrl!);
          final canLaunch = await canLaunchUrl(url);
          if (!context.mounted) return;
          if (canLaunch) {
            context.read<OrderCubit>().clearPaymentFlags();
            await launchUrl(url, mode: LaunchMode.externalApplication);
            if (!context.mounted) return;
            context.pushReplacement('/orders/$orderId');
          }
        }
        if (state.errorMessage != null) {
          AppSnackbar.error(context, message: state.errorMessage!);
          context.read<OrderCubit>().clearPaymentFlags();
        }
      },
      child: BlocBuilder<OrderCubit, OrderState>(
        builder: (context, state) {
          if (state.isFetchingOrderDetail || state.selectedOrder == null) {
            return const AppLayout(body: Center(child: AppLoadingIndicator()));
          }

          final order = state.selectedOrder!;
          final authState = context.read<CustomerAuthCubit>().state;
          final balance = authState is CustomerAuthAuthenticated
              ? authState.customer.depositBalance
              : 0.0;

          final paymentMethod = order.paymentMethod ?? 'cod';
          final isWallet = paymentMethod == 'wallet_balance';
          final isCod = paymentMethod == 'cod';

          final isBalanceSufficient = balance >= order.totalAmount;
          final isPayDisabled =
              (isWallet && !isBalanceSufficient) || state.isPayingOrder;

          return AppLayout(
            header: AppHeader(
              title: 'Invoice Pesanan',
              onBackPressed: () => context.pop(),
            ),
            body: SingleChildScrollView(
              padding: EdgeInsets.all(context.space.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  InvoiceDetailCard(order: order, formatter: formatter),
                  SizedBox(height: context.space.lg),
                  PaymentMethodSummaryWidget(paymentMethod: paymentMethod),
                  if (isWallet) ...[
                    SizedBox(height: context.space.md),
                    WalletBalanceSummaryWidget(
                      balance: balance.toDouble(),
                      totalAmount: order.totalAmount.toDouble(),
                      formatter: formatter,
                    ),
                  ],
                  SizedBox(height: context.space.xxl),
                ],
              ),
            ),
            bottomBar: Container(
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
                child: isCod
                    ? Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            'Silakan lakukan pembayaran langsung secara tunai/debit di kasir saat mengambil pesanan Anda.',
                            style: context.typography.bodyMedium.copyWith(
                              color: context.colors.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: context.space.md),
                          AppButton.primary(
                            onPressed: () => context.pushReplacement('/orders'),
                            label: 'Lihat Daftar Pesanan',
                          ),
                        ],
                      )
                    : Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          AppButton.primary(
                            onPressed: isPayDisabled
                                ? null
                                : () => _showConfirmPaymentSheet(
                                    context,
                                    paymentMethod,
                                    order.totalAmount.toDouble(),
                                    balance.toDouble(),
                                    formatter,
                                  ),
                            isLoading: state.isPayingOrder,
                            label: 'Bayar Sekarang',
                          ),
                          if (isWallet && !isBalanceSufficient) ...[
                            SizedBox(height: context.space.sm),
                            Text(
                              'Saldo tidak mencukupi. Silakan topup saldo Anda.',
                              style: context.typography.bodySmall.copyWith(
                                color: context.colors.error,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            SizedBox(height: context.space.sm),
                            AppButton.outline(
                              onPressed: () => context.push('/topup/create'),
                              label: 'Topup Saldo',
                            ),
                          ],
                        ],
                      ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _showConfirmPaymentSheet(
    BuildContext context,
    String paymentMethod,
    double totalAmount,
    double balance,
    NumberFormat formatter,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: context.colors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(context.radius.lg),
          topRight: Radius.circular(context.radius.lg),
        ),
      ),
      builder: (sheetContext) => PaymentConfirmSheet(
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        balance: balance,
        formatter: formatter,
        onConfirm: () => context.read<OrderCubit>().payOrder(orderId),
      ),
    );
  }
}
