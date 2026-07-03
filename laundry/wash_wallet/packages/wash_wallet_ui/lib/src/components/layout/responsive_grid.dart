import 'package:flutter/material.dart';
import '../../theme/responsive/app_breakpoints.dart';

class ResponsiveGrid extends StatelessWidget {
  final List<Widget> children;
  final double mainAxisSpacing;
  final double crossAxisSpacing;
  final double? childAspectRatio;
  final int? maxColumns;

  const ResponsiveGrid({
    super.key,
    required this.children,
    this.mainAxisSpacing = 16.0,
    this.crossAxisSpacing = 16.0,
    this.childAspectRatio,
    this.maxColumns,
  });

  static int columnsFor(
    WindowSizeClass sizeClass, {
    int compact = 2,
    int medium = 3,
    int expanded = 4,
    int large = 6,
    int? maxColumns,
  }) {
    final count = switch (sizeClass) {
      WindowSizeClass.compact => compact,
      WindowSizeClass.medium => medium,
      WindowSizeClass.expanded => expanded,
      WindowSizeClass.large => large,
    };

    if (maxColumns == null) return count;
    return count > maxColumns ? maxColumns : count;
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);

    final crossAxisCount = columnsFor(sizeClass, maxColumns: maxColumns);

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
