import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';
import 'models/sidebar_menu_section.dart';
import 'models/sidebar_menu_item.dart';
import 'models/sidebar_user_account.dart';
import 'operational_sidebar_header.dart';
import 'operational_sidebar_section.dart';
import 'operational_sidebar_footer.dart';

class OperationalSidebar extends StatefulWidget {
  final String appName;
  final String? appRoleLabel;
  final Widget? logoWidget;
  final List<SidebarMenuSection> sections;
  final String? currentRouteId;
  final ValueChanged<SidebarMenuItem>? onItemTap;
  final SidebarUserAccount? userAccount;
  final bool collapsed;
  final ValueChanged<bool>? onCollapsedChanged;
  final double expandedWidth;
  final double collapsedWidth;

  const OperationalSidebar({
    super.key,
    required this.appName,
    this.appRoleLabel,
    this.logoWidget,
    required this.sections,
    this.currentRouteId,
    this.onItemTap,
    this.userAccount,
    this.collapsed = false,
    this.onCollapsedChanged,
    this.expandedWidth = 268.0,
    this.collapsedWidth = 80.0,
  });

  @override
  State<OperationalSidebar> createState() => _OperationalSidebarState();
}

class _OperationalSidebarState extends State<OperationalSidebar> {
  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeInOut,
      width: widget.collapsed ? widget.collapsedWidth : widget.expandedWidth,
      color: context.colors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OperationalSidebarHeader(
            appName: widget.appName,
            appRoleLabel: widget.appRoleLabel,
            logoWidget: widget.logoWidget,
            collapsed: widget.collapsed,
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              itemCount: widget.sections.length,
              itemBuilder: (context, index) {
                return OperationalSidebarSection(
                  section: widget.sections[index],
                  currentRouteId: widget.currentRouteId,
                  onItemTap: widget.onItemTap,
                  collapsed: widget.collapsed,
                );
              },
            ),
          ),
          if (widget.userAccount != null) ...[
            const Divider(height: 1),
            OperationalSidebarFooter(
              userAccount: widget.userAccount!,
              collapsed: widget.collapsed,
            ),
          ],
        ],
      ),
    );
  }
}
