import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import '../../../courier_schedule/presentation/bloc/courier_schedule_cubit.dart';
import '../../../courier_schedule/presentation/bloc/courier_schedule_state.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_cubit.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_state.dart';
import '../widgets/schedule_day_selector_widget.dart';
import '../widgets/schedule_time_slot_card_widget.dart';

class DeliveryScheduleScreen extends StatefulWidget {
  final int orderId;

  const DeliveryScheduleScreen({super.key, required this.orderId});

  @override
  State<DeliveryScheduleScreen> createState() => _DeliveryScheduleScreenState();
}

class _DeliveryScheduleScreenState extends State<DeliveryScheduleScreen> {
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  int? _selectedScheduleId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final orderState = context.read<OrderCubit>().state;
      final order = orderState.selectedOrder;
      if (order != null) {
        context.read<CourierPricingCubit>().getSettingSummary(order.outletId);
      }
      _loadSchedules();
    });
  }

  void _loadSchedules() {
    final orderState = context.read<OrderCubit>().state;
    final order = orderState.selectedOrder;
    if (order != null) {
      final dayName = DateFormat(
        'EEEE',
        'en_US',
      ).format(_selectedDate).toLowerCase();
      final targetDay = dayName;

      context.read<CourierScheduleCubit>().getAll(
        outletId: order.outletId,
        dayOfWeek: targetDay,
        type: 'delivery',
        date: DateFormat('yyyy-MM-dd').format(_selectedDate),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<OrderCubit, OrderState>(
      listener: (context, state) {
        if (state.schedulingSuccess) {
          AppSnackbar.success(
            context,
            message: 'Jadwal pengiriman berhasil disimpan!',
          );
          context.go('/orders');
        }
        if (state.errorMessage != null) {
          AppSnackbar.error(context, message: state.errorMessage!);
        }
      },
      child: AppLayout(
        header: AppHeader(
          title: 'Jadwalkan Pengiriman',
          onBackPressed: () => context.pop(),
        ),
        body: BlocBuilder<OrderCubit, OrderState>(
          builder: (context, orderState) {
            if (orderState.isFetchingOrderDetail ||
                orderState.selectedOrder == null) {
              return const Center(child: AppLoadingIndicator());
            }

            return BlocBuilder<CourierScheduleCubit, CourierScheduleState>(
              builder: (context, scheduleState) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildDateSection(context),
                      const SizedBox(height: 24),
                      _buildScheduleSection(context, scheduleState),
                      const SizedBox(height: 24),
                      _buildAddressSection(context, orderState.selectedOrder!),
                      const SizedBox(height: 32),
                      AppButton.primary(
                        onPressed:
                            _selectedScheduleId != null &&
                                !orderState.isSchedulingDelivery
                            ? _submit
                            : null,
                        isLoading: orderState.isSchedulingDelivery,
                        label: 'Konfirmasi Jadwal',
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildDateSection(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pilih Tanggal Pengiriman',
            style: context.typography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          BlocBuilder<CourierPricingCubit, CourierPricingState>(
            builder: (context, state) {
              final disabledDays =
                  state.settingSummary?.disabledDays ?? const [];

              return ScheduleDaySelectorWidget(
                selectedDate: _selectedDate,
                disabledDays: disabledDays,
                onDateSelected: (date) {
                  setState(() {
                    _selectedDate = date;
                    _selectedScheduleId = null;
                  });
                  _loadSchedules();
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleSection(
    BuildContext context,
    CourierScheduleState state,
  ) {
    if (state is CourierScheduleLoading) {
      return const Center(child: AppLoadingIndicator());
    }

    if (state is CourierScheduleFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: _loadSchedules,
      );
    }

    final schedules = state is CourierScheduleLoaded
        ? state.data.schedules
        : [];

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Pilih Slot Waktu', style: context.typography.headlineSmall),
          const SizedBox(height: 16),
          if (schedules.isEmpty)
            const AppEmptyState(
              title: 'Tidak ada jadwal',
              description: 'Outlet libur atau tidak ada jadwal di hari ini.',
              icon: Icons.event_busy,
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: schedules.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final schedule = schedules[index];
                final isSelected = _selectedScheduleId == schedule.id;

                return ScheduleTimeSlotCardWidget(
                  schedule: schedule,
                  isSelected: isSelected,
                  onSelect: () {
                    setState(() {
                      _selectedScheduleId = schedule.id;
                    });
                  },
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildAddressSection(BuildContext context, Order order) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Alamat Pengiriman', style: context.typography.headlineSmall),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  order.deliveryAddress ?? order.pickupAddress ?? '-',
                  style: context.typography.bodyMedium,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Pesanan akan diantar ke alamat yang sama dengan pengambilan.',
            style: context.typography.bodySmall.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  void _submit() {
    if (_selectedScheduleId == null) return;

    context.read<OrderCubit>().scheduleDelivery(
      orderId: widget.orderId,
      courierScheduleId: _selectedScheduleId!,
      deliveryDate: _selectedDate,
    );
  }
}
