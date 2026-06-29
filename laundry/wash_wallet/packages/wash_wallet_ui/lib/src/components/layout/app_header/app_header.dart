import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';

enum AppHeaderType {
  standard,
  compact,
  large,
  transparent;

  double get height {
    switch (this) {
      case AppHeaderType.standard:
        return 64.0;
      case AppHeaderType.compact:
        return 56.0;
      case AppHeaderType.large:
        return 96.0;
      case AppHeaderType.transparent:
        return 64.0;
    }
  }

  bool get supportsSubtitle {
    switch (this) {
      case AppHeaderType.standard:
      case AppHeaderType.large:
        return true;
      case AppHeaderType.compact:
      case AppHeaderType.transparent:
        return false;
    }
  }
}

class AppHeader extends StatelessWidget {
  final AppHeaderType type;
  final String title;
  final String? subtitle;
  final Widget? leading;
  final List<Widget>? actions;
  final VoidCallback? onBackPressed;
  final VoidCallback? onMenuPressed;
  final Color? backgroundColor;
  final Color? contentColor;
  final bool? centerTitle;
  final bool showMenuButton;
  final List<BoxShadow> elevation;

  const AppHeader({
    super.key,
    this.type = AppHeaderType.standard,
    required this.title,
    this.subtitle,
    this.leading,
    this.actions,
    this.onBackPressed,
    this.onMenuPressed,
    this.backgroundColor,
    this.contentColor,
    this.centerTitle,
    this.showMenuButton = false,
    this.elevation = const [],
  });

  @override
  Widget build(BuildContext context) {
    final isTransparent = type == AppHeaderType.transparent;
    final bgColor =
        backgroundColor ??
        (isTransparent ? Colors.transparent : context.colors.surface);
    final fgColor =
        contentColor ??
        (isTransparent ? Colors.white : context.colors.textPrimary);
    final subColor = isTransparent
        ? Colors.white.withValues(alpha: 0.8)
        : context.colors.textSecondary;

    return Container(
      height: type.height + MediaQuery.of(context).padding.top,
      decoration: BoxDecoration(
        color: bgColor,
        border: isTransparent || type == AppHeaderType.large
            ? null
            : Border(
                bottom: BorderSide(
                  color: context.colors.border.withValues(alpha: 0.5),
                  width: 1,
                ),
              ),
        boxShadow: elevation,
      ),
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      child: NavigationToolbar(
        middleSpacing: 16.0,
        leading: _buildLeading(context, fgColor),
        middle: _buildTitle(context, fgColor, subColor),
        trailing: _buildActions(context, fgColor),
        centerMiddle: centerTitle ?? (type == AppHeaderType.compact),
      ),
    );
  }

  Widget? _buildLeading(BuildContext context, Color color) {
    if (leading != null) return leading;

    if (showMenuButton && onMenuPressed != null) {
      return IconButton(
        onPressed: onMenuPressed,
        icon: const Icon(Icons.menu),
        color: color,
        tooltip: 'Menu',
      );
    }

    if (onBackPressed != null) {
      return IconButton(
        onPressed: onBackPressed,
        icon: const Icon(Icons.arrow_back_rounded),
        color: color,
        tooltip: 'Kembali',
      );
    }
    return null;
  }

  Widget _buildTitle(
    BuildContext context,
    Color titleColor,
    Color subtitleColor,
  ) {
    final showSubtitle = subtitle != null && type.supportsSubtitle;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: (centerTitle ?? false)
          ? CrossAxisAlignment.center
          : CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          title,
          style: type == AppHeaderType.large
              ? context.typography.headlineLarge.copyWith(
                  color: titleColor,
                  fontWeight: FontWeight.bold,
                )
              : context.typography.headlineLarge.copyWith(
                  color: titleColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 18,
                ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        if (showSubtitle) ...[
          const SizedBox(height: 2),
          Text(
            subtitle!,
            style: context.typography.bodyMedium.copyWith(color: subtitleColor),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ],
    );
  }

  Widget? _buildActions(BuildContext context, Color color) {
    if (actions == null || actions!.isEmpty) return null;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: actions!.map((action) {
        if (action is IconButton) {
          return Theme(
            data: Theme.of(
              context,
            ).copyWith(iconTheme: IconThemeData(color: color)),
            child: action,
          );
        }
        return Padding(
          padding: EdgeInsets.only(right: context.space.sm),
          child: action,
        );
      }).toList(),
    );
  }
}
