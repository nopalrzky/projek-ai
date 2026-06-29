import 'package:flutter/material.dart';

class DrawerMenuItem {
  final String title;
  final IconData icon;
  final String route;
  final List<String>? requiredRoles;
  final int? badgeCount;

  const DrawerMenuItem({
    required this.title,
    required this.icon,
    required this.route,
    this.requiredRoles,
    this.badgeCount,
  });
}

class DrawerMenuSectionData {
  final String? title;
  final List<DrawerMenuItem> items;
  final bool showDivider;

  const DrawerMenuSectionData({
    this.title,
    required this.items,
    this.showDivider = false,
  });
}
