import 'package:flutter/material.dart';

enum AppBottomBarType {
  navigation,
  action,
  mixed,
  compact;

  double get height {
    switch (this) {
      case AppBottomBarType.navigation:
        return 80.0;
      case AppBottomBarType.action:
      case AppBottomBarType.mixed:
        return 88.0;
      case AppBottomBarType.compact:
        return 64.0;
    }
  }
}

@immutable
class AppBottomBarItem {
  final IconData icon;
  final IconData? activeIcon;
  final String? label;
  final String? badge;
  final bool enabled;

  const AppBottomBarItem({
    required this.icon,
    this.activeIcon,
    this.label,
    this.badge,
    this.enabled = true,
  });

  IconData getIcon(bool isActive) =>
      (isActive && activeIcon != null) ? activeIcon! : icon;
}
