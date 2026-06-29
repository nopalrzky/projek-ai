import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_cubit.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_state.dart';

class CourierDeliverySectionWidget extends StatelessWidget {
  const CourierDeliverySectionWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, orderState) {
        if (orderState.deliveryType != 'delivery') {
          return const SizedBox.shrink();
        }

        return BlocBuilder<CourierPricingCubit, CourierPricingState>(
          builder: (context, pricingState) {
            final result = pricingState.pricingResult;
            if (result == null) {
              return const SizedBox.shrink();
            }

            return Padding(
              padding: EdgeInsets.only(top: context.space.md),
              child: AppCard(
                child: Padding(
                  padding: EdgeInsets.all(context.space.md),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.local_shipping_outlined,
                            color: context.colors.primary,
                          ),
                          SizedBox(width: context.space.sm),
                          Text(
                            'Estimasi Ongkir Pengantaran',
                            style: context.typography.titleMedium.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      if (result.isFree)
                        const AppBadge.success(label: 'GRATIS')
                      else
                        Text(
                          formatter.format(result.customerPays),
                          style: context.typography.titleMedium.copyWith(
                            color: context.colors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
