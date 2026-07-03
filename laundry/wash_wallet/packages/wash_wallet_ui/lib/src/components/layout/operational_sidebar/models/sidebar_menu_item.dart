import 'package:flutter/material.dart';

/// Represents a single menu item in the Operational Sidebar.
class SidebarMenuItem {
  /// Unique identifier for this menu item.
  final String id;

  /// The text label to display.
  final String label;

  /// The icon to display when this item is not selected.
  final IconData icon;

  /// The icon to display when this item is selected. If null, [icon] is used.
  final IconData? selectedIcon;

  /// Optional route associated with this item.
  final String? route;

  /// Optional callback to determine if this item should be visible.
  /// Used for permission-aware menu rendering. If null, it is always visible.
  final bool Function()? isVisible;

  /// Optional callback for custom tap action. Overrides route navigation if provided.
  final VoidCallback? onTap;

  /// Optional badge count to display next to the label.
  final int? badgeCount;

  const SidebarMenuItem({
    required this.id,
    required this.label,
    required this.icon,
    this.selectedIcon,
    this.route,
    this.isVisible,
    this.onTap,
    this.badgeCount,
  });
}
