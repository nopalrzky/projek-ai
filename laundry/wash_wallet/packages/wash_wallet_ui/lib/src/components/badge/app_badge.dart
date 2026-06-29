import 'package:flutter/material.dart';
import 'app_badge_variant.dart';
import 'app_badge_size.dart';
import 'app_badge_mode.dart';
import 'app_badge_style.dart';

class AppBadge extends StatelessWidget {
  final String label;
  final IconData? icon;
  final AppBadgeVariant variant;
  final AppBadgeSize size;
  final AppBadgeMode mode;

  const AppBadge._({
    super.key,
    required this.label,
    required this.variant,
    this.icon,
    this.size = AppBadgeSize.md,
    this.mode = AppBadgeMode.solid,
  });

  const AppBadge({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeSize size = AppBadgeSize.md,
    AppBadgeMode mode = AppBadgeMode.solid,
  }) : this._(
         key: key,
         label: label,
         variant: AppBadgeVariant.defaultVariant,
         icon: icon,
         size: size,
         mode: mode,
       );

  const AppBadge.primary({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeSize size = AppBadgeSize.md,
    AppBadgeMode mode = AppBadgeMode.solid,
  }) : this._(
         key: key,
         label: label,
         variant: AppBadgeVariant.primary,
         icon: icon,
         size: size,
         mode: mode,
       );

  const AppBadge.success({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeSize size = AppBadgeSize.md,
    AppBadgeMode mode = AppBadgeMode.solid,
  }) : this._(
         key: key,
         label: label,
         variant: AppBadgeVariant.success,
         icon: icon,
         size: size,
         mode: mode,
       );

  const AppBadge.warning({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeSize size = AppBadgeSize.md,
    AppBadgeMode mode = AppBadgeMode.solid,
  }) : this._(
         key: key,
         label: label,
         variant: AppBadgeVariant.warning,
         icon: icon,
         size: size,
         mode: mode,
       );

  const AppBadge.danger({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeSize size = AppBadgeSize.md,
    AppBadgeMode mode = AppBadgeMode.solid,
  }) : this._(
         key: key,
         label: label,
         variant: AppBadgeVariant.danger,
         icon: icon,
         size: size,
         mode: mode,
       );

  const AppBadge.info({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeSize size = AppBadgeSize.md,
    AppBadgeMode mode = AppBadgeMode.solid,
  }) : this._(
         key: key,
         label: label,
         variant: AppBadgeVariant.info,
         icon: icon,
         size: size,
         mode: mode,
       );

  const AppBadge.neutral({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeSize size = AppBadgeSize.md,
    AppBadgeMode mode = AppBadgeMode.solid,
  }) : this._(
         key: key,
         label: label,
         variant: AppBadgeVariant.neutral,
         icon: icon,
         size: size,
         mode: mode,
       );

  const AppBadge.soft({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeVariant variant = AppBadgeVariant.defaultVariant,
    AppBadgeSize size = AppBadgeSize.md,
  }) : this._(
         key: key,
         label: label,
         variant: variant,
         icon: icon,
         size: size,
         mode: AppBadgeMode.soft,
       );

  const AppBadge.outline({
    Key? key,
    required String label,
    IconData? icon,
    AppBadgeVariant variant = AppBadgeVariant.defaultVariant,
    AppBadgeSize size = AppBadgeSize.md,
  }) : this._(
         key: key,
         label: label,
         variant: variant,
         icon: icon,
         size: size,
         mode: AppBadgeMode.outline,
       );

  @override
  Widget build(BuildContext context) {
    final style = AppBadgeStyle(
      variant: variant,
      size: size,
      mode: mode,
      context: context,
    );

    return Container(
      height: style.height,
      constraints: const BoxConstraints(minWidth: 40),
      padding: style.padding,
      decoration: style.decoration,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (icon != null) ...[
            Icon(icon, size: style.iconSize, color: style.iconColor),
            SizedBox(width: style.iconGap),
          ],
          Text(
            label,
            style: style.textStyle,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
