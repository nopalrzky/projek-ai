import 'package:flutter/material.dart';
import '../../theme/responsive/app_breakpoints.dart';

class ResponsiveGrid extends StatelessWidget {
  final List<Widget> children;
  final double mainAxisSpacing;
  final double crossAxisSpacing;
  final double? childAspectRatio;

  const ResponsiveGrid({
    super.key,
    required this.children,
    this.mainAxisSpacing = 16.0,
    this.crossAxisSpacing = 16.0,
    this.childAspectRatio,
  });

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    
    int crossAxisCount;
    switch (sizeClass) {
      case WindowSizeClass.compact:
        crossAxisCount = 2;
        break;
      case WindowSizeClass.medium:
        crossAxisCount = 3;
        break;
      case WindowSizeClass.expanded:
        crossAxisCount = 4;
        break;
      case WindowSizeClass.large:
        crossAxisCount = 6;
        break;
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        mainAxisSpacing: mainAxisSpacing,
        crossAxisSpacing: crossAxisSpacing,
        childAspectRatio: childAspectRatio ?? 1.0,
      ),
      itemCount: children.length,
      itemBuilder: (context, index) => children[index],
    );
  }
}
