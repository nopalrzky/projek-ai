import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';
import '../../badge/app_badge.dart';
import '../../badge/app_badge_size.dart';

enum AppBottomBarType {
  navigation,
  action,
  mixed,
  compact;

  double get height {
    switch (this) {
      case AppBottomBarType.navigation:
        return 80.0;
      case AppBottomBarType.action:
      case AppBottomBarType.mixed:
        return 88.0;
      case AppBottomBarType.compact:
        return 64.0;
    }
  }
}

@immutable
class AppBottomBarItem {
  final IconData icon;
  final IconData? activeIcon;
  final String? label;
  final String? badge;
  final bool enabled;

  const AppBottomBarItem({
    required this.icon,
    this.activeIcon,
    this.label,
    this.badge,
    this.enabled = true,
  });

  IconData getIcon(bool isActive) =>
      (isActive && activeIcon != null) ? activeIcon! : icon;
}

class AppBottomBar extends StatelessWidget {
  final AppBottomBarType type;
  final int currentIndex;
  final List<AppBottomBarItem>? items;
  final ValueChanged<int>? onTap;
  final Widget? primaryAction;
  final Widget? secondaryAction;
  final Color? backgroundColor;
  final List<BoxShadow> elevation;

  const AppBottomBar({
    super.key,
    this.type = AppBottomBarType.navigation,
    this.currentIndex = 0,
    this.items,
    this.onTap,
    this.primaryAction,
    this.secondaryAction,
    this.backgroundColor,
    this.elevation = const [],
  });

  const AppBottomBar.navigation({
    super.key,
    required List<AppBottomBarItem> this.items,
    required ValueChanged<int> this.onTap,
    this.currentIndex = 0,
    this.backgroundColor,
    this.elevation = const [],
  }) : type = AppBottomBarType.navigation,
       primaryAction = null,
       secondaryAction = null;

  const AppBottomBar.action({
    super.key,
    required Widget this.primaryAction,
    this.secondaryAction,
    this.backgroundColor,
    this.elevation = const [],
  }) : type = AppBottomBarType.action,
       items = null,
       onTap = null,
       currentIndex = 0;

  const AppBottomBar.compact({
    super.key,
    required List<AppBottomBarItem> this.items,
    required ValueChanged<int> this.onTap,
    this.currentIndex = 0,
    this.backgroundColor,
    this.elevation = const [],
  }) : type = AppBottomBarType.compact,
       primaryAction = null,
       secondaryAction = null;

  @override
  Widget build(BuildContext context) {
    final bgColor = backgroundColor ?? context.colors.surface;
    final borderColor = context.colors.border.withValues(alpha: 0.5);

    return Container(
      height: type.height + MediaQuery.of(context).padding.bottom,
      decoration: BoxDecoration(
        color: bgColor,
        border: Border(top: BorderSide(color: borderColor, width: 1)),
        boxShadow: elevation,
      ),
      child: Material(
        color: Colors.transparent,
        child: SafeArea(child: _buildContent(context)),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    switch (type) {
      case AppBottomBarType.navigation:
      case AppBottomBarType.compact:
        return _buildNavigationLayout(context);
      case AppBottomBarType.action:
        return _buildActionLayout(context);
      case AppBottomBarType.mixed:
        return _buildMixedLayout(context);
    }
  }

  Widget _buildNavigationLayout(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: items!.asMap().entries.map((entry) {
        return Expanded(
          child: _BottomBarItemWidget(
            item: entry.value,
            isActive: currentIndex == entry.key,
            isCompact: type == AppBottomBarType.compact,
            onTap: entry.value.enabled ? () => onTap?.call(entry.key) : null,
          ),
        );
      }).toList(),
    );
  }

  Widget _buildActionLayout(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: Row(
        children: [
          if (secondaryAction != null) ...[
            Expanded(child: secondaryAction!),
            SizedBox(width: context.space.md),
          ],
          Expanded(flex: 2, child: primaryAction!),
        ],
      ),
    );
  }

  Widget _buildMixedLayout(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: context.space.md),
      child: Row(
        children: [
          ...items!.asMap().entries.map((entry) {
            return Expanded(
              child: _BottomBarItemWidget(
                item: entry.value,
                isActive: currentIndex == entry.key,
                isCompact: false,
                onTap: entry.value.enabled
                    ? () => onTap?.call(entry.key)
                    : null,
              ),
            );
          }),
          SizedBox(width: context.space.md),
          primaryAction!,
        ],
      ),
    );
  }
}

class _BottomBarItemWidget extends StatelessWidget {
  final AppBottomBarItem item;
  final bool isActive;
  final bool isCompact;
  final VoidCallback? onTap;

  const _BottomBarItemWidget({
    required this.item,
    required this.isActive,
    required this.isCompact,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = context.colors.primary;
    final inactiveColor = context.colors.textTertiary;
    final disabledColor = context.colors.disabled;

    final fgColor = !item.enabled
        ? disabledColor
        : (isActive ? activeColor : inactiveColor);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(context.radius.md),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildIcon(context, fgColor),
          if (!isCompact && item.label != null) ...[
            const SizedBox(height: 4),
            _buildLabel(context, fgColor),
          ],
        ],
      ),
    );
  }

  Widget _buildIcon(BuildContext context, Color color) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: isActive ? 64 : null,
          height: 32,
          constraints: const BoxConstraints(maxWidth: 64, minHeight: 32),
          padding: EdgeInsets.symmetric(
            horizontal: isActive ? 20.0 : 0.0,
            vertical: 4.0,
          ),
          decoration: BoxDecoration(
            color: isActive
                ? context.colors.primarySurface
                : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(item.getIcon(isActive), size: 24, color: color),
        ),
        if (item.badge != null)
          Positioned(
            top: -2,
            right: isActive ? -4 : -8,
            child: _buildBadge(context),
          ),
      ],
    );
  }

  Widget _buildLabel(BuildContext context, Color color) {
    return AnimatedDefaultTextStyle(
      duration: const Duration(milliseconds: 200),
      style: context.typography.labelSmall.copyWith(
        color: color,
        fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
        fontSize: 12,
      ),
      child: Text(item.label!, maxLines: 1, overflow: TextOverflow.ellipsis),
    );
  }

  Widget _buildBadge(BuildContext context) {
    return AppBadge.danger(label: item.badge!, size: AppBadgeSize.sm);
  }
}
