import 'package:flutter/material.dart';
import 'app_card_variant.dart';
import 'app_card_size.dart';
import 'app_card_style.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final AppCardVariant variant;
  final AppCardSize size;
  final bool isEnabled;
  final bool isSelected;
  final VoidCallback? onTap;
  final EdgeInsets? margin;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;
  final Color? borderColor;
  final Color? backgroundColor;
  final List<BoxShadow> elevation;

  const AppCard._({
    super.key,
    required this.child,
    required this.variant,
    this.size = AppCardSize.md,
    this.isEnabled = true,
    this.isSelected = false,
    this.onTap,
    this.margin,
    this.padding,
    this.width,
    this.height,
    this.borderColor,
    this.backgroundColor,
    this.elevation = const [],
  });

  const AppCard({
    Key? key,
    required Widget child,
    AppCardSize size = AppCardSize.md,
    bool isEnabled = true,
    bool isSelected = false,
    VoidCallback? onTap,
    EdgeInsets? margin,
    EdgeInsetsGeometry? padding,
    double? width,
    double? height,
    Color? borderColor,
    Color? backgroundColor,
  }) : this._(
         key: key,
         child: child,
         variant: AppCardVariant.surface,
         size: size,
         isEnabled: isEnabled,
         isSelected: isSelected,
         onTap: onTap,
         margin: margin,
         padding: padding,
         width: width,
         height: height,
         borderColor: borderColor,
         backgroundColor: backgroundColor,
       );

  const AppCard.info({
    Key? key,
    required Widget child,
    AppCardSize size = AppCardSize.md,
    bool isEnabled = true,
    bool isSelected = false,
    VoidCallback? onTap,
    EdgeInsets? margin,
    EdgeInsetsGeometry? padding,
    double? width,
    double? height,
    Color? borderColor,
    Color? backgroundColor,
  }) : this._(
         key: key,
         child: child,
         variant: AppCardVariant.info,
         size: size,
         isEnabled: isEnabled,
         isSelected: isSelected,
         onTap: onTap,
         margin: margin,
         padding: padding,
         width: width,
         height: height,
         borderColor: borderColor,
         backgroundColor: backgroundColor,
       );

  const AppCard.outlined({
    Key? key,
    required Widget child,
    AppCardSize size = AppCardSize.md,
    bool isEnabled = true,
    bool isSelected = false,
    VoidCallback? onTap,
    EdgeInsets? margin,
    EdgeInsetsGeometry? padding,
    double? width,
    double? height,
    Color? borderColor,
    Color? backgroundColor,
  }) : this._(
         key: key,
         child: child,
         variant: AppCardVariant.outlined,
         size: size,
         isEnabled: isEnabled,
         isSelected: isSelected,
         onTap: onTap,
         margin: margin,
         padding: padding,
         width: width,
         height: height,
         borderColor: borderColor,
         backgroundColor: backgroundColor,
       );

  const AppCard.elevated({
    Key? key,
    required Widget child,
    AppCardSize size = AppCardSize.md,
    bool isEnabled = true,
    bool isSelected = false,
    VoidCallback? onTap,
    EdgeInsets? margin,
    EdgeInsetsGeometry? padding,
    double? width,
    double? height,
    Color? borderColor,
    Color? backgroundColor,
  }) : this._(
         key: key,
         child: child,
         variant: AppCardVariant.elevated,
         size: size,
         isEnabled: isEnabled,
         isSelected: isSelected,
         onTap: onTap,
         margin: margin,
         padding: padding,
         width: width,
         height: height,
         borderColor: borderColor,
         backgroundColor: backgroundColor,
       );

  const AppCard.filled({
    Key? key,
    required Widget child,
    AppCardSize size = AppCardSize.md,
    bool isEnabled = true,
    bool isSelected = false,
    VoidCallback? onTap,
    EdgeInsets? margin,
    EdgeInsetsGeometry? padding,
    double? width,
    double? height,
    Color? borderColor,
    Color? backgroundColor,
  }) : this._(
         key: key,
         child: child,
         variant: AppCardVariant.filled,
         size: size,
         isEnabled: isEnabled,
         isSelected: isSelected,
         onTap: onTap,
         margin: margin,
         padding: padding,
         width: width,
         height: height,
         borderColor: borderColor,
         backgroundColor: backgroundColor,
       );

  const AppCard.danger({
    Key? key,
    required Widget child,
    AppCardSize size = AppCardSize.md,
    bool isEnabled = true,
    bool isSelected = false,
    VoidCallback? onTap,
    EdgeInsets? margin,
    double? width,
    double? height,
    Color? borderColor,
    Color? backgroundColor,
  }) : this._(
         key: key,
         child: child,
         variant: AppCardVariant.danger,
         size: size,
         isEnabled: isEnabled,
         isSelected: isSelected,
         onTap: onTap,
         margin: margin,
         width: width,
         height: height,
         borderColor: borderColor,
         backgroundColor: backgroundColor,
       );

  const AppCard.success({
    Key? key,
    required Widget child,
    AppCardSize size = AppCardSize.md,
    bool isEnabled = true,
    bool isSelected = false,
    VoidCallback? onTap,
    EdgeInsets? margin,
    double? width,
    double? height,
    Color? borderColor,
    Color? backgroundColor,
  }) : this._(
         key: key,
         child: child,
         variant: AppCardVariant.success,
         size: size,
         isEnabled: isEnabled,
         isSelected: isSelected,
         onTap: onTap,
         margin: margin,
         width: width,
         height: height,
         borderColor: borderColor,
         backgroundColor: backgroundColor,
       );

  @override
  Widget build(BuildContext context) {
    final style = AppCardStyle(
      variant: variant,
      size: size,
      isEnabled: isEnabled,
      isSelected: isSelected,
      context: context,
      customShadow: elevation.isNotEmpty ? elevation : null,
    );

    Widget card = Container(
      width: width,
      height: height,
      padding: padding ?? style.padding,
      decoration: style.decoration.copyWith(
        color: backgroundColor,
        border: borderColor != null
            ? Border.all(
                color: borderColor!,
                width: style.borderWidth > 0 ? style.borderWidth : 1.0,
              )
            : null,
      ),
      child: child,
    );

    if (onTap != null && isEnabled) {
      card = Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: style.borderRadius,
          child: card,
        ),
      );
    }

    if (margin != null) {
      card = Padding(padding: margin!, child: card);
    }

    return card;
  }
}
