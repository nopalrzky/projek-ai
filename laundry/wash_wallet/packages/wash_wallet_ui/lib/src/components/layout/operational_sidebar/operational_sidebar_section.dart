import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';
import 'models/sidebar_menu_section.dart';
import 'operational_sidebar_item.dart';
import 'models/sidebar_menu_item.dart';

class OperationalSidebarSection extends StatelessWidget {
  final SidebarMenuSection section;
  final String? currentRouteId;
  final ValueChanged<SidebarMenuItem>? onItemTap;
  final bool collapsed;

  const OperationalSidebarSection({
    super.key,
    required this.section,
    this.currentRouteId,
    this.onItemTap,
    required this.collapsed,
  });

  @override
  Widget build(BuildContext context) {
    final visibleItems = section.items.where((item) => item.isVisible == null || item.isVisible!()).toList();
    if (visibleItems.isEmpty) return const SizedBox.shrink();

    Widget itemsWidget = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: visibleItems.map((item) {
        return OperationalSidebarItem(
          item: item,
          isSelected: currentRouteId == item.id,
          collapsed: collapsed,
          onTap: () {
            if (item.onTap != null) {
              item.onTap!();
            } else {
              onItemTap?.call(item);
            }
          },
        );
      }).toList(),
    );

    if (section.title != null && !collapsed) {
      if (section.collapsible) {
        return Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            initiallyExpanded: section.initiallyExpanded,
            tilePadding: const EdgeInsets.symmetric(horizontal: 24.0),
            title: Text(
              section.title!,
              style: context.typography.labelMedium.copyWith(
                color: context.colors.onSurfaceVariant,
                fontWeight: FontWeight.bold,
              ),
            ),
            children: [itemsWidget],
          ),
        );
      } else {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(28.0, 16.0, 24.0, 8.0),
              child: Text(
                section.title!,
                style: context.typography.labelMedium.copyWith(
                  color: context.colors.onSurfaceVariant,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            itemsWidget,
          ],
        );
      }
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (section.title != null && collapsed) const SizedBox(height: 16),
        itemsWidget,
      ],
    );
  }
}
