import 'package:flutter/material.dart';
import '../../theme/responsive/app_breakpoints.dart';

class ResponsiveLayout extends StatelessWidget {
  final Widget compactLayout;
  final Widget? mediumLayout;
  final Widget? expandedLayout;
  final Widget? largeLayout;

  const ResponsiveLayout({
    super.key,
    required this.compactLayout,
    this.mediumLayout,
    this.expandedLayout,
    this.largeLayout,
  });

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    
    Widget layout;
    switch (sizeClass) {
      case WindowSizeClass.compact:
        layout = compactLayout;
        break;
      case WindowSizeClass.medium:
        layout = mediumLayout ?? compactLayout;
        break;
      case WindowSizeClass.expanded:
        layout = expandedLayout ?? mediumLayout ?? compactLayout;
        break;
      case WindowSizeClass.large:
        layout = largeLayout ?? expandedLayout ?? mediumLayout ?? compactLayout;
        break;
    }

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: KeyedSubtree(
        key: ValueKey(sizeClass),
        child: layout,
      ),
    );
  }
}
