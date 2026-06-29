import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import '../divider/app_divider.dart';
import 'app_list_tile_variant.dart';
import 'app_list_tile_size.dart';
import 'app_list_tile_style.dart';

class AppListTile extends StatefulWidget {
  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final String? price;
  final Widget? status;
  final VoidCallback? onTap;
  final AppListTileVariant variant;
  final AppListTileSize size;
  final bool isSelected;
  final bool isDisabled;
  final bool showDivider;
  final EdgeInsets? margin;
  final bool showLeftIndicator;

  const AppListTile._({
    super.key,
    required this.title,
    required this.variant,
    this.subtitle,
    this.leading,
    this.trailing,
    this.price,
    this.status,
    this.onTap,
    this.size = AppListTileSize.md,
    this.isSelected = false,
    this.isDisabled = false,
    this.showDivider = false,
    this.margin,
    this.showLeftIndicator = false,
  });

  const AppListTile({
    Key? key,
    required String title,
    String? subtitle,
    Widget? leading,
    Widget? trailing,
    VoidCallback? onTap,
    AppListTileSize size = AppListTileSize.md,
    bool isSelected = false,
    bool isDisabled = false,
    bool showDivider = false,
    EdgeInsets? margin,
    bool showLeftIndicator = false,
  }) : this._(
         key: key,
         title: title,
         variant: AppListTileVariant.defaultVariant,
         subtitle: subtitle,
         leading: leading,
         trailing: trailing,
         onTap: onTap,
         size: size,
         isSelected: isSelected,
         isDisabled: isDisabled,
         showDivider: showDivider,
         margin: margin,
         showLeftIndicator: showLeftIndicator,
       );

  const AppListTile.order({
    Key? key,
    required String title,
    String? subtitle,
    Widget? leading,
    String? price,
    Widget? status,
    VoidCallback? onTap,
    AppListTileSize size = AppListTileSize.md,
    bool isSelected = false,
    bool isDisabled = false,
    bool showDivider = false,
    EdgeInsets? margin,
    bool showLeftIndicator = false,
  }) : this._(
         key: key,
         title: title,
         variant: AppListTileVariant.order,
         subtitle: subtitle,
         leading: leading,
         price: price,
         status: status,
         onTap: onTap,
         size: size,
         isSelected: isSelected,
         isDisabled: isDisabled,
         showDivider: showDivider,
         margin: margin,
         showLeftIndicator: showLeftIndicator,
       );

  const AppListTile.service({
    Key? key,
    required String title,
    String? subtitle,
    Widget? leading,
    String? price,
    VoidCallback? onTap,
    AppListTileSize size = AppListTileSize.md,
    bool isSelected = false,
    bool isDisabled = false,
    bool showDivider = false,
    EdgeInsets? margin,
    bool showLeftIndicator = false,
  }) : this._(
         key: key,
         title: title,
         variant: AppListTileVariant.service,
         subtitle: subtitle,
         leading: leading,
         price: price,
         onTap: onTap,
         size: size,
         isSelected: isSelected,
         isDisabled: isDisabled,
         showDivider: showDivider,
         margin: margin,
         showLeftIndicator: showLeftIndicator,
       );

  const AppListTile.customer({
    Key? key,
    required String title,
    String? subtitle,
    Widget? leading,
    Widget? trailing,
    VoidCallback? onTap,
    AppListTileSize size = AppListTileSize.md,
    bool isSelected = false,
    bool isDisabled = false,
    bool showDivider = false,
    EdgeInsets? margin,
    bool showLeftIndicator = false,
  }) : this._(
         key: key,
         title: title,
         variant: AppListTileVariant.customer,
         subtitle: subtitle,
         leading: leading,
         trailing: trailing,
         onTap: onTap,
         size: size,
         isSelected: isSelected,
         isDisabled: isDisabled,
         showDivider: showDivider,
         margin: margin,
         showLeftIndicator: showLeftIndicator,
       );

  const AppListTile.compact({
    Key? key,
    required String title,
    String? subtitle,
    Widget? leading,
    Widget? trailing,
    VoidCallback? onTap,
    bool isSelected = false,
    bool isDisabled = false,
    bool showDivider = false,
    EdgeInsets? margin,
    bool showLeftIndicator = false,
  }) : this._(
         key: key,
         title: title,
         variant: AppListTileVariant.defaultVariant,
         subtitle: subtitle,
         leading: leading,
         trailing: trailing,
         onTap: onTap,
         size: AppListTileSize.sm,
         isSelected: isSelected,
         isDisabled: isDisabled,
         showDivider: showDivider,
         margin: margin,
         showLeftIndicator: showLeftIndicator,
       );

  @override
  State<AppListTile> createState() => _AppListTileState();
}

class _AppListTileState extends State<AppListTile> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final style = AppListTileStyle(
      variant: widget.variant,
      size: widget.size,
      isSelected: widget.isSelected,
      isDisabled: widget.isDisabled,
      isHovered: _isHovered,
      context: context,
    );

    Widget tile = _buildTileContent(style);

    // Wrap with margin if provided
    if (widget.margin != null) {
      tile = Padding(padding: widget.margin!, child: tile);
    }

    // Add divider if requested
    if (widget.showDivider) {
      tile = Column(
        mainAxisSize: MainAxisSize.min,
        children: [tile, AppDivider.soft()],
      );
    }

    return tile;
  }

  Widget _buildTileContent(AppListTileStyle style) {
    final canTap = widget.onTap != null && !widget.isDisabled;

    return MouseRegion(
      onEnter: canTap ? (_) => setState(() => _isHovered = true) : null,
      onExit: canTap ? (_) => setState(() => _isHovered = false) : null,
      cursor: canTap ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: canTap ? widget.onTap : null,
          borderRadius: style.borderRadius,
          child: Ink(
            decoration: style.decoration,
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: style.minHeight),
              child: Padding(
                padding: style.padding,
                child: Row(
                  children: [
                    // Left indicator
                    if (widget.showLeftIndicator && widget.isSelected) ...[
                      Container(
                        width: 3,
                        decoration: BoxDecoration(
                          color: context.colors.primary,
                          borderRadius: BorderRadius.only(
                            topLeft: style.borderRadius.topLeft,
                            bottomLeft: style.borderRadius.bottomLeft,
                          ),
                        ),
                      ),
                      SizedBox(width: context.space.xs),
                    ],

                    // Leading widget
                    if (widget.leading != null) ...[
                      SizedBox(
                        width: style.leadingSize,
                        height: style.leadingSize,
                        child: widget.leading,
                      ),
                      SizedBox(width: style.leadingGap),
                    ],

                    // Content (title, subtitle, price)
                    Expanded(child: _buildContent(style)),

                    // Trailing widgets (status, trailing)
                    if (widget.status != null ||
                        widget.trailing != null ||
                        widget.price != null) ...[
                      SizedBox(width: style.trailingGap),
                      _buildTrailing(style),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(AppListTileStyle style) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title
        Text(
          widget.title,
          style: style.titleStyle,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),

        // Subtitle
        if (widget.subtitle != null) ...[
          SizedBox(height: style.titleSubtitleGap),
          Text(
            widget.subtitle!,
            style: style.subtitleStyle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ],
    );
  }

  Widget _buildTrailing(AppListTileStyle style) {
    // For order variant: show price and status vertically
    if (widget.variant == AppListTileVariant.order) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (widget.price != null)
            Text(widget.price!, style: style.priceStyle),
          if (widget.price != null && widget.status != null)
            SizedBox(height: context.space.xs),
          if (widget.status != null) widget.status!,
        ],
      );
    }

    // For service variant: show price prominently
    if (widget.variant == AppListTileVariant.service) {
      if (widget.price != null) {
        return Text(widget.price!, style: style.priceStyle);
      }
    }

    // Default: show trailing widget
    if (widget.trailing != null) {
      return widget.trailing!;
    }

    // Fallback: show status if available
    if (widget.status != null) {
      return widget.status!;
    }

    return const SizedBox.shrink();
  }
}
