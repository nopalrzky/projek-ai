import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../customer_address/domain/entities/customer_address.dart';
import '../../bloc/location_picker_cubit.dart';
import '../../bloc/location_picker_state.dart';

class LocationPickerConfirmButtonWidget extends StatelessWidget {
  const LocationPickerConfirmButtonWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationPickerCubit, LocationPickerState>(
      builder: (context, state) {
        final selectedAddress = state.selectedCandidate;
        if (selectedAddress == null) return const SizedBox.shrink();

        final canConfirm =
            selectedAddress.latitude != null &&
            selectedAddress.longitude != null;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const AppDivider.soft(),
            SizedBox(height: context.space.md),
            Text(
              'Alamat dipilih',
              style: context.typography.labelLarge.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: context.space.sm),
            _SelectedAddressSummary(address: selectedAddress),
            SizedBox(height: context.space.md),
            AppButton.primary(
              label: 'Konfirmasi',
              isFullWidth: true,
              isLoading: state.status == LocationPickerStatus.confirming,
              onPressed: canConfirm
                  ? () async {
                      final address = await context
                          .read<LocationPickerCubit>()
                          .confirmAddress();
                      if (address != null && context.mounted) {
                        Navigator.of(context).pop(address);
                      }
                    }
                  : null,
            ),
          ],
        );
      },
    );
  }
}

class _SelectedAddressSummary extends StatelessWidget {
  final CustomerAddress address;

  const _SelectedAddressSummary({required this.address});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(
          color: context.colors.primary.withValues(alpha: 0.18),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.location_on_rounded, color: context.colors.primary),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  address.label.trim().isEmpty ? 'Alamat' : address.label,
                  style: context.typography.labelMedium.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: context.space.xs),
                Text(
                  address.street,
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
