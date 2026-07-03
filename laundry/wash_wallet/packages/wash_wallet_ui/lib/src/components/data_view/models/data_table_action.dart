import 'package:flutter/material.dart';

/// Defines an inline row action for the [AppDataTable] (e.g., View, Edit, Delete).
class DataTableRowAction<T> {
  /// The icon to display.
  final IconData icon;

  /// Required tooltip text.
  final String tooltip;

  /// Optional semantic color for the icon.
  final Color? color;

  /// Callback to determine if this action should be visible for the given row.
  /// If null, the action is always visible.
  final bool Function(T row)? isVisible;

  /// Callback to determine if this action should be enabled for the given row.
  /// If null, the action is always enabled.
  final bool Function(T row)? isEnabled;

  /// Action to perform when tapped.
  final void Function(T row) onTap;

  const DataTableRowAction({
    required this.icon,
    required this.tooltip,
    required this.onTap,
    this.color,
    this.isVisible,
    this.isEnabled,
  });
}
