import 'package:flutter/material.dart';

enum StatusChipSize { small, medium }

enum StatusChipVariant { filled, outlined, subtle }

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
    this.icon,
    this.color,
    this.onTap,
    this.size = StatusChipSize.medium,
    this.variant = StatusChipVariant.subtle,
  });

  final String label;
  final IconData? icon;
  final Color? color;
  final VoidCallback? onTap;
  final StatusChipSize size;
  final StatusChipVariant variant;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final chipColor = color ?? theme.colorScheme.surfaceContainerHighest;

    final bool isDark =
        ThemeData.estimateBrightnessForColor(chipColor) == Brightness.dark;

    // Determine content color based on variant
    Color contentColor;
    if (variant == StatusChipVariant.filled) {
      contentColor = isDark ? Colors.white : Colors.black;
    } else {
      contentColor = color != null
          ? chipColor
          : theme.colorScheme.onSurfaceVariant;
    }

    // Determine background color and border based on variant
    Color backgroundColor;
    Border? border;

    switch (variant) {
      case StatusChipVariant.filled:
        backgroundColor = chipColor;
        break;
      case StatusChipVariant.outlined:
        backgroundColor = Colors.transparent;
        border = Border.all(color: chipColor);
        break;
      case StatusChipVariant.subtle:
        backgroundColor = chipColor.withValues(alpha: 0.2);
        border = Border.all(color: chipColor.withValues(alpha: 0.5));
        break;
    }

    // Determine padding based on size
    final padding = size == StatusChipSize.small
        ? const EdgeInsets.symmetric(horizontal: 6, vertical: 3)
        : const EdgeInsets.symmetric(horizontal: 8, vertical: 4);

    final iconSize = size == StatusChipSize.small ? 12.0 : 14.0;

    Widget child = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[
          Icon(icon, size: iconSize, color: contentColor),
          const SizedBox(width: 4),
        ],
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(color: contentColor),
        ),
      ],
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          padding: padding,
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(16),
            border: border,
          ),
          child: child,
        ),
      );
    }

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: border,
      ),
      child: child,
    );
  }
}
