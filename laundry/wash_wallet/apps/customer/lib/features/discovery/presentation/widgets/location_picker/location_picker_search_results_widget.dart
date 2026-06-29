import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../bloc/location_picker_cubit.dart';
import '../../bloc/location_picker_state.dart';

class LocationPickerSearchResultsWidget extends StatelessWidget {
  const LocationPickerSearchResultsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationPickerCubit, LocationPickerState>(
      builder: (context, state) {
        if (state.searchKeyword.trim().isEmpty) {
          return const SizedBox.shrink();
        }

        if (state.isSearching) {
          return Padding(
            padding: EdgeInsets.symmetric(vertical: context.space.lg),
            child: const AppLoadingIndicator(
              message: 'Mencari alamat...',
              size: AppEmptyStateSize.sm,
            ),
          );
        }

        if (state.searchResults.isEmpty) {
          return const AppEmptyState.search(
            title: 'Alamat tidak ditemukan',
            description: 'Coba kata kunci lain atau pilih lewat peta.',
            size: AppEmptyStateSize.sm,
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hasil pencarian',
              style: context.typography.labelLarge.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: context.space.sm),
            ...state.searchResults.map(
              (result) => AppListTile.compact(
                title:
                    result['structured_formatting']?['main_text']?.toString() ??
                    result['description']?.toString() ??
                    'Alamat',
                subtitle: result['structured_formatting']?['secondary_text']
                    ?.toString(),
                leading: Icon(
                  Icons.location_on_outlined,
                  color: context.colors.primary,
                ),
                trailing: Icon(
                  Icons.chevron_right_rounded,
                  color: context.colors.textTertiary,
                ),
                onTap: () => context
                    .read<LocationPickerCubit>()
                    .selectSearchResult(result: result),
              ),
            ),
          ],
        );
      },
    );
  }
}
