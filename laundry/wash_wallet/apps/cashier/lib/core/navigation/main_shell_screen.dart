import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import 'bottom_nav_helper.dart';
import 'cashier_navigation_config.dart';

class MainShellScreen extends StatefulWidget {
  final StatefulNavigationShell navigationShell;
  const MainShellScreen({super.key, required this.navigationShell});

  @override
  State<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends State<MainShellScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<Offset> _slideAnimation;
  int _previousIndex = 0;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _slideAnimation = Tween<Offset>(
      begin: Offset.zero,
      end: Offset.zero,
    ).animate(_animController);
  }

  @override
  void didUpdateWidget(MainShellScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.navigationShell.currentIndex != widget.navigationShell.currentIndex) {
      _previousIndex = widget.navigationShell.currentIndex;
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _onTabTap(int index) {
    if (index == widget.navigationShell.currentIndex) return;
    _runSlideAnimation(
      fromIndex: _previousIndex,
      toIndex: index,
    );
    _previousIndex = index;
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  void _runSlideAnimation({required int fromIndex, required int toIndex}) {
    final bool goingRight = toIndex > fromIndex;
    _slideAnimation = Tween<Offset>(
      begin: goingRight
          ? const Offset(1.0, 0.0)
          : const Offset(-1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animController,
      curve: Curves.easeInOut,
    ));
    _animController.forward(from: 0);
  }

  void _onHorizontalDragEnd(DragEndDetails details) {
    if (details.primaryVelocity == null) return;
    final velocity = details.primaryVelocity!;
    if (velocity.abs() < 300) return; 

    final currentIndex = widget.navigationShell.currentIndex;
    
    if (velocity > 0) {
      if (currentIndex > 0) {
        _onTabTap(currentIndex - 1);
      }
    } else {
      if (currentIndex < cashierBottomNavItems.length - 1) {
        _onTabTap(currentIndex + 1);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    if (isCompact) {
      return AdaptiveScaffold(
        currentIndex: widget.navigationShell.currentIndex,
        onDestinationSelected: _onTabTap,
        destinations: cashierBottomNavItems.map((item) => AdaptiveDestination(
          label: item.label ?? '',
          icon: item.icon,
          selectedIcon: item.activeIcon,
        )).toList(),
        body: GestureDetector(
          onHorizontalDragEnd: _onHorizontalDragEnd,
          child: SlideTransition(
            position: _slideAnimation,
            child: widget.navigationShell,
          ),
        ),
      );
    }

    final authState = context.read<AuthCubit>().state;
    final userName = authState is Authenticated ? authState.employee.name : null;
    final userSubtitle = 'Kasir';
    
    // Resolve currentRouteId from go router state location
    final location = GoRouterState.of(context).matchedLocation;
    String currentRouteId = 'home';
    if (location.startsWith('/orders')) {
      currentRouteId = 'orders-management';
    } else if (location.startsWith('/finances')) {
      currentRouteId = 'finances';
    } else if (location.startsWith('/settings/setup-outlet/laundry-services')) {
      currentRouteId = 'laundry-services';
    } else if (location.startsWith('/settings/setup-outlet/categories')) {
      currentRouteId = 'categories';
    } else if (location.startsWith('/settings/setup-outlet/service-packages')) {
      currentRouteId = 'service-packages';
    } else if (location.startsWith('/settings/setup-outlet/membership-plans')) {
      currentRouteId = 'membership-plans';
    } else if (location.startsWith('/settings/setup-outlet/deposits')) {
      currentRouteId = 'deposits';
    } else if (location.startsWith('/settings/setup-outlet/expenses')) {
      currentRouteId = 'expenses';
    } else if (location.startsWith('/settings/setup-outlet/petty-cash')) {
      currentRouteId = 'petty-cash';
    } else if (location.startsWith('/settings/setup-outlet')) {
      currentRouteId = 'outlets';
    } else if (location.startsWith('/customers')) {
      currentRouteId = 'customers';
    } else if (location.startsWith('/settings')) {
      currentRouteId = 'settings';
    }

    return OperationalTabletShell(
      appName: 'WashWallet',
      appRoleLabel: 'Kasir App / Management System',
      menuSections: CashierNavigationConfig.buildSections(),
      currentRouteId: currentRouteId,
      onMenuItemTap: (item) {
        if (item.route != null) {
          context.go(item.route!);
        }
      },
      userAccount: userName != null ? SidebarUserAccount(
        name: userName,
        subtitle: userSubtitle,
      ) : null,
      searchHint: 'Cari pesanan, pelanggan...',
      onSearchSubmitted: (query) {
        // TODO: implement global search dispatch
      },
      body: widget.navigationShell,
    );
  }
}
