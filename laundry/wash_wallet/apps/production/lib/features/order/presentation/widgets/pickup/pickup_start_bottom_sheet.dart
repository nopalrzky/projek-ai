import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../bloc/order_cubit.dart';
import 'pickup_maps_button.dart';

class PickupStartBottomSheet extends StatelessWidget {
  final Order order;

  const PickupStartBottomSheet({super.key, required this.order});

  static Future<void> show(BuildContext context, Order order) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(context.radius.xl),
        ),
      ),
      builder: (_) => BlocProvider.value(
        value: context.read<OrderCubit>(),
        child: PickupStartBottomSheet(order: order),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        context.space.lg,
        context.space.lg,
        context.space.lg,
        context.space.lg + MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: context.colors.border,
                borderRadius: BorderRadius.circular(context.radius.full),
              ),
            ),
          ),
          SizedBox(height: context.space.lg),
          Text(
            'Mulai Penjemputan',
            style: context.typography.headlineLarge.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.lg),
          _buildOrderInfo(context),
          SizedBox(height: context.space.xl),
          _buildActions(context),
          SizedBox(height: context.space.md),
        ],
      ),
    );
  }

  Widget _buildOrderInfo(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoRow(context, 'Pesanan', order.orderNumber),
          SizedBox(height: context.space.sm),
          _buildInfoRow(
            context,
            'Customer',
            order.customer?.name ?? 'Customer Umum',
          ),
          SizedBox(height: context.space.sm),
          _buildInfoRow(
            context,
            'Alamat',
            order.pickupAddress ?? 'Alamat tidak tersedia',
          ),
          if (order.pickupSchedule != null) ...[
            SizedBox(height: context.space.sm),
            _buildInfoRow(
              context,
              'Jadwal',
              DateFormat('HH:mm').format(order.pickupSchedule!),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 72,
          child: Text(
            label,
            style: context.typography.labelSmall.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: context.typography.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PickupMapsButton(
          order: order,
          size: AppButtonSize.lg,
          isFullWidth: true,
        ),
        SizedBox(height: context.space.md),
        AppButton.primary(
          label: 'Ambil Sekarang',
          isFullWidth: true,
          icon: const Icon(Icons.directions_bike),
          onPressed: () {
            Navigator.pop(context);
            context.read<OrderCubit>().pickup(order.id);
          },
        ),
      ],
    );
  }
}
