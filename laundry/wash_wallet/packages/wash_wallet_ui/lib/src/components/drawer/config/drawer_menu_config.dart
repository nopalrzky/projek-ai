import 'package:flutter/material.dart';
import '../models/drawer_menu_item_model.dart';

class DrawerMenuConfig {
  static List<DrawerMenuSectionData> getMenuSections() {
    return [
      DrawerMenuSectionData(
        title: 'Transaksi',
        items: [
          const DrawerMenuItem(
            title: 'Dashboard',
            icon: Icons.dashboard_outlined,
            route: '/dashboard',
          ),
          const DrawerMenuItem(
            title: 'Pesanan',
            icon: Icons.receipt_long_outlined,
            route: '/orders',
          ),
        ],
      ),
      DrawerMenuSectionData(
        title: 'Data Master',
        showDivider: true,
        items: [
          const DrawerMenuItem(
            title: 'Pelanggan',
            icon: Icons.people_outline,
            route: '/customers',
          ),
          const DrawerMenuItem(
            title: 'Kategori',
            icon: Icons.local_laundry_service_outlined,
            route: '/categories',
          ),
          const DrawerMenuItem(
            title: 'Layanan',
            icon: Icons.design_services_outlined,
            route: '/laundry-services',
          ),
          const DrawerMenuItem(
            title: 'Paket Deposit',
            icon: Icons.inventory_2_outlined,
            route: '/service-packages',
          ),
          const DrawerMenuItem(
            title: 'Membership',
            icon: Icons.card_membership_outlined,
            route: '/membership-plans',
          ),
        ],
      ),
      DrawerMenuSectionData(
        title: 'Pengaturan',
        showDivider: true,
        items: [
          const DrawerMenuItem(
            title: 'Pengaturan',
            icon: Icons.settings_outlined,
            route: '/settings',
          ),
        ],
      ),
    ];
  }

  static List<DrawerMenuSectionData> filterByRole(
    List<DrawerMenuSectionData> sections,
    String userRole,
  ) {
    return sections
        .map((section) {
          final filteredItems = section.items.where((item) {
            if (item.requiredRoles == null || item.requiredRoles!.isEmpty) {
              return true;
            }
            return item.requiredRoles!.contains(userRole);
          }).toList();

          return DrawerMenuSectionData(
            title: section.title,
            items: filteredItems,
            showDivider: section.showDivider,
          );
        })
        .where((section) => section.items.isNotEmpty)
        .toList();
  }
}
