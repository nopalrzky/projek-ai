import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_empty_state_types.dart';

class AppEmptyState extends StatelessWidget {
  final String title;
  final String? description;
  final IconData? icon;
  final Widget? customIcon;
  final AppEmptyStateVariant variant;
  final AppEmptyStateSize size;
  final Widget? action;

  const AppEmptyState({
    super.key,
    required this.title,
    this.description,
    this.icon,
    this.customIcon,
    this.variant = AppEmptyStateVariant.generic,
    this.size = AppEmptyStateSize.md,
    this.action,
  });

  const AppEmptyState.search({
    super.key,
    required this.title,
    this.description,
    this.icon,
    this.customIcon,
    this.size = AppEmptyStateSize.md,
    this.action,
  }) : variant = AppEmptyStateVariant.search;

  const AppEmptyState.order({
    super.key,
    required this.title,
    this.description,
    this.icon,
    this.customIcon,
    this.size = AppEmptyStateSize.md,
    this.action,
  }) : variant = AppEmptyStateVariant.order;

  const AppEmptyState.customer({
    super.key,
    required this.title,
    this.description,
    this.icon,
    this.customIcon,
    this.size = AppEmptyStateSize.md,
    this.action,
  }) : variant = AppEmptyStateVariant.customer;

  const AppEmptyState.error({
    super.key,
    required this.title,
    this.description,
    this.icon,
    this.customIcon,
    this.size = AppEmptyStateSize.md,
    this.action,
  }) : variant = AppEmptyStateVariant.error;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: size.maxWidth),
        child: Padding(
          padding: _getPadding(context),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildIcon(context),
              SizedBox(height: _getVerticalGap(context)),
              _buildTitle(context),
              if (description != null) ...[
                SizedBox(height: context.space.xs),
                _buildDescription(context),
              ],
              if (action != null) ...[
                SizedBox(height: context.space.lg),
                action!,
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIcon(BuildContext context) {
    final iconColor = _getIconColor(context);
    final containerBg = switch (variant) {
      AppEmptyStateVariant.generic ||
      AppEmptyStateVariant.search => context.colors.iconContainerNeutral,
      AppEmptyStateVariant.order ||
      AppEmptyStateVariant.customer => context.colors.iconContainerPrimary,
      AppEmptyStateVariant.error => context.colors.iconContainerError,
    };
    final containerSize = size.iconSize < 64 ? 64.0 : size.iconSize;

    return Container(
      width: containerSize,
      height: containerSize,
      decoration: BoxDecoration(
        color: containerBg,
        borderRadius: BorderRadius.circular(containerSize * 0.25),
      ),
      child: IconTheme(
        data: IconThemeData(size: size.iconSize, color: iconColor),
        child: customIcon ?? Icon(icon ?? variant.defaultIcon),
      ),
    );
  }

  Widget _buildTitle(BuildContext context) {
    final style = switch (size) {
      AppEmptyStateSize.sm => context.typography.labelLarge,
      AppEmptyStateSize.md => context.typography.headlineMedium,
      AppEmptyStateSize.lg => context.typography.headlineLarge,
    };

    return Text(
      title,
      style: style.copyWith(
        color: context.colors.textPrimary,
        fontWeight: FontWeight.w600,
      ),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildDescription(BuildContext context) {
    final style = switch (size) {
      AppEmptyStateSize.sm => context.typography.bodySmall,
      AppEmptyStateSize.md => context.typography.bodyMedium,
      AppEmptyStateSize.lg => context.typography.bodyLarge,
    };

    return Text(
      description!,
      style: style.copyWith(color: context.colors.textSecondary),
      textAlign: TextAlign.center,
    );
  }

  Color _getIconColor(BuildContext context) {
    return switch (variant) {
      AppEmptyStateVariant.generic ||
      AppEmptyStateVariant.search => context.colors.textTertiary,
      AppEmptyStateVariant.order ||
      AppEmptyStateVariant.customer => context.colors.primary,
      AppEmptyStateVariant.error => context.colors.error,
    };
  }

  double _getVerticalGap(BuildContext context) {
    return switch (size) {
      AppEmptyStateSize.sm => context.space.sm,
      AppEmptyStateSize.md => context.space.md,
      AppEmptyStateSize.lg => context.space.lg,
    };
  }

  EdgeInsetsGeometry _getPadding(BuildContext context) {
    return switch (size) {
      AppEmptyStateSize.sm => EdgeInsets.all(context.space.md),
      AppEmptyStateSize.md => EdgeInsets.all(context.space.lg),
      AppEmptyStateSize.lg => EdgeInsets.all(context.space.xl),
    };
  }
}
