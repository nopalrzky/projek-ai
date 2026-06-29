import 'sidebar_menu_item.dart';

/// Represents a grouped section of menu items in the Operational Sidebar.
class SidebarMenuSection {
  /// Optional title for this section. If null, the section is rendered without a header.
  final String? title;
  
  /// List of items in this section.
  final List<SidebarMenuItem> items;
  
  /// Whether this section can be collapsed/expanded.
  final bool collapsible;
  
  /// If [collapsible] is true, determines whether it is expanded by default.
  final bool initiallyExpanded;

  const SidebarMenuSection({
    this.title,
    required this.items,
    this.collapsible = false,
    this.initiallyExpanded = true,
  });
}
