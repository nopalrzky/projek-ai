import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../bloc/cart_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_state.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_cubit.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_state.dart';
import '../../../outlet/presentation/bloc/outlet_cubit.dart';
import '../../../outlet/presentation/bloc/outlet_state.dart';
import '../../../outlet/presentation/widgets/outlet_order_button_widget.dart';

class OrderBottomActionWidget extends StatelessWidget {
  final int outletId;

  const OrderBottomActionWidget({super.key, required this.outletId});

  @override
  Widget build(BuildContext context) {
    final outletState = context.watch<OutletCubit>().state;
    final isCourierEnabled = outletState is OutletDetailLoaded
        ? outletState.outlet.isCourierEnabled
        : true;

    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
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
            child: BlocBuilder<CourierPricingCubit, CourierPricingState>(
              builder: (context, pricingState) {
                final effectivelyCourierEnabled =
                    isCourierEnabled &&
                    context.read<CartCubit>().state.canUseCourier;
                final isCourierError =
                    effectivelyCourierEnabled &&
                    state.pickupType == 'courier' &&
                    (pricingState.pricingResult?.isServiceable == false ||
                        pricingState.errorMessage != null);

                if (outletState is! OutletDetailLoaded) {
                  return AppButton.primary(
                    label: 'Buat Pesanan',
                    isLoading:
                        state.isSubmittingOrder || pricingState.isCalculating,
                    onPressed: null,
                  );
                }

                return OutletOrderButtonWidget(
                  outlet: outletState.outlet,
                  isLoading:
                      state.isSubmittingOrder || pricingState.isCalculating,
                  onPressed: isCourierError
                      ? null
                      : () {
                          final cartState = context.read<CartCubit>().state;
                          final outletCart =
                              cartState.activeOutletId == outletId
                              ? cartState.activeServices
                              : <int>{};

                          final authState = context
                              .read<CustomerAuthCubit>()
                              .state;
                          if (authState is CustomerAuthAuthenticated) {
                            context.read<OrderCubit>().createOrder(
                              customerAccountId: authState.customer.id,
                              outletId: outletId,
                              serviceIds: outletCart,
                              isCourierEnabled: isCourierEnabled,
                              canUseCourier: cartState.canUseCourier,
                            );
                          }
                        },
                );
              },
            ),
          ),
        );
      },
    );
  }
}
