import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/location_picker_cubit.dart';
import '../bloc/location_picker_state.dart';

class DiscoveryAddressSelectorWidget extends StatelessWidget {
  final VoidCallback onTap;

  const DiscoveryAddressSelectorWidget({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationPickerCubit, LocationPickerState>(
      builder: (context, state) {
        return Material(
          color: context.colors.neutralMuted.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(context.radius.lg),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(context.radius.lg),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: context.space.md,
                vertical: context.space.sm,
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.location_on_rounded,
                    color: context.colors.primary,
                    size: 20,
                  ),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Alamat Pengiriman',
                          style: context.typography.caption.copyWith(
                            color: context.colors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: context.space.xxs),
                        Text(
                          _addressLabel(state),
                          style: context.typography.labelMedium.copyWith(
                            color: state.activeAddress == null
                                ? context.colors.textTertiary
                                : context.colors.textPrimary,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: context.space.xs),
                  Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color: context.colors.textSecondary,
                    size: 20,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String _addressLabel(LocationPickerState state) {
    if (state.status == LocationPickerStatus.loading) return 'Memuat alamat...';

    final address = state.activeAddress;
    if (address == null) return 'Alamat belum dipilih';

    if (address.label.trim().isNotEmpty && address.street.trim().isNotEmpty) {
      return '${address.label} - ${address.street}';
    }

    if (address.label.trim().isNotEmpty) return address.label;
    if (address.street.trim().isNotEmpty) return address.street;
    return 'Alamat belum dipilih';
  }
}
