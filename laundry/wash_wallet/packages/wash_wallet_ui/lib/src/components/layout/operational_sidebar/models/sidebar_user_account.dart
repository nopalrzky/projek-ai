import 'package:flutter/material.dart';

/// Represents an action available for a user account in the sidebar.
class SidebarUserAction {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const SidebarUserAction({
    required this.label,
    required this.icon,
    required this.onTap,
  });
}

/// Represents the user account details displayed in the footer of the Operational Sidebar.
class SidebarUserAccount {
  /// The user's primary name.
  final String name;

  /// An optional subtitle (e.g., email, username, or role label).
  final String? subtitle;

  /// An optional URL for the user's avatar image.
  final String? avatarUrl;

  /// An optional custom widget for the avatar (fallback if avatarUrl is null or fails).
  final Widget? avatarWidget;

  /// A list of actions available for this user (e.g., Profile, Switch Employee, Logout).
  final List<SidebarUserAction> actions;

  const SidebarUserAccount({
    required this.name,
    this.subtitle,
    this.avatarUrl,
    this.avatarWidget,
    this.actions = const [],
  });
}
