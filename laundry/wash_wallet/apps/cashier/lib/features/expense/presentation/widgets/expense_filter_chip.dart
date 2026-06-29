import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ExpenseFilterChip extends StatelessWidget {
  final String? selectedStatus;
  final Function(String?) onStatusChanged;

  const ExpenseFilterChip({
    super.key,
    required this.selectedStatus,
    required this.onStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      padding: EdgeInsets.symmetric(horizontal: context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          bottom: BorderSide(
            color: context.colors.border.withValues(alpha: 0.1),
            width: 1,
          ),
        ),
      ),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _buildChip(
            context: context,
            label: 'Semua',
            isSelected: selectedStatus == null,
            onTap: () => onStatusChanged(null),
          ),
          SizedBox(width: context.space.sm),
          _buildChip(
            context: context,
            label: 'Menunggu',
            icon: Icons.pending_rounded,
            color: context.colors.warning,
            isSelected: selectedStatus == 'pending',
            onTap: () => onStatusChanged('pending'),
          ),
          SizedBox(width: context.space.sm),
          _buildChip(
            context: context,
            label: 'Disetujui',
            icon: Icons.check_circle_rounded,
            color: context.colors.success,
            isSelected: selectedStatus == 'approved',
            onTap: () => onStatusChanged('approved'),
          ),
          SizedBox(width: context.space.sm),
          _buildChip(
            context: context,
            label: 'Ditolak',
            icon: Icons.cancel_rounded,
            color: context.colors.error,
            isSelected: selectedStatus == 'rejected',
            onTap: () => onStatusChanged('rejected'),
          ),
        ],
      ),
    );
  }

  Widget _buildChip({
    required BuildContext context,
    required String label,
    IconData? icon,
    Color? color,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: 16,
              color: isSelected
                  ? Colors.white
                  : color ?? context.colors.textSecondary,
            ),
            SizedBox(width: context.space.xs),
          ],
          Text(label),
        ],
      ),
      selected: isSelected,
      onSelected: (_) => onTap(),
      backgroundColor: context.colors.surfaceVariant,
      selectedColor: color ?? context.colors.primary,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : context.colors.textPrimary,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
      ),
      showCheckmark: false,
      padding: EdgeInsets.symmetric(
        horizontal: context.space.sm,
        vertical: context.space.xs,
      ),
    );
  }
}

