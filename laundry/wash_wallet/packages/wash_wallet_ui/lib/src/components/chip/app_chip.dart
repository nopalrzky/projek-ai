import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_chip_variant.dart';

class AppChip extends StatelessWidget {
  final String label;
  final AppChipVariant variant;
  final bool selected;
  final VoidCallback? onTap;
  final Widget? leading;
  final Widget? trailing;

  const AppChip({
    super.key,
    required this.label,
    this.variant = AppChipVariant.neutral,
    this.selected = false,
    this.onTap,
    this.leading,
    this.trailing,
  });

  const AppChip.primary({
    super.key,
    required this.label,
    this.selected = false,
    this.onTap,
    this.leading,
    this.trailing,
  }) : variant = AppChipVariant.primary;

  const AppChip.success({
    super.key,
    required this.label,
    this.selected = false,
    this.onTap,
    this.leading,
    this.trailing,
  }) : variant = AppChipVariant.success;

  const AppChip.warning({
    super.key,
    required this.label,
    this.selected = false,
    this.onTap,
    this.leading,
    this.trailing,
  }) : variant = AppChipVariant.warning;

  const AppChip.danger({
    super.key,
    required this.label,
    this.selected = false,
    this.onTap,
    this.leading,
    this.trailing,
  }) : variant = AppChipVariant.danger;

  @override
  Widget build(BuildContext context) {
    final colors = _getColors(context);
    final isInteractive = onTap != null;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isInteractive ? onTap : null,
        borderRadius: BorderRadius.circular(context.radius.full),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          height: 32,
          padding: EdgeInsets.symmetric(
            horizontal: context.space.md,
            vertical: context.space.xs,
          ),
          decoration: BoxDecoration(
            color: colors.backgroundColor,
            border: Border.all(
              color: colors.borderColor,
              width: selected ? 1.5 : 1,
            ),
            borderRadius: BorderRadius.circular(context.radius.full),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (leading != null) ...[
                leading!,
                SizedBox(width: context.space.xs),
              ],
              Text(
                label,
                style: context.typography.labelSmall.copyWith(
                  color: colors.textColor,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
              if (trailing != null) ...[
                SizedBox(width: context.space.xs),
                trailing!,
              ],
            ],
          ),
        ),
      ),
    );
  }

  _ChipColors _getColors(BuildContext context) {
    final colors = context.colors;

    switch (variant) {
      case AppChipVariant.neutral:
        return _ChipColors(
          backgroundColor: selected
              ? colors.primarySurface
              : colors.surfaceVariant,
          borderColor: selected ? colors.primary : colors.border,
          textColor: selected ? colors.primary : colors.textSecondary,
        );

      case AppChipVariant.primary:
        return _ChipColors(
          backgroundColor: selected
              ? colors.primarySurface
              : colors.surfaceVariant,
          borderColor: selected
              ? colors.primary
              : colors.primary.withValues(alpha: 0.3),
          textColor: colors.primary,
        );

      case AppChipVariant.success:
        return _ChipColors(
          backgroundColor: selected
              ? colors.successSurface
              : colors.surfaceVariant,
          borderColor: selected
              ? colors.success
              : colors.success.withValues(alpha: 0.3),
          textColor: colors.success,
        );

      case AppChipVariant.warning:
        return _ChipColors(
          backgroundColor: selected
              ? colors.warningSurface
              : colors.surfaceVariant,
          borderColor: selected
              ? colors.warning
              : colors.warning.withValues(alpha: 0.3),
          textColor: colors.warning,
        );

      case AppChipVariant.danger:
        return _ChipColors(
          backgroundColor: selected
              ? colors.errorSurface
              : colors.surfaceVariant,
          borderColor: selected
              ? colors.error
              : colors.error.withValues(alpha: 0.3),
          textColor: colors.error,
        );
    }
  }
}

class _ChipColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color textColor;

  const _ChipColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.textColor,
  });
}
