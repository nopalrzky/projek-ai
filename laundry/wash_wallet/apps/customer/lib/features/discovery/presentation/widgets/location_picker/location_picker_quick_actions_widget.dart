import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../../core/widgets/map_picker_bottom_sheet.dart';
import '../../bloc/location_picker_cubit.dart';
import '../../bloc/location_picker_state.dart';
import 'location_picker_action_tile_widget.dart';

class LocationPickerQuickActionsWidget extends StatelessWidget {
  const LocationPickerQuickActionsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationPickerCubit, LocationPickerState>(
      builder: (context, state) {
        return Column(
          children: [
            LocationPickerActionTileWidget(
              icon: Icons.my_location_rounded,
              label: 'Gunakan lokasimu saat ini',
              isLoading: state.isResolvingCurrentLocation,
              onTap: () =>
                  context.read<LocationPickerCubit>().useCurrentLocation(),
            ),
            SizedBox(height: context.space.xs),
            LocationPickerActionTileWidget(
              icon: Icons.map_outlined,
              label: 'Pilih lewat peta',
              onTap: () => _openMapPicker(context, state),
            ),
          ],
        );
      },
    );
  }

  Future<void> _openMapPicker(
    BuildContext context,
    LocationPickerState state,
  ) async {
    final activeAddress = state.activeAddress;
    final initialLocation =
        activeAddress?.latitude != null && activeAddress?.longitude != null
        ? LatLng(activeAddress!.latitude!, activeAddress.longitude!)
        : null;

    final result = await MapPickerBottomSheet.show(
      context,
      initialLocation: initialLocation,
    );
    if (result == null || !context.mounted) return;
    context.read<LocationPickerCubit>().selectMapResult(result: result);
  }
}
