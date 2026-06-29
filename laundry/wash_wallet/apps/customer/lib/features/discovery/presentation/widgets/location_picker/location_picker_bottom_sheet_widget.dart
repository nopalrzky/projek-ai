import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../customer_address/domain/entities/customer_address.dart';
import '../../bloc/location_picker_cubit.dart';
import '../../bloc/location_picker_state.dart';
import 'location_picker_confirm_button_widget.dart';
import 'location_picker_favorite_addresses_widget.dart';
import 'location_picker_quick_actions_widget.dart';
import 'location_picker_recent_addresses_widget.dart';
import 'location_picker_search_input_widget.dart';
import 'location_picker_search_results_widget.dart';

class LocationPickerBottomSheetWidget extends StatelessWidget {
  const LocationPickerBottomSheetWidget({super.key});

  static Future<CustomerAddress?> show(BuildContext context) {
    final cubit = context.read<LocationPickerCubit>();
    cubit.resetSelection();

    return AppBottomSheet.show<CustomerAddress>(
      context,
      title: 'Pilih Lokasi',
      child: BlocProvider.value(
        value: cubit,
        child: const LocationPickerBottomSheetWidget(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationPickerCubit, LocationPickerState>(
      builder: (context, state) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (state.errorMessage != null) ...[
              _ErrorBanner(message: state.errorMessage!),
              SizedBox(height: context.space.md),
            ],
            const LocationPickerSearchInputWidget(),
            SizedBox(height: context.space.md),
            const LocationPickerQuickActionsWidget(),
            if (state.searchKeyword.trim().isNotEmpty) ...[
              SizedBox(height: context.space.md),
              const AppDivider.soft(),
              SizedBox(height: context.space.md),
              const LocationPickerSearchResultsWidget(),
            ],
            if (state.favoriteAddresses.isNotEmpty) ...[
              SizedBox(height: context.space.md),
              const AppDivider.soft(),
              SizedBox(height: context.space.md),
              const LocationPickerFavoriteAddressesWidget(),
            ],
            if (state.recentAddresses.isNotEmpty) ...[
              SizedBox(height: context.space.md),
              const AppDivider.soft(),
              SizedBox(height: context.space.md),
              const LocationPickerRecentAddressesWidget(),
            ],
            SizedBox(height: context.space.md),
            const LocationPickerConfirmButtonWidget(),
          ],
        );
      },
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;

  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.error.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.error.withValues(alpha: 0.18)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.error_outline_rounded, color: context.colors.error),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Text(
              message,
              style: context.typography.bodySmall.copyWith(
                color: context.colors.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
