import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import 'payment_method_option_widget.dart';

class PaymentMethodSelectorWidget extends StatelessWidget {
  const PaymentMethodSelectorWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
        return Column(
          children: [
            PaymentMethodOptionWidget(
              title: 'Bayar di Kasir',
              subtitle: 'Bayar langsung saat mengambil pesanan',
              icon: Icons.point_of_sale,
              isSelected: state.paymentMethod == 'cod',
              onTap: () =>
                  context.read<OrderCubit>().selectPaymentMethod('cod'),
            ),
            SizedBox(height: context.space.sm),
            PaymentMethodOptionWidget(
              title: 'Transfer Online',
              subtitle:
                  'Bayar dengan transfer bank atau metode pembayaran online',
              icon: Icons.account_balance,
              isSelected: state.paymentMethod == 'transfer',
              onTap: () =>
                  context.read<OrderCubit>().selectPaymentMethod('transfer'),
            ),
            SizedBox(height: context.space.sm),
            PaymentMethodOptionWidget(
              title: 'Saldo Wallet',
              subtitle: 'Bayar menggunakan saldo deposit Anda',
              icon: Icons.account_balance_wallet,
              isSelected: state.paymentMethod == 'wallet_balance',
              onTap: () => context.read<OrderCubit>().selectPaymentMethod(
                'wallet_balance',
              ),
            ),
          ],
        );
      },
    );
  }
}
