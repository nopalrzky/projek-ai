import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../utils/permission_checker.dart';

class ProductionNavigationConfig {
  static List<SidebarMenuSection> buildSections(AuthEmployee employee) {
    return [
      // Area Utama
      SidebarMenuSection(
        items: [
          SidebarMenuItem(
            id: 'home',
            label: 'Dashboard',
            icon: Icons.home_outlined,
            selectedIcon: Icons.home,
            route: '/home',
          ),
        ],
      ),
      // Section Produksi (permission-gated)
      if (PermissionChecker.hasProductionAccess(employee))
        SidebarMenuSection(
          title: 'Produksi',
          items: [
            SidebarMenuItem(
              id: 'orders',
              label: 'Antrian Order',
              icon: Icons.receipt_long_outlined,
              selectedIcon: Icons.receipt_long,
              route: '/orders',
            ),
          ],
        ),
      // Section Kurir (permission-gated)
      if (PermissionChecker.hasCourierAccess(employee))
        SidebarMenuSection(
          title: 'Kurir',
          items: [
            SidebarMenuItem(
              id: 'pickup-schedule',
              label: 'Jadwal Pickup',
              icon: Icons.local_shipping_outlined,
              selectedIcon: Icons.local_shipping,
              route: '/pickup-schedule',
            ),
          ],
        ),
      SidebarMenuSection(
        title: 'Lainnya',
        items: [
          SidebarMenuItem(
            id: 'profile',
            label: 'Profil',
            icon: Icons.person_outline,
            selectedIcon: Icons.person,
            route: '/profile',
          ),
        ],
      ),
    ];
  }
}
