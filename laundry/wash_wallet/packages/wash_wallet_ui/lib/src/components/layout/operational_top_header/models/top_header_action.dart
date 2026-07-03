import 'package:flutter/material.dart';

/// Represents an action button in the Operational Top Header.
class TopHeaderAction {
  /// The icon to display.
  final IconData icon;

  /// Optional tooltip text.
  final String? tooltip;

  /// The action to perform when tapped.
  final VoidCallback onTap;

  /// Optional badge widget to overlay on the icon (e.g., for notifications).
  final Widget? badge;

  const TopHeaderAction({
    required this.icon,
    this.tooltip,
    required this.onTap,
    this.badge,
  });
}
