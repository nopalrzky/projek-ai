import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import '../empty_state/app_empty_state_types.dart';

class AppLoadingIndicator extends StatelessWidget {
  final String? message;
  final AppEmptyStateSize size;
  final Color? color;

  const AppLoadingIndicator({
    super.key,
    this.message,
    this.size = AppEmptyStateSize.md,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildSpinner(context),
          if (message != null) ...[
            SizedBox(height: _getVerticalGap(context)),
            _buildMessage(context),
          ],
        ],
      ),
    );
  }

  Widget _buildSpinner(BuildContext context) {
    final spinnerSize = switch (size) {
      AppEmptyStateSize.sm => 24.0,
      AppEmptyStateSize.md => 32.0,
      AppEmptyStateSize.lg => 48.0,
    };

    final strokeWidth = switch (size) {
      AppEmptyStateSize.sm => 2.5,
      AppEmptyStateSize.md => 3.0,
      AppEmptyStateSize.lg => 4.0,
    };

    return SizedBox(
      width: spinnerSize,
      height: spinnerSize,
      child: CircularProgressIndicator(
        strokeWidth: strokeWidth,
        color: color ?? context.colors.primary,
      ),
    );
  }

  Widget _buildMessage(BuildContext context) {
    final style = switch (size) {
      AppEmptyStateSize.sm => context.typography.bodySmall,
      AppEmptyStateSize.md => context.typography.bodyMedium,
      AppEmptyStateSize.lg => context.typography.bodyLarge,
    };

    return Text(
      message!,
      style: style.copyWith(
        color: context.colors.textSecondary,
        fontWeight: FontWeight.w500,
      ),
      textAlign: TextAlign.center,
    );
  }

  double _getVerticalGap(BuildContext context) {
    return switch (size) {
      AppEmptyStateSize.sm => context.space.sm,
      AppEmptyStateSize.md => context.space.md,
      AppEmptyStateSize.lg => context.space.lg,
    };
  }
}
