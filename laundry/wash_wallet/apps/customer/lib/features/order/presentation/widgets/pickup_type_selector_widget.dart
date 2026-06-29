import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import 'choice_card_widget.dart';

class PickupTypeSelectorWidget extends StatelessWidget {
  final bool isCourierEnabled;
  final bool canUseCourier;

  const PickupTypeSelectorWidget({
    super.key,
    this.isCourierEnabled = true,
    this.canUseCourier = true,
  });

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<OrderCubit, OrderState>(
      listener: (context, state) {
        if (isCourierEnabled && !canUseCourier && state.pickupType != 'self_dropoff') {
          context.read<OrderCubit>().setPickupType('self_dropoff');
        }
      },
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (isCourierEnabled && canUseCourier) ...[
                  Expanded(
                    child: ChoiceCardWidget(
                      title: 'Jemput Kurir',
                      icon: Icons.delivery_dining,
                      isSelected: state.pickupType == 'courier',
                      onTap: () =>
                          context.read<OrderCubit>().setPickupType('courier'),
                    ),
                  ),
                  SizedBox(width: context.space.md),
                ],
                Expanded(
                  child: ChoiceCardWidget(
                    title: 'Antar Sendiri',
                    icon: Icons.store,
                    isSelected: state.pickupType == 'self_dropoff',
                    onTap: () {
                      if (isCourierEnabled && canUseCourier) {
                        context.read<OrderCubit>().setPickupType('self_dropoff');
                      }
                    },
                  ),
                ),
              ],
            ),
            if (isCourierEnabled && !canUseCourier) ...[
              SizedBox(height: context.space.xs),
              Text(
                'Pickup/delivery tidak tersedia karena ada layanan non-kurir',
                style: context.typography.labelSmall.copyWith(
                  color: context.colors.warning,
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}
