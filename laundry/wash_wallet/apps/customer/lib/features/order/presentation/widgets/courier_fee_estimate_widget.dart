import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../courier_pricing/presentation/bloc/courier_pricing_cubit.dart';
import '../../../courier_pricing/presentation/bloc/courier_pricing_state.dart';
import 'courier_fee_breakdown_widget.dart';

class CourierFeeEstimateWidget extends StatelessWidget {
  const CourierFeeEstimateWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return BlocBuilder<CourierPricingCubit, CourierPricingState>(
      builder: (context, state) {
        if (state.isCalculating) {
          return AppCard(
            child: Padding(
              padding: EdgeInsets.all(context.space.md),
              child: Row(
                children: [
                  const AppLoadingIndicator(),
                  SizedBox(width: context.space.sm),
                  Text(
                    'Menghitung biaya pengiriman...',
                    style: context.typography.bodyMedium,
                  ),
                ],
              ),
            ),
          );
        }

        if (state.errorMessage != null) {
          return AppCard(
            child: Padding(
              padding: EdgeInsets.all(context.space.md),
              child: Row(
                children: [
                  Icon(Icons.error_outline, color: context.colors.error),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Text(
                      state.errorMessage!,
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.error,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        final result = state.pricingResult;
        if (result == null) return const SizedBox.shrink();

        if (!result.isServiceable) {
          return AppCard(
            backgroundColor: context.colors.errorSurface,
            child: Padding(
              padding: EdgeInsets.all(context.space.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.location_off, color: context.colors.error),
                      SizedBox(width: context.space.sm),
                      Text(
                        'Alamat di Luar Jangkauan',
                        style: context.typography.titleMedium.copyWith(
                          color: context.colors.error,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    result.rejectionReason ??
                        'Jarak alamat Anda melebihi batas maksimal pengantaran kurir outlet ini.',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.error,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        return AppCard(
          child: Padding(
            padding: EdgeInsets.all(context.space.md),
            child: ExpansionTile(
              tilePadding: EdgeInsets.zero,
              childrenPadding: EdgeInsets.only(top: context.space.sm),
              title: Row(
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
                        'Estimasi Ongkir',
                        style: context.typography.titleMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
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
                      Text(
                        '${result.distanceKm.toStringAsFixed(1)} km',
                        style: context.typography.labelSmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              children: [CourierFeeBreakdownWidget(result: result)],
            ),
          ),
        );
      },
    );
  }
}
