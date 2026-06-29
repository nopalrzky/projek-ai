import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/utils/currency_formatter.dart';
import '../bloc/cart_cubit.dart';

class ServiceDetailBottomSheet extends StatelessWidget {
  final LaundryService service;
  final int outletId;
  final String outletName;
  final bool isInCart;

  const ServiceDetailBottomSheet({
    super.key,
    required this.service,
    required this.outletId,
    required this.outletName,
    required this.isInCart,
  });

  static Future<void> show(
    BuildContext context, {
    required LaundryService service,
    required int outletId,
    required String outletName,
    required bool isInCart,
  }) {
    return AppBottomSheet.show(
      context,
      title: service.name,
      child: BlocProvider.value(
        value: context.read<CartCubit>(),
        child: ServiceDetailBottomSheet(
          service: service,
          outletId: outletId,
          outletName: outletName,
          isInCart: isInCart,
        ),
      ),
    );
  }

  void _handleAddToCart(BuildContext context) async {
    final cartCubit = context.read<CartCubit>();
    final result = await cartCubit.addService(
      service.id,
      outletId,
      outletName,
      supportsCourier: service.supportsCourier,
    );
    if (result == AddServiceResult.added && context.mounted) {
      Navigator.pop(context);
    }
  }

  void _handleRemoveFromCart(BuildContext context) async {
    final cartCubit = context.read<CartCubit>();
    await cartCubit.removeFromCart(service.id);
    if (context.mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: Container(
            padding: EdgeInsets.all(context.space.xl),
            decoration: BoxDecoration(
              color: context.colors.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.local_laundry_service_rounded,
              size: 64,
              color: context.colors.primary,
            ),
          ),
        ),
        SizedBox(height: context.space.xl),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              formatRupiah(service.price),
              style: context.typography.headlineMedium.copyWith(
                color: context.colors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
            AppBadge.primary(label: service.unit?.name ?? 'unit'),
          ],
        ),
        SizedBox(height: context.space.md),
        _buildInfoRow(
          context,
          Icons.access_time_rounded,
          'Estimasi durasi ±${service.durationHours} jam',
        ),
        if (service.minQuantity > 1) ...[
          SizedBox(height: context.space.xs),
          _buildInfoRow(
            context,
            Icons.info_outline_rounded,
            'Minimal pemesanan ${service.minQuantity} ${service.unit?.name ?? 'unit'}',
          ),
        ],
        if (service.description != null && service.description!.isNotEmpty) ...[
          SizedBox(height: context.space.lg),
          Text(
            'Deskripsi',
            style: context.typography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.xs),
          Text(
            service.description!,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ],
        if (!service.supportsCourier) ...[
          SizedBox(height: context.space.lg),
          _NonCourierInfoRow(),
        ],
        SizedBox(height: context.space.xxl),
        if (isInCart)
          AppButton.danger(
            label: 'Hapus dari Pesanan',
            onPressed: () => _handleRemoveFromCart(context),
            isFullWidth: true,
          )
        else
          AppButton.primary(
            label: 'Tambah ke Pesanan',
            onPressed: () => _handleAddToCart(context),
            isFullWidth: true,
          ),
      ],
    );
  }

  Widget _buildInfoRow(BuildContext context, IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 18, color: context.colors.textTertiary),
        SizedBox(width: context.space.sm),
        Expanded(
          child: Text(
            text,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}

class _NonCourierInfoRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(
            color: context.colors.warning.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.store_outlined, color: context.colors.warning, size: 20),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Datang langsung ke outlet',
                  style: context.typography.labelLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.warning,
                  ),
                ),
                SizedBox(height: context.space.xxs),
                Text(
                  'Layanan ini tidak tersedia untuk pickup/delivery. Silakan datang langsung ke outlet.',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
