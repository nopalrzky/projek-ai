import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_cubit.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_state.dart';
import '../../../courier_schedule/presentation/bloc/courier_schedule_cubit.dart';
import '../../../courier_schedule/presentation/bloc/courier_schedule_state.dart';
import '../../../customer_address/domain/entities/customer_address.dart';
import '../../../customer_address/presentation/bloc/customer_address_list_cubit.dart';
import '../../../customer_address/presentation/bloc/customer_address_list_state.dart';
import 'courier_fee_estimate_widget.dart';
import 'schedule_selector_widget.dart';
import 'address_selector_bottom_sheet.dart';

class CourierPickupSectionWidget extends StatelessWidget {
  final int outletId;

  const CourierPickupSectionWidget({super.key, required this.outletId});

  void _showAddressSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => MultiBlocProvider(
        providers: [
          BlocProvider.value(value: context.read<OrderCubit>()),
          BlocProvider.value(value: context.read<CustomerAddressListCubit>()),
        ],
        child: AddressSelectorBottomSheet(
          selectedAddress: context.read<OrderCubit>().state.selectedAddress,
          onAddressSelected: (address) {
            context.read<OrderCubit>().selectAddress(address);
          },
          onAddAddress: () async {
            Navigator.of(context).pop();
            final newAddress = await context.push<CustomerAddress?>(
              '/customer-addresses/create',
            );
            if (newAddress != null && context.mounted) {
              context.read<OrderCubit>().selectAddress(newAddress);
              context.read<CustomerAddressListCubit>().getAll();
            }
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, orderState) {
        if (orderState.pickupType != 'courier') {
          return const SizedBox.shrink();
        }

        return Column(
          children: [
            SizedBox(height: context.space.md),
            BlocBuilder<CustomerAddressListCubit, CustomerAddressListState>(
              builder: (context, addressState) {
                if (addressState is CustomerAddressListLoading) {
                  return AppCard(
                    child: Padding(
                      padding: EdgeInsets.all(context.space.md),
                      child: const Center(
                        child: SizedBox(
                          height: 24,
                          width: 24,
                          child: AppLoadingIndicator(),
                        ),
                      ),
                    ),
                  );
                }

                if (addressState is CustomerAddressListSuccess &&
                    addressState.addresses.isEmpty &&
                    orderState.selectedAddress == null) {
                  return AppCard.danger(
                    child: Padding(
                      padding: EdgeInsets.all(context.space.md),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.warning_amber_rounded,
                                color: context.colors.error,
                              ),
                              SizedBox(width: context.space.md),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Alamat Belum Tersedia',
                                      style: context.typography.titleMedium
                                          .copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: context.colors.error,
                                          ),
                                    ),
                                    SizedBox(height: context.space.xs),
                                    Text(
                                      'Anda belum memiliki alamat. Silakan tambah alamat terlebih dahulu untuk mengetahui harga ongkir.',
                                      style: context.typography.bodySmall
                                          .copyWith(
                                            color: context.colors.error,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: context.space.md),
                          AppButton.outline(
                            label: 'Tambah Alamat',
                            onPressed: () async {
                              final newAddress = await context
                                  .push<CustomerAddress?>(
                                    '/customer-addresses/create',
                                  );
                              if (newAddress != null && context.mounted) {
                                context.read<OrderCubit>().selectAddress(
                                  newAddress,
                                );
                                context
                                    .read<CustomerAddressListCubit>()
                                    .getAll();
                              }
                            },
                            isFullWidth: true,
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return AppCard(
                  onTap: () => _showAddressSelector(context),
                  child: Padding(
                    padding: EdgeInsets.all(context.space.md),
                    child: Row(
                      children: [
                        Icon(Icons.location_on, color: context.colors.primary),
                        SizedBox(width: context.space.md),
                        Expanded(
                          child: orderState.selectedAddress != null
                              ? Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      orderState.selectedAddress!.label,
                                      style: context.typography.titleMedium
                                          .copyWith(
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                    Text(
                                      orderState.selectedAddress!.street,
                                      style: context.typography.bodySmall,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                )
                              : Text(
                                  'Pilih Alamat Pengambilan',
                                  style: context.typography.bodyMedium.copyWith(
                                    color: context.colors.textSecondary,
                                  ),
                                ),
                        ),
                        Icon(
                          Icons.chevron_right,
                          color: context.colors.textSecondary,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            SizedBox(height: context.space.md),
            const CourierFeeEstimateWidget(),
            SizedBox(height: context.space.lg),
            BlocBuilder<CourierPricingCubit, CourierPricingState>(
              builder: (context, pricingState) {
                final disabledDays =
                    pricingState.settingSummary?.disabledDays ?? const [];

                return BlocBuilder<CourierScheduleCubit, CourierScheduleState>(
                  builder: (context, scheduleState) {
                    return ScheduleSelectorWidget(
                      selectedDate: orderState.selectedDate,
                      selectedSchedule: orderState.selectedSchedule,
                      disabledDays: disabledDays,
                      scheduleData: scheduleState is CourierScheduleLoaded
                          ? scheduleState.data
                          : null,
                      isLoading: scheduleState is CourierScheduleLoading,
                      onDateSelected: (date) {
                        context.read<OrderCubit>().setDate(date);
                        final dayOfWeek = DateFormat(
                          'EEEE',
                        ).format(date).toLowerCase();
                        context.read<CourierScheduleCubit>().getAll(
                          outletId: outletId,
                          dayOfWeek: dayOfWeek,
                          type: 'pickup',
                          date: DateFormat('yyyy-MM-dd').format(date),
                        );
                      },
                      onScheduleSelected: (schedule) {
                        context.read<OrderCubit>().selectSchedule(schedule);
                      },
                    );
                  },
                );
              },
            ),
          ],
        );
      },
    );
  }
}
