import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'styles/app_drawer_style.dart';
import 'variants/app_drawer_variant.dart';

class AppDrawerMenuItem extends StatefulWidget {
  final String title;
  final IconData icon;
  final String route;
  final bool isActive;
  final bool isDisabled;
  final VoidCallback? onTap;
  final Widget? badge;
  final AppDrawerVariant variant;

  const AppDrawerMenuItem({
    super.key,
    required this.title,
    required this.icon,
    required this.route,
    this.isActive = false,
    this.isDisabled = false,
    this.onTap,
    this.badge,
    this.variant = AppDrawerVariant.standard,
  });

  @override
  State<AppDrawerMenuItem> createState() => _AppDrawerMenuItemState();
}

class _AppDrawerMenuItemState extends State<AppDrawerMenuItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final style = AppDrawerStyle(variant: widget.variant, context: context);

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.isDisabled ? null : widget.onTap,
          borderRadius: style.itemBorderRadius,
          child: Container(
            height: style.itemHeight,
            margin: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 2.0),
            decoration: BoxDecoration(
              color: _getBackgroundColor(style),
              borderRadius: style.itemBorderRadius,
              border: widget.isActive
                  ? Border.all(
                      color: style.selectedItemColor.withValues(alpha: 0.3),
                      width: 1.0,
                    )
                  : null,
            ),
            child: Padding(
              padding: style.itemPadding,
              child: widget.variant == AppDrawerVariant.compact
                  ? _buildCompactContent(style)
                  : _buildStandardContent(style),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStandardContent(AppDrawerStyle style) {
    return Row(
      children: [
        Icon(widget.icon, size: style.iconSize, color: _getIconColor(style)),
        SizedBox(width: context.space.md),
        Expanded(
          child: Text(
            widget.title,
            style: widget.isActive
                ? style.itemActiveTextStyle
                : style.itemTitleStyle.copyWith(
                    color: widget.isDisabled
                        ? context.colors.textDisabled
                        : style.inactiveTextColor,
                  ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (widget.badge != null) ...[
          SizedBox(width: context.space.sm),
          widget.badge!,
        ],
      ],
    );
  }

  Widget _buildCompactContent(AppDrawerStyle style) {
    return Center(
      child: Icon(
        widget.icon,
        size: style.iconSize,
        color: _getIconColor(style),
      ),
    );
  }

  Color _getBackgroundColor(AppDrawerStyle style) {
    if (widget.isDisabled) {
      return Colors.transparent;
    }

    if (widget.isActive) {
      return style.selectedBackgroundColor;
    }

    if (_isHovered) {
      return style.hoverBackgroundColor;
    }

    return Colors.transparent;
  }

  Color _getIconColor(AppDrawerStyle style) {
    if (widget.isDisabled) {
      return context.colors.disabled;
    }

    if (widget.isActive) {
      return style.selectedItemColor;
    }

    return style.unselectedItemColor;
  }
}
