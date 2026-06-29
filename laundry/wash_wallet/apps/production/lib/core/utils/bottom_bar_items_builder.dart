import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'permission_checker.dart';

class BottomBarItemsBuilder {
  static List<AppBottomBarItem> buildItems(AuthEmployee employee) {
    return [
      const AppBottomBarItem(
        icon: Icons.home_outlined,
        activeIcon: Icons.home,
        label: 'Home',
      ),
      if (PermissionChecker.hasProductionAccess(employee))
        const AppBottomBarItem(
          icon: Icons.receipt_long_outlined,
          activeIcon: Icons.receipt_long,
          label: 'Produksi',
        ),
      if (PermissionChecker.hasCourierAccess(employee))
        const AppBottomBarItem(
          icon: Icons.local_shipping_outlined,
          activeIcon: Icons.local_shipping,
          label: 'Kurir',
        ),
      const AppBottomBarItem(
        icon: Icons.person_outline,
        activeIcon: Icons.person,
        label: 'Profil',
      ),
    ];
  }

  static Map<int, String> buildRouteMap(AuthEmployee employee) {
    final map = <int, String>{};
    var index = 0;

    map[index++] = '/home';

    if (PermissionChecker.hasProductionAccess(employee)) {
      map[index++] = '/orders';
    }

    if (PermissionChecker.hasCourierAccess(employee)) {
      map[index++] = '/pickup-schedule';
    }

    return map;
  }
}
