import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

/// Bottom bar items untuk root navigation cashier
const cashierBottomNavItems = [
  AppBottomBarItem(
    icon: Icons.home_outlined,
    activeIcon: Icons.home,
    label: 'Home',
  ),
  AppBottomBarItem(
    icon: Icons.account_balance_wallet_outlined,
    activeIcon: Icons.account_balance_wallet,
    label: 'Dana',
  ),
  AppBottomBarItem(
    icon: Icons.receipt_long_outlined,
    activeIcon: Icons.receipt_long,
    label: 'Transaksi',
  ),
  AppBottomBarItem(
    icon: Icons.dashboard_customize_outlined,
    activeIcon: Icons.dashboard_customize,
    label: 'Manajemen',
  ),
  AppBottomBarItem(
    icon: Icons.settings_outlined,
    activeIcon: Icons.settings,
    label: 'Setting',
  ),
];
