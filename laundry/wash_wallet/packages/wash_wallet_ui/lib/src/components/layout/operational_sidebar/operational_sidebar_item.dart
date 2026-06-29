import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';
import 'models/sidebar_menu_item.dart';

class OperationalSidebarItem extends StatelessWidget {
  final SidebarMenuItem item;
  final bool isSelected;
  final bool collapsed;
  final VoidCallback onTap;

  const OperationalSidebarItem({
    super.key,
    required this.item,
    required this.isSelected,
    required this.collapsed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (item.isVisible != null && !item.isVisible!()) {
      return const SizedBox.shrink();
    }

    final iconColor = isSelected ? context.colors.primary : context.colors.onSurfaceVariant;
    final textColor = isSelected ? context.colors.primary : context.colors.onSurface;
    final bgColor = isSelected ? context.colors.primaryContainer : Colors.transparent;
    final icon = isSelected ? (item.selectedIcon ?? item.icon) : item.icon;

    Widget child = InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(context.radius.md),
      child: Container(
        height: 48,
        padding: EdgeInsets.symmetric(horizontal: collapsed ? 0 : 16.0),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
        child: Row(
          mainAxisAlignment: collapsed ? MainAxisAlignment.center : MainAxisAlignment.start,
          children: [
            Icon(icon, color: iconColor, size: 24),
            if (!collapsed) ...[
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  item.label,
                  style: context.typography.bodyMedium.copyWith(
                    color: textColor,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (item.badgeCount != null && item.badgeCount! > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: context.colors.error,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    item.badgeCount! > 99 ? '99+' : item.badgeCount.toString(),
                    style: context.typography.labelSmall.copyWith(
                      color: context.colors.onError,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ],
        ),
      ),
    );

    if (collapsed) {
      child = Tooltip(
        message: item.label,
        preferBelow: false,
        child: child,
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
      child: child,
    );
  }
}
