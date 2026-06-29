import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class PickupOutletFilter extends StatelessWidget {
  final List<OutletAccess> outlets;
  final int? selectedOutletId;
  final ValueChanged<int?> onOutletSelected;

  const PickupOutletFilter({
    super.key,
    required this.outlets,
    required this.selectedOutletId,
    required this.onOutletSelected,
  });

  @override
  Widget build(BuildContext context) {
    if (outlets.length <= 1) return const SizedBox.shrink();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: EdgeInsets.symmetric(horizontal: context.space.lg),
      child: Row(
        children: [
          _buildChip(
            context,
            label: 'Semua Outlet',
            isSelected: selectedOutletId == null,
            onTap: () => onOutletSelected(null),
          ),
          ...outlets.map(
            (outlet) => Padding(
              padding: EdgeInsets.only(left: context.space.sm),
              child: _buildChip(
                context,
                label: outlet.outletName,
                isSelected: selectedOutletId == outlet.outletId,
                onTap: () => onOutletSelected(outlet.outletId),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(
    BuildContext context, {
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: context.space.md,
          vertical: context.space.sm,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? context.colors.primary
              : context.colors.surface,
          borderRadius: BorderRadius.circular(context.radius.full),
          border: Border.all(
            color: isSelected
                ? context.colors.primary
                : context.colors.border,
          ),
        ),
        child: Text(
          label,
          style: context.typography.labelMedium.copyWith(
            color: isSelected
                ? context.colors.textOnPrimary
                : context.colors.textSecondary,
          ),
        ),
      ),
    );
  }
}
