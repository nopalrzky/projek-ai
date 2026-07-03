import 'package:flutter/material.dart';
import '../../theme/responsive/app_breakpoints.dart';
import 'app_bottom_bar/app_bottom_bar.dart';

class AdaptiveDestination {
  final String label;
  final IconData icon;
  final IconData? selectedIcon;

  const AdaptiveDestination({
    required this.label,
    required this.icon,
    this.selectedIcon,
  });
}

class AdaptiveScaffold extends StatelessWidget {
  final List<AdaptiveDestination> destinations;
  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget body;
  final Widget? secondaryBody;
  final double secondaryBodyWidth;
  final bool showSecondaryBody;
  final Widget? floatingActionButton;
  final Widget? railLeadingWidget;
  final Widget? railTrailingWidget;

  const AdaptiveScaffold({
    super.key,
    required this.destinations,
    required this.currentIndex,
    required this.onDestinationSelected,
    required this.body,
    this.secondaryBody,
    this.secondaryBodyWidth = 320.0,
    this.showSecondaryBody = false,
    this.floatingActionButton,
    this.railLeadingWidget,
    this.railTrailingWidget,
  });

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isExtended = sizeClass == WindowSizeClass.large;

    if (sizeClass == WindowSizeClass.compact) {
      return Scaffold(
        body: body,
        floatingActionButton: floatingActionButton,
        bottomNavigationBar: AppBottomBar.navigation(
          currentIndex: currentIndex,
          onTap: onDestinationSelected,
          items: destinations
              .map(
                (d) => AppBottomBarItem(
                  label: d.label,
                  icon: d.icon,
                  activeIcon: d.selectedIcon ?? d.icon,
                ),
              )
              .toList(),
        ),
      );
    }

    return Scaffold(
      floatingActionButton: floatingActionButton,
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: currentIndex,
            onDestinationSelected: onDestinationSelected,
            labelType: isExtended ? null : NavigationRailLabelType.all,
            extended: isExtended,
            backgroundColor: Theme.of(context).colorScheme.surfaceContainerLow,
            indicatorColor: Theme.of(context).colorScheme.primaryContainer,
            leading: railLeadingWidget,
            trailing: railTrailingWidget,
            destinations: destinations
                .map(
                  (d) => NavigationRailDestination(
                    icon: Icon(d.icon),
                    selectedIcon: Icon(d.selectedIcon ?? d.icon),
                    label: Text(d.label),
                    padding: const EdgeInsets.symmetric(vertical: 4),
                  ),
                )
                .toList(),
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(child: body),
          if (showSecondaryBody && secondaryBody != null) ...[
            const VerticalDivider(thickness: 1, width: 1),
            SizedBox(width: secondaryBodyWidth, child: secondaryBody!),
          ],
        ],
      ),
    );
  }
}
