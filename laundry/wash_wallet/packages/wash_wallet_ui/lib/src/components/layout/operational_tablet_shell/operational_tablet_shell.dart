import 'package:flutter/material.dart';
import '../../../theme/responsive/app_breakpoints.dart';
import '../operational_sidebar/operational_sidebar.dart';
import '../operational_sidebar/models/sidebar_menu_section.dart';
import '../operational_sidebar/models/sidebar_menu_item.dart';
import '../operational_sidebar/models/sidebar_user_account.dart';
import '../operational_top_header/operational_top_header.dart';
import '../operational_top_header/models/top_header_action.dart';
import 'operational_shell_config.dart';

class OperationalTabletShell extends StatefulWidget {
  // Branding & Config
  final String appName;
  final String? appRoleLabel;
  final Widget? logoWidget;

  // Navigation
  final List<SidebarMenuSection> menuSections;
  final String? currentRouteId;
  final ValueChanged<SidebarMenuItem>? onMenuItemTap;

  // Top Header
  final String? searchHint;
  final ValueChanged<String>? onSearchSubmitted;
  final bool showClock;
  final bool showNotification;
  final int notificationCount;
  final VoidCallback? onNotificationTap;
  final bool showThemeToggle;
  final VoidCallback? onThemeToggle;

  // User
  final SidebarUserAccount? userAccount;

  // Content
  final Widget body;

  // Secondary panel (two-pane, optional)
  final Widget? secondaryBody;
  final bool showSecondaryBody;

  final OperationalShellConfig config;

  const OperationalTabletShell({
    super.key,
    required this.appName,
    this.appRoleLabel,
    this.logoWidget,
    required this.menuSections,
    this.currentRouteId,
    this.onMenuItemTap,
    this.searchHint,
    this.onSearchSubmitted,
    this.showClock = true,
    this.showNotification = true,
    this.notificationCount = 0,
    this.onNotificationTap,
    this.showThemeToggle = false,
    this.onThemeToggle,
    this.userAccount,
    required this.body,
    this.secondaryBody,
    this.showSecondaryBody = false,
    this.config = const OperationalShellConfig(),
  });

  @override
  State<OperationalTabletShell> createState() => _OperationalTabletShellState();
}

class _OperationalTabletShellState extends State<OperationalTabletShell> {
  bool _isSidebarCollapsed = false;

  void _toggleSidebar() {
    setState(() {
      _isSidebarCollapsed = !_isSidebarCollapsed;
    });
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    if (isCompact) {
      return Scaffold(
        body: widget.body,
      );
    }

    final isMedium = sizeClass == WindowSizeClass.medium;
    final collapsed = isMedium || _isSidebarCollapsed;

    return Scaffold(
      body: Row(
        children: [
          OperationalSidebar(
            appName: widget.appName,
            appRoleLabel: widget.appRoleLabel,
            logoWidget: widget.logoWidget,
            sections: widget.menuSections,
            currentRouteId: widget.currentRouteId,
            onItemTap: widget.onMenuItemTap,
            userAccount: widget.userAccount,
            collapsed: collapsed,
            expandedWidth: widget.config.expandedSidebarWidth,
            collapsedWidth: widget.config.collapsedSidebarWidth,
          ),
          const VerticalDivider(width: 1, thickness: 1),
          Expanded(
            child: Column(
              children: [
                OperationalTopHeader(
                  searchHint: widget.searchHint,
                  onSearchSubmitted: widget.onSearchSubmitted,
                  showClock: widget.showClock,
                  showNotification: widget.showNotification,
                  notificationCount: widget.notificationCount,
                  onNotificationTap: widget.onNotificationTap,
                  showThemeToggle: widget.showThemeToggle,
                  onThemeToggle: widget.onThemeToggle,
                  userName: widget.userAccount?.name,
                  userSubtitle: widget.userAccount?.subtitle,
                  userAvatarUrl: widget.userAccount?.avatarUrl,
                  userAvatarWidget: widget.userAccount?.avatarWidget,
                  extraActions: [
                    if (!isMedium)
                      TopHeaderAction(
                        icon: _isSidebarCollapsed ? Icons.menu : Icons.menu_open,
                        onTap: _toggleSidebar,
                        tooltip: _isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar',
                      ),
                  ],
                ),
                Expanded(
                  child: Row(
                    children: [
                      Expanded(child: widget.body),
                      if (widget.showSecondaryBody && widget.secondaryBody != null) ...[
                        const VerticalDivider(width: 1, thickness: 1),
                        SizedBox(
                          width: widget.config.secondaryBodyWidth,
                          child: widget.secondaryBody!,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
