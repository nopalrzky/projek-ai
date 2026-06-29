import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import '../empty_state/app_empty_state_types.dart';

class AppErrorState extends StatelessWidget {
  final String message;
  final String? title;
  final VoidCallback? onRetry;
  final String? retryText;
  final IconData? icon;
  final AppEmptyStateSize size;

  const AppErrorState({
    super.key,
    required this.message,
    this.title,
    this.onRetry,
    this.retryText,
    this.icon,
    this.size = AppEmptyStateSize.md,
  });

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
              SizedBox(height: context.space.xs),
              _buildMessage(context),
              if (onRetry != null) ...[
                SizedBox(height: context.space.lg),
                _buildRetryButton(context),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIcon(BuildContext context) {
    const containerSize = 64.0;
    return Container(
      width: containerSize,
      height: containerSize,
      decoration: BoxDecoration(
        color: context.colors.iconContainerError,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Icon(
        icon ?? Icons.error_outline_rounded,
        size: size.iconSize,
        color: context.colors.error,
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
      title ?? 'Terjadi Kesalahan',
      style: style.copyWith(
        color: context.colors.textPrimary,
        fontWeight: FontWeight.w600,
      ),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildMessage(BuildContext context) {
    final style = switch (size) {
      AppEmptyStateSize.sm => context.typography.bodySmall,
      AppEmptyStateSize.md => context.typography.bodyMedium,
      AppEmptyStateSize.lg => context.typography.bodyLarge,
    };

    return Text(
      message,
      style: style.copyWith(color: context.colors.textSecondary),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildRetryButton(BuildContext context) {
    final isSmall = size == AppEmptyStateSize.sm;

    if (isSmall) {
      return TextButton(
        onPressed: onRetry,
        style: TextButton.styleFrom(foregroundColor: context.colors.primary),
        child: Text(retryText ?? 'Coba Lagi'),
      );
    }

    return ElevatedButton(
      onPressed: onRetry,
      style: ElevatedButton.styleFrom(
        backgroundColor: context.colors.primary,
        foregroundColor: context.colors.onPrimary,
        padding: EdgeInsets.symmetric(
          horizontal: context.space.xl,
          vertical: context.space.md,
        ),
      ),
      child: Text(retryText ?? 'Coba Lagi'),
    );
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
