import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../navigation/production_navigation_config.dart';

class ProductionTabletShell extends StatelessWidget {
  final String currentRouteId;
  final Widget child;
  final bool showSecondaryBody;
  final Widget? secondaryBody;

  const ProductionTabletShell({
    super.key,
    required this.currentRouteId,
    required this.child,
    this.showSecondaryBody = false,
    this.secondaryBody,
  });

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    if (isCompact) {
      return child;
    }

    final authState = context.watch<AuthCubit>().state;
    
    if (authState is! Authenticated) {
      return child;
    }

    final employee = authState.employee;
    final userName = employee.name;
    final userSubtitle = 'Produksi / Kurir';

    return OperationalTabletShell(
      appName: 'WashWallet',
      appRoleLabel: 'Produksi & Logistik',
      menuSections: ProductionNavigationConfig.buildSections(employee),
      currentRouteId: currentRouteId,
      onMenuItemTap: (item) {
        if (item.route != null) {
          context.go(item.route!);
        }
      },
      userAccount: SidebarUserAccount(
        name: userName,
        subtitle: userSubtitle,
      ),
      searchHint: 'Cari order...',
      onSearchSubmitted: (query) {
        // TODO: implement global search
      },
      showSecondaryBody: showSecondaryBody,
      secondaryBody: secondaryBody,
      body: child,
    );
  }
}
