import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/cart_cubit.dart';
import '../bloc/cart_state.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../../../../features/auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../../features/auth/presentation/bloc/customer_auth_state.dart';
import '../../../outlet/presentation/bloc/outlet_cubit.dart';
import '../../../outlet/presentation/bloc/outlet_state.dart';
import '../../../customer_address/presentation/bloc/customer_address_list_cubit.dart';
import '../../../customer_address/presentation/bloc/customer_address_list_state.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_cubit.dart';

import '../widgets/outlet_info_card_widget.dart';
import '../widgets/selected_services_list_widget.dart';
import '../widgets/section_title.dart';
import '../widgets/pickup_type_selector_widget.dart';
import '../widgets/delivery_type_selector_widget.dart';
import '../widgets/payment_method_selector_widget.dart';
import '../widgets/courier_pickup_section_widget.dart';
import '../widgets/courier_delivery_section_widget.dart';
import '../widgets/order_notes_field_widget.dart';
import '../widgets/non_courier_cart_warning_widget.dart';
import '../widgets/order_bottom_action_widget.dart';
import '../widgets/self_dropoff_banner_widget.dart';
import '../widgets/outlet_free_shipping_info_widget.dart';
import '../widgets/outlet_visit_info_widget.dart';

class OrderSummaryScreen extends StatefulWidget {
  final int outletId;

  const OrderSummaryScreen({super.key, required this.outletId});

  @override
  State<OrderSummaryScreen> createState() => _OrderSummaryScreenState();
}

class _OrderSummaryScreenState extends State<OrderSummaryScreen> {
  final TextEditingController _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final outletCubit = context.read<OutletCubit>();
      final cartState = context.read<CartCubit>().state;
      final orderCubit = context.read<OrderCubit>();

      if (outletCubit.state is! OutletDetailLoaded ||
          (outletCubit.state as OutletDetailLoaded).outlet.id !=
              widget.outletId) {
        outletCubit.getById(id: widget.outletId);
      } else {
        final outlet = (outletCubit.state as OutletDetailLoaded).outlet;
        if (!(outlet.isCourierEnabled && cartState.canUseCourier)) {
          orderCubit.setPickupType('self_dropoff');
          orderCubit.setDeliveryType('pickup');
        }
      }

      context.read<CustomerAddressListCubit>().getAll();
      context.read<CourierPricingCubit>().getSettingSummary(widget.outletId);
    });
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners: [
        BlocListener<OrderCubit, OrderState>(
          listener: (context, state) {
            if (state.lastCreatedOrder != null) {
              context.read<CartCubit>().clearCart();
              context.pushReplacement(
                '/order-success',
                extra: state.lastCreatedOrder,
              );
            } else if (state.errorMessage != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.errorMessage!),
                  backgroundColor: context.colors.error,
                ),
              );
            }
          },
        ),
        BlocListener<CustomerAddressListCubit, CustomerAddressListState>(
          listener: (context, state) {
            if (state is CustomerAddressListSuccess) {
              final orderCubit = context.read<OrderCubit>();
              if (orderCubit.state.selectedAddress == null) {
                try {
                  final primaryAddress = state.addresses.firstWhere(
                    (a) => a.isPrimary,
                  );
                  orderCubit.selectAddress(primaryAddress);
                } catch (e) {
                  if (state.addresses.isNotEmpty) {
                    orderCubit.selectAddress(state.addresses.first);
                  }
                }
              }
              if (orderCubit.state.selectedAddress != null) {
                _triggerFeeCalculation(context, orderCubit.state);
              }
            }
          },
        ),
        BlocListener<OutletCubit, OutletState>(
          listener: (context, state) {
            if (state is OutletDetailLoaded) {
              final orderCubit = context.read<OrderCubit>();
              final cartState = context.read<CartCubit>().state;
              if (state.outlet.isCourierEnabled && cartState.canUseCourier) {
                if (orderCubit.state.selectedAddress != null) {
                  _triggerFeeCalculation(context, orderCubit.state);
                }
              } else {
                orderCubit.setPickupType('self_dropoff');
                orderCubit.setDeliveryType('pickup');
              }
            }
          },
        ),
        BlocListener<OrderCubit, OrderState>(
          listenWhen: (previous, current) =>
              previous.selectedAddress != current.selectedAddress ||
              previous.pickupType != current.pickupType ||
              previous.deliveryType != current.deliveryType,
          listener: (context, state) {
            _triggerFeeCalculation(context, state);
          },
        ),
      ],
      child: AppLayout(
        header: AppHeader(
          title: 'Ringkasan Pesanan',
          onBackPressed: () => context.pop(),
        ),
        body: Column(
          children: [
            Expanded(
              child: BlocBuilder<OutletCubit, OutletState>(
                builder: (context, outletState) {
                  if (outletState is OutletLoading) {
                    return const Center(child: AppLoadingIndicator());
                  }
                  if (outletState is OutletDetailLoaded) {
                    return _buildContent(context, outletState.outlet);
                  }
                  return const Center(child: Text('Gagal memuat data outlet'));
                },
              ),
            ),
            OrderBottomActionWidget(outletId: widget.outletId),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, Outlet outlet) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (context, cartState) {
        final outletCart = cartState.activeOutletId == widget.outletId
            ? cartState.activeServices
            : <int>{};
        if (outletCart.isEmpty) {
          return const Center(child: Text('Keranjang kosong'));
        }

        final allServices =
            outlet.categories
                ?.expand((c) => c.laundryServices ?? <LaundryService>[])
                .toList() ??
            <LaundryService>[];
        final selectedServices = allServices
            .where((s) => outletCart.contains(s.id))
            .toList();

        final canUseCourier = cartState.canUseCourier;

        return SingleChildScrollView(
          padding: EdgeInsets.all(context.space.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!outlet.isCourierEnabled) ...[
                const SelfDropoffBannerWidget(),
                OutletVisitInfoWidget(outlet: outlet),
                SizedBox(height: context.space.lg),
              ] else if (!canUseCourier) ...[
                const NonCourierCartWarningWidget(),
                OutletVisitInfoWidget(outlet: outlet),
                SizedBox(height: context.space.lg),
              ] else ...[
                OutletInfoCardWidget(outlet: outlet),
                if (outlet.hasUnconditionalFreeShipping) ...[
                  SizedBox(height: context.space.md),
                  OutletFreeShippingInfoWidget(
                    isVisible: outlet.hasUnconditionalFreeShipping,
                  ),
                ],
                SizedBox(height: context.space.lg),
              ],
              const SectionTitle(title: 'Layanan Terpilih'),
              SelectedServicesListWidget(selectedServices: selectedServices),
              SizedBox(height: context.space.lg),
              if (outlet.isCourierEnabled && canUseCourier) ...[
                const SectionTitle(title: 'Metode Pengambilan Baju Kotor'),
                PickupTypeSelectorWidget(
                  isCourierEnabled: outlet.isCourierEnabled,
                  canUseCourier: canUseCourier,
                ),
                CourierPickupSectionWidget(outletId: widget.outletId),
                SizedBox(height: context.space.lg),
                const SectionTitle(title: 'Metode Pengantaran Baju Bersih'),
                DeliveryTypeSelectorWidget(
                  isCourierEnabled: outlet.isCourierEnabled,
                ),
                const CourierDeliverySectionWidget(),
                SizedBox(height: context.space.lg),
              ],
              const SectionTitle(title: 'Metode Pembayaran'),
              const PaymentMethodSelectorWidget(),
              SizedBox(height: context.space.lg),
              const SectionTitle(title: 'Catatan (Opsional)'),
              OrderNotesFieldWidget(controller: _notesController),
              SizedBox(height: context.space.xxl * 2),
            ],
          ),
        );
      },
    );
  }

  void _triggerFeeCalculation(BuildContext context, OrderState orderState) {
    final cartState = context.read<CartCubit>().state;
    final outletState = context.read<OutletCubit>().state;

    final isCourierEligible =
        (outletState is OutletDetailLoaded &&
            outletState.outlet.isCourierEnabled) &&
        cartState.canUseCourier;
    final needsCourier =
        orderState.pickupType == 'courier' ||
        orderState.deliveryType == 'delivery';

    if (isCourierEligible &&
        needsCourier &&
        orderState.selectedAddress != null) {
      final authState = context.read<CustomerAuthCubit>().state;

      if (authState is CustomerAuthAuthenticated) {
        final cartState = context.read<CartCubit>().state;
        final outletCart = cartState.activeOutletId == widget.outletId
            ? cartState.activeServices
            : <int>{};

        final allServices =
            outletState.outlet.categories
                ?.expand((c) => c.laundryServices ?? [])
                .toList() ??
            [];

        final selectedServices = allServices
            .where((s) => outletCart.contains(s.id))
            .toList();

        final orderTotal = selectedServices.fold<double>(
          0,
          (sum, service) => sum + service.price,
        );

        context.read<CourierPricingCubit>().calculateFee(
          outletId: widget.outletId,
          latitude: orderState.selectedAddress!.latitude ?? 0,
          longitude: orderState.selectedAddress!.longitude ?? 0,
          customerId: authState.customer.id,
          addressId: orderState.selectedAddress!.id,
          orderTotal: orderTotal,
        );
      }
    } else {
      context.read<CourierPricingCubit>().resetPricing();
    }
  }
}
