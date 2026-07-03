import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../permissions/cashier_permission_checker.dart';
import '../permissions/cashier_permissions.dart';

class CashierNavigationConfig {
  static List<SidebarMenuSection> buildSections(AuthEmployee employee) {
    final operational = <SidebarMenuItem>[];
    final finance = <SidebarMenuItem>[];

    if (CashierPermissionChecker.hasOrderSectionAccess(employee)) {
      operational.add(
        SidebarMenuItem(
          id: 'orders',
          label: 'Transaksi',
          icon: Icons.receipt_long_outlined,
          selectedIcon: Icons.receipt_long,
          route: '/orders',
        ),
      );
    }

    if (CashierPermissionChecker.hasCustomerSectionAccess(employee)) {
      operational.add(
        SidebarMenuItem(
          id: 'customers',
          label: 'Pelanggan',
          icon: Icons.people_outline,
          selectedIcon: Icons.people,
          route: '/customers',
        ),
      );
    }

    if (CashierPermissionChecker.hasLaundryServiceSectionAccess(employee)) {
      operational.add(
        SidebarMenuItem(
          id: 'laundry-services',
          label: 'Layanan Laundry',
          icon: Icons.local_laundry_service_outlined,
          selectedIcon: Icons.local_laundry_service,
          route: '/laundry-services',
        ),
      );
    }

    if (CashierPermissionChecker.hasCategorySectionAccess(employee)) {
      operational.add(
        SidebarMenuItem(
          id: 'categories',
          label: 'Kategori',
          icon: Icons.category_outlined,
          selectedIcon: Icons.category,
          route: '/categories',
        ),
      );
    }

    if (employee.hasPermission(CashierPermissions.servicePackageView)) {
      operational.add(
        SidebarMenuItem(
          id: 'service-packages',
          label: 'Paket Layanan',
          icon: Icons.inventory_2_outlined,
          selectedIcon: Icons.inventory_2,
          route: '/service-packages',
        ),
      );
    }

    if (employee.hasPermission(CashierPermissions.membershipPlanView)) {
      operational.add(
        SidebarMenuItem(
          id: 'membership-plans',
          label: 'Membership',
          icon: Icons.card_membership_outlined,
          selectedIcon: Icons.card_membership,
          route: '/membership-plans',
        ),
      );
    }

    if (employee.hasAnyPermission([
      CashierPermissions.depositView,
      CashierPermissions.depositCreate,
      CashierPermissions.depositUpdate,
    ])) {
      finance.add(
        SidebarMenuItem(
          id: 'deposits',
          label: 'Setoran',
          icon: Icons.account_balance_wallet_outlined,
          selectedIcon: Icons.account_balance_wallet,
          route: '/deposits',
        ),
      );
    }

    if (employee.hasAnyPermission([
      CashierPermissions.pettyCashView,
      CashierPermissions.pettyCashCreate,
      CashierPermissions.pettyCashUpdate,
    ])) {
      finance.add(
        SidebarMenuItem(
          id: 'petty-cashes',
          label: 'Petty Cash',
          icon: Icons.account_balance_outlined,
          selectedIcon: Icons.account_balance,
          route: '/petty-cashes',
        ),
      );
    }

    if (employee.hasAnyPermission([
      CashierPermissions.expenseView,
      CashierPermissions.expenseCreate,
      CashierPermissions.expenseUpdate,
      CashierPermissions.expenseDelete,
    ])) {
      finance.add(
        SidebarMenuItem(
          id: 'expenses',
          label: 'Pengeluaran Outlet',
          icon: Icons.money_off_outlined,
          selectedIcon: Icons.money_off,
          route: '/expenses',
        ),
      );
    }

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
            id: 'profile',
            label: 'Profil',
            icon: Icons.person_outline,
            selectedIcon: Icons.person,
            route: '/profile',
          ),
        ],
      ),
      if (operational.isNotEmpty)
        SidebarMenuSection(title: 'Operasional', items: operational),
      if (finance.isNotEmpty)
        SidebarMenuSection(title: 'Dana & Keuangan', items: finance),
      SidebarMenuSection(
        title: 'Setting',
        items: [
          SidebarMenuItem(
            id: 'printer',
            label: 'Printer',
            icon: Icons.print_outlined,
            route: '/printer',
          ),
          SidebarMenuItem(
            id: 'pin-security',
            label: 'Keamanan PIN',
            icon: Icons.security_outlined,
            route: '/pin-security',
          ),
        ],
      ),
    ];
  }
}
