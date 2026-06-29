import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../utils/permission_checker.dart';

class ProductionNavigationConfig {
  static List<SidebarMenuSection> buildSections(AuthEmployee employee) {
    return [
      SidebarMenuSection(
        items: [
          SidebarMenuItem(
            id: 'home',
            label: 'Dashboard',
            icon: Icons.home_outlined,
            route: '/home',
          ),
        ],
      ),
      if (PermissionChecker.hasProductionAccess(employee))
        SidebarMenuSection(
          title: 'Produksi',
          items: [
            SidebarMenuItem(
              id: 'orders',
              label: 'Antrian Order',
              icon: Icons.receipt_long_outlined,
              route: '/orders',
            ),
          ],
        ),
      if (PermissionChecker.hasCourierAccess(employee))
        SidebarMenuSection(
          title: 'Kurir',
          items: [
            SidebarMenuItem(
              id: 'pickup-schedule',
              label: 'Jadwal Pickup',
              icon: Icons.local_shipping_outlined,
              route: '/pickup-schedule',
            ),
          ],
        ),
    ];
  }
}
