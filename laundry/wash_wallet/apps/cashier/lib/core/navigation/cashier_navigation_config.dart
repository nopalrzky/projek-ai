import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CashierNavigationConfig {
  static List<SidebarMenuSection> buildSections() {
    return [
      SidebarMenuSection(
        items: [
          SidebarMenuItem(
            id: 'home',
            label: 'Home',
            icon: Icons.home_outlined,
            selectedIcon: Icons.home,
            route: '/home',
          ),
          SidebarMenuItem(
            id: 'finances',
            label: 'Dana',
            icon: Icons.account_balance_wallet_outlined,
            selectedIcon: Icons.account_balance_wallet,
            route: '/finances',
          ),
          SidebarMenuItem(
            id: 'orders',
            label: 'Transaksi',
            icon: Icons.receipt_long_outlined,
            selectedIcon: Icons.receipt_long,
            route: '/orders',
          ),
          SidebarMenuItem(
            id: 'settings',
            label: 'Setting',
            icon: Icons.settings_outlined,
            selectedIcon: Icons.settings,
            route: '/settings',
          ),
        ],
      ),
      SidebarMenuSection(
        title: 'Operasional',
        items: [
          SidebarMenuItem(
            id: 'orders-management',
            label: 'Manajemen Order',
            icon: Icons.assignment_outlined,
            route: '/orders',
          ),
          SidebarMenuItem(
            id: 'customers',
            label: 'Data Pelanggan',
            icon: Icons.people_outline,
            route: '/customers',
          ),
          SidebarMenuItem(
            id: 'outlets',
            label: 'Kelola Outlet',
            icon: Icons.store_outlined,
            route: '/settings/setup-outlet',
          ),
          SidebarMenuItem(
            id: 'laundry-services',
            label: 'Layanan Laundry',
            icon: Icons.local_laundry_service_outlined,
            route: '/settings/setup-outlet/laundry-services',
          ),
          SidebarMenuItem(
            id: 'categories',
            label: 'Kategori',
            icon: Icons.category_outlined,
            route: '/settings/setup-outlet/categories',
          ),
          SidebarMenuItem(
            id: 'service-packages',
            label: 'Paket Layanan',
            icon: Icons.inventory_2_outlined,
            route: '/settings/setup-outlet/service-packages',
          ),
          SidebarMenuItem(
            id: 'membership-plans',
            label: 'Daftar Membership',
            icon: Icons.card_membership_outlined,
            route: '/settings/setup-outlet/membership-plans',
          ),
          SidebarMenuItem(
            id: 'deposits',
            label: 'Deposit Pelanggan',
            icon: Icons.savings_outlined,
            route: '/settings/setup-outlet/deposits',
          ),
          SidebarMenuItem(
            id: 'expenses',
            label: 'Catat Pengeluaran',
            icon: Icons.money_off_outlined,
            route: '/settings/setup-outlet/expenses',
          ),
          SidebarMenuItem(
            id: 'petty-cash',
            label: 'Kas Kecil',
            icon: Icons.account_balance_outlined,
            route: '/settings/setup-outlet/petty-cash',
          ),
        ],
      ),
    ];
  }
}
