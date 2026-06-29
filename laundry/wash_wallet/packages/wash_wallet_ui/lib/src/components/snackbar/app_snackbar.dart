import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/extensions/app_spacing_extension.dart';
import 'app_snackbar_variant.dart';
import 'app_snackbar_style.dart';

class AppSnackbar {
  static const Duration _defaultDuration = Duration(milliseconds: 3200);

  const AppSnackbar._();

  static void success(
    BuildContext context, {
    String? title,
    required String message,
    String? actionLabel,
    VoidCallback? onActionPressed,
    Duration? duration,
  }) {
    HapticFeedback.mediumImpact();
    _show(
      context,
      variant: AppSnackbarVariant.success,
      title: title,
      message: message,
      actionLabel: actionLabel,
      onActionPressed: onActionPressed,
      duration: duration,
    );
  }

  static void info(
    BuildContext context, {
    String? title,
    required String message,
    String? actionLabel,
    VoidCallback? onActionPressed,
    Duration? duration,
  }) => _show(
    context,
    variant: AppSnackbarVariant.info,
    title: title,
    message: message,
    actionLabel: actionLabel,
    onActionPressed: onActionPressed,
    duration: duration,
  );

  static void warning(
    BuildContext context, {
    String? title,
    required String message,
    String? actionLabel,
    VoidCallback? onActionPressed,
    Duration? duration,
  }) => _show(
    context,
    variant: AppSnackbarVariant.warning,
    title: title,
    message: message,
    actionLabel: actionLabel,
    onActionPressed: onActionPressed,
    duration: duration,
  );

  static void error(
    BuildContext context, {
    String? title,
    required String message,
    String? actionLabel,
    VoidCallback? onActionPressed,
    Duration? duration,
  }) {
    HapticFeedback.heavyImpact();
    _show(
      context,
      variant: AppSnackbarVariant.error,
      title: title,
      message: message,
      actionLabel: actionLabel,
      onActionPressed: onActionPressed,
      duration: duration,
    );
  }

  static void _show(
    BuildContext context, {
    required AppSnackbarVariant variant,
    required String message,
    String? title,
    String? actionLabel,
    VoidCallback? onActionPressed,
    Duration? duration,
  }) {
    final messenger = ScaffoldMessenger.of(context);
    messenger.clearSnackBars();

    final style = AppSnackbarStyle(context: context, variant: variant);

    final snackBar = SnackBar(
      duration: duration ?? _defaultDuration,
      behavior: SnackBarBehavior.floating,
      backgroundColor: Colors.transparent,
      elevation: 0,
      margin: EdgeInsets.fromLTRB(
        context.space.lg,
        0,
        context.space.lg,
        context.space.lg,
      ),
      padding: EdgeInsets.zero,
      content: _AppSnackbarBody(
        style: style,
        title: title,
        message: message,
        actionLabel: actionLabel,
        onActionPressed: onActionPressed,
      ),
    );

    messenger.showSnackBar(snackBar);
  }
}

class _AppSnackbarBody extends StatelessWidget {
  final AppSnackbarStyle style;
  final String? title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onActionPressed;

  const _AppSnackbarBody({
    required this.style,
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onActionPressed,
  });

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: style.backgroundColor,
        borderRadius: style.borderRadius,
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: style.horizontalPadding,
          vertical: style.verticalPadding,
        ),
        child: Row(
          children: [
            Icon(style.icon, color: style.iconColor, size: style.iconSize),
            SizedBox(width: style.gap),
            Expanded(child: _buildTexts(context)),
            if (_hasAction) ...[
              SizedBox(width: style.gap),
              _AppSnackbarActionButton(
                label: actionLabel!,
                onPressed: onActionPressed!,
                textStyle: style.actionTextStyle,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTexts(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (title != null && title!.isNotEmpty) ...[
          Text(
            title!,
            style: style.titleTextStyle,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: style.gap / 2),
        ],
        Text(
          message,
          style: style.messageTextStyle,
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  bool get _hasAction => actionLabel != null && onActionPressed != null;
}

class _AppSnackbarActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final TextStyle textStyle;

  const _AppSnackbarActionButton({
    required this.label,
    required this.onPressed,
    required this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    return TextButton(
      style: TextButton.styleFrom(
        padding: EdgeInsets.symmetric(
          horizontal: context.space.md,
          vertical: context.space.xs,
        ),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      onPressed: onPressed,
      child: Text(label, style: textStyle),
    );
  }
}
