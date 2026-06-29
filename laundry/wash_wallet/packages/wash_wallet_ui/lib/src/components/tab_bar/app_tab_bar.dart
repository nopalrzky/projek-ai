import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_tab_variant.dart';

class AppTabBar extends StatelessWidget {
  final List<String> tabs;
  final int selectedIndex;
  final ValueChanged<int> onTabSelected;
  final AppTabVariant variant;
  final bool isScrollable;
  final EdgeInsetsGeometry? padding;
  final double? tabHeight;
  final List<Widget>? icons;

  const AppTabBar({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onTabSelected,
    this.variant = AppTabVariant.primary,
    this.isScrollable = false,
    this.padding,
    this.tabHeight = 40,
    this.icons,
  });

  const AppTabBar.primary({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onTabSelected,
    this.isScrollable = false,
    this.padding,
    this.tabHeight = 40,
    this.icons,
  }) : variant = AppTabVariant.primary;

  const AppTabBar.secondary({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onTabSelected,
    this.isScrollable = false,
    this.padding,
    this.tabHeight = 40,
    this.icons,
  }) : variant = AppTabVariant.secondary;

  const AppTabBar.outline({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onTabSelected,
    this.isScrollable = false,
    this.padding,
    this.tabHeight = 40,
    this.icons,
  }) : variant = AppTabVariant.outline;

  @override
  Widget build(BuildContext context) {
    final effectivePadding =
        padding ??
        EdgeInsets.symmetric(
          horizontal: context.space.md,
          vertical: context.space.xs,
        );

    return Container(
      padding: effectivePadding,
      child: isScrollable
          ? SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: _buildTabs(context),
            )
          : _buildTabs(context),
    );
  }

  Widget _buildTabs(BuildContext context) {
    return Row(
      mainAxisSize: isScrollable ? MainAxisSize.min : MainAxisSize.max,
      children: List.generate(tabs.length, (index) {
        final isSelected = index == selectedIndex;
        final hasIcons = icons != null && icons!.length > index;

        return Expanded(
          flex: isScrollable ? 0 : 1,
          child: Padding(
            padding: EdgeInsets.only(
              right: index < tabs.length - 1 ? context.space.xs : 0,
            ),
            child: _buildTab(
              context: context,
              label: tabs[index],
              isSelected: isSelected,
              onTap: () => onTabSelected(index),
              icon: hasIcons ? icons![index] : null,
            ),
          ),
        );
      }),
    );
  }

  Widget _buildTab({
    required BuildContext context,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    Widget? icon,
  }) {
    final colors = _getColors(context, isSelected);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(context.radius.md),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          height: tabHeight,
          constraints: BoxConstraints(
            minWidth: isScrollable ? 80 : double.infinity,
          ),
          padding: EdgeInsets.symmetric(
            horizontal: context.space.sm,
            vertical: context.space.xs,
          ),
          decoration: BoxDecoration(
            color: colors.backgroundColor,
            border: variant == AppTabVariant.outline
                ? Border.all(
                    color: colors.borderColor,
                    width: isSelected ? 1.5 : 1,
                  )
                : null,
            borderRadius: BorderRadius.circular(context.radius.md),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                IconTheme(
                  data: IconThemeData(color: colors.textColor, size: 18),
                  child: icon,
                ),
                SizedBox(width: context.space.xs),
              ],
              Flexible(
                child: Text(
                  label,
                  style: context.typography.labelMedium.copyWith(
                    color: colors.textColor,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  _TabColors _getColors(BuildContext context, bool isSelected) {
    final colors = context.colors;

    switch (variant) {
      case AppTabVariant.primary:
        return _TabColors(
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          textColor: isSelected ? colors.onPrimary : colors.textSecondary,
        );

      case AppTabVariant.secondary:
        return _TabColors(
          backgroundColor: isSelected ? colors.secondary : colors.surface,
          borderColor: isSelected ? colors.secondary : colors.border,
          textColor: isSelected ? colors.onSecondary : colors.textSecondary,
        );

      case AppTabVariant.outline:
        return _TabColors(
          backgroundColor: isSelected
              ? colors.primarySurface
              : Colors.transparent,
          borderColor: isSelected ? colors.primary : colors.border,
          textColor: isSelected ? colors.primary : colors.textSecondary,
        );
    }
  }
}

class _TabColors {
  final Color backgroundColor;
  final Color borderColor;
  final Color textColor;

  const _TabColors({
    required this.backgroundColor,
    required this.borderColor,
    required this.textColor,
  });
}
