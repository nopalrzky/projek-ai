import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import 'production_navigation_config.dart';

class ProductionShellScreen extends StatelessWidget {
  final Widget child;
  const ProductionShellScreen({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    if (isCompact) {
      // Compact: kembalikan child langsung
      // Bottom bar tetap dihandle di dalam setiap screen (existing)
      return child;
    }

    final authState = context.read<AuthCubit>().state;
    final employee = switch (authState) {
      Authenticated(:final employee) => employee,
      _ => null,
    };

    final location = GoRouterState.of(context).matchedLocation;
    String currentRouteId = 'home';
    if (location.startsWith('/orders') || location.startsWith('/order-items')) {
      currentRouteId = 'orders';
    } else if (location.startsWith('/pickup-schedule')) {
      currentRouteId = 'pickup-schedule';
    } else if (location.startsWith('/profile')) {
      currentRouteId = 'profile';
    }

    return OperationalTabletShell(
      appName: 'WashWallet',
      appRoleLabel: 'Produksi & Logistik',
      menuSections: employee != null
          ? ProductionNavigationConfig.buildSections(employee)
          : const [],
      currentRouteId: currentRouteId,
      onMenuItemTap: (item) {
        if (item.route != null) context.go(item.route!);
      },
      userAccount: employee != null
          ? SidebarUserAccount(
              name: employee.name,
              subtitle: 'Produksi / Kurir',
            )
          : null,
      searchHint: 'Cari order...',
      onSearchSubmitted: (_) {},
      body: child,
    );
  }
}
