import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import 'choice_card_widget.dart';

class DeliveryTypeSelectorWidget extends StatelessWidget {
  final bool isCourierEnabled;

  const DeliveryTypeSelectorWidget({super.key, this.isCourierEnabled = true});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
        return Row(
          children: [
            if (isCourierEnabled) ...[
              Expanded(
                child: ChoiceCardWidget(
                  title: 'Antar Kurir',
                  icon: Icons.delivery_dining,
                  isSelected: state.deliveryType == 'delivery',
                  onTap: () =>
                      context.read<OrderCubit>().setDeliveryType('delivery'),
                ),
              ),
              SizedBox(width: context.space.md),
            ],
            Expanded(
              child: ChoiceCardWidget(
                title: 'Ambil Sendiri',
                icon: Icons.store,
                isSelected: state.deliveryType == 'pickup',
                onTap: () =>
                    context.read<OrderCubit>().setDeliveryType('pickup'),
              ),
            ),
          ],
        );
      },
    );
  }
}
