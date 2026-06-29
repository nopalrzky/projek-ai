import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/outlet_cubit.dart';
import '../bloc/outlet_state.dart';

class CategoryFilterBar extends StatelessWidget {
  final void Function(int?) onCategorySelected;

  const CategoryFilterBar({super.key, required this.onCategorySelected});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OutletCubit, OutletState>(
      builder: (context, state) {
        if (state is! OutletDetailLoaded) return const SizedBox.shrink();

        final categories = state.outlet.categories ?? [];
        final selectedId = state.selectedCategoryId;

        return Container(
          color: context.colors.surface,
          padding: EdgeInsets.symmetric(vertical: context.space.sm),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: context.space.lg),
            child: Row(
              children: [
                AppChip.primary(
                  label: 'Semua',
                  selected: selectedId == null,
                  onTap: () {
                    context.read<OutletCubit>().selectCategory(null);
                    onCategorySelected(null);
                  },
                ),
                SizedBox(width: context.space.sm),
                ...categories.map(
                  (category) => Padding(
                    padding: EdgeInsets.only(right: context.space.sm),
                    child: AppChip.primary(
                      label: category.name,
                      selected: selectedId == category.id,
                      onTap: () {
                        context.read<OutletCubit>().selectCategory(category.id);
                        onCategorySelected(category.id);
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
