import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class MainNavigationScreen extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainNavigationScreen({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: navigationShell.currentIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && navigationShell.currentIndex != 0) {
          navigationShell.goBranch(0);
        }
      },
      child: Scaffold(
        body: SafeArea(top: true, bottom: false, child: navigationShell),
        bottomNavigationBar: _CustomBottomNavBar(
          currentIndex: navigationShell.currentIndex,
          onTap: (index) {
            navigationShell.goBranch(
              index,
              initialLocation: index == navigationShell.currentIndex,
            );
          },
        ),
      ),
    );
  }
}

class _CustomBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _CustomBottomNavBar({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
        border: Border(
          top: BorderSide(color: context.colors.border.withValues(alpha: 0.5)),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: context.space.md,
            vertical: context.space.sm,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavBarItem(
                index: 0,
                currentIndex: currentIndex,
                label: 'Beranda',
                iconAsset: 'assets/images/ic_nav_home.png',
                onTap: () => onTap(0),
              ),
              _NavBarItem(
                index: 1,
                currentIndex: currentIndex,
                label: 'Outlet',
                iconAsset: 'assets/images/ic_nav_outlet.png',
                onTap: () => onTap(1),
              ),
              _NavBarItem(
                index: 2,
                currentIndex: currentIndex,
                label: 'Promo',
                iconAsset: 'assets/images/ic_nav_promo.png',
                onTap: () => onTap(2),
              ),
              _NavBarItem(
                index: 3,
                currentIndex: currentIndex,
                label: 'Pesanan',
                iconAsset: 'assets/images/ic_nav_order.png',
                onTap: () => onTap(3),
              ),
              _NavBarItem(
                index: 4,
                currentIndex: currentIndex,
                label: 'Akun',
                iconAsset: 'assets/images/ic_nav_profile.png',
                onTap: () => onTap(4),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  final int index;
  final int currentIndex;
  final String label;
  final String iconAsset;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.index,
    required this.currentIndex,
    required this.label,
    required this.iconAsset,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    final activeColor = context.colors.primary;
    final inactiveColor = context.colors.textSecondary;

    return Expanded(
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(height: context.space.xs),
            _NavIcon(iconData: _getIconData(index), isActive: isActive),
            SizedBox(height: context.space.xs),
            Text(
              label,
              style: context.typography.labelSmall.copyWith(
                color: isActive ? activeColor : inactiveColor,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                fontSize: 10,
              ),
            ),
            SizedBox(height: context.space.xs),
            AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeInOut,
              width: isActive ? 4 : 0,
              height: 4,
              decoration: BoxDecoration(
                color: activeColor,
                shape: BoxShape.circle,
              ),
            ),
            SizedBox(height: context.space.xs),
          ],
        ),
      ),
    );
  }

  IconData _getIconData(int index) {
    switch (index) {
      case 0:
        return Icons.home_rounded;
      case 1:
        return Icons.storefront_rounded;
      case 2:
        return Icons.local_offer_rounded;
      case 3:
        return Icons.assignment_rounded;
      case 4:
        return Icons.person_rounded;
      default:
        return Icons.circle;
    }
  }
}

class _NavIcon extends StatelessWidget {
  final IconData iconData;
  final bool isActive;

  const _NavIcon({required this.iconData, required this.isActive});

  @override
  Widget build(BuildContext context) {
    final color = isActive
        ? context.colors.primary
        : context.colors.textSecondary;

    return AnimatedScale(
      scale: isActive ? 1.2 : 1.0,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOutBack,
      child: Icon(iconData, size: 24, color: color),
    );
  }
}
