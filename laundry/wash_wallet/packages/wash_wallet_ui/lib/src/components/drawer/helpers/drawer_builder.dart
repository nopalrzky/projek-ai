import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../app_drawer.dart';
import '../app_drawer_header.dart';
import '../app_drawer_footer.dart';
import '../app_drawer_menu_section.dart';
import '../app_drawer_menu_item.dart';
import '../variants/app_drawer_variant.dart';
import '../models/drawer_menu_item_model.dart';
import '../../badge/app_badge.dart';
import '../../badge/app_badge_size.dart';

class DrawerBuilder {
  static AppDrawer build({
    required BuildContext context,
    required List<DrawerMenuSectionData> menuData,
    String? currentRoute,
    String? userName,
    String? userRole,
    String? userAvatar,
    VoidCallback? onProfileTap,
    VoidCallback? onLogout,
    String? version,
    AppDrawerVariant variant = AppDrawerVariant.standard,
  }) {
    final actualCurrentRoute =
        currentRoute ?? GoRouter.of(context).state.matchedLocation;

    return AppDrawer(
      variant: variant,
      header: userName != null
          ? AppDrawerHeader.user(
              userName: userName,
              userRole: userRole,
              userAvatar: userAvatar,
              onTap: onProfileTap,
              variant: variant,
            )
          : null,
      sections: menuData.map((sectionData) {
        return AppDrawerMenuSection(
          title: sectionData.title,
          showDivider: sectionData.showDivider,
          variant: variant,
          items: sectionData.items.map((itemData) {
            return AppDrawerMenuItem(
              title: itemData.title,
              icon: itemData.icon,
              route: itemData.route,
              isActive:
                  actualCurrentRoute == itemData.route ||
                  actualCurrentRoute.startsWith('${itemData.route}/'),
              badge: itemData.badgeCount != null && itemData.badgeCount! > 0
                  ? AppBadge.primary(
                      label: itemData.badgeCount!.toString(),
                      size: AppBadgeSize.sm,
                    )
                  : null,
              variant: variant,
              onTap: () {
                context.go(itemData.route);
                Navigator.pop(context);
              },
            );
          }).toList(),
        );
      }).toList(),
      footer: AppDrawerFooter(
        version: version,
        onLogout: onLogout,
        variant: variant,
      ),
    );
  }
}
