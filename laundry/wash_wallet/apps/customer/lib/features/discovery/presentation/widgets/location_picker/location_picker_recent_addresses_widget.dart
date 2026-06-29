import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../bloc/location_picker_cubit.dart';
import '../../bloc/location_picker_state.dart';
import 'location_picker_address_item_widget.dart';

class LocationPickerRecentAddressesWidget extends StatelessWidget {
  const LocationPickerRecentAddressesWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationPickerCubit, LocationPickerState>(
      builder: (context, state) {
        if (state.recentAddresses.isEmpty) return const SizedBox.shrink();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Alamat Terakhir',
              style: context.typography.labelLarge.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: context.space.sm),
            ...state.recentAddresses.map(
              (address) => LocationPickerAddressItemWidget(
                address: address,
                icon: Icons.history_rounded,
                onTap: () => context
                    .read<LocationPickerCubit>()
                    .selectRecentAddress(address: address),
              ),
            ),
          ],
        );
      },
    );
  }
}
