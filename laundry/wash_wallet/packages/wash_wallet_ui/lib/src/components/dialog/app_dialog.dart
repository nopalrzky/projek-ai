import 'package:flutter/material.dart';
import '../../theme/extensions/app_radius_extension.dart';
import '../../theme/extensions/app_spacing_extension.dart';
import '../button/app_button.dart';
import 'app_dialog_layout.dart';
import 'app_dialog_style.dart';
import 'app_dialog_variant.dart';

class AppDialog {
  const AppDialog._();

  static Future<bool?> confirm(
    BuildContext context, {
    String? title,
    required String message,
    String? confirmLabel,
    String? cancelLabel,
  }) {
    return _show(
      context,
      variant: AppDialogVariant.confirm,
      title: title,
      message: message,
      confirmLabel: confirmLabel,
      cancelLabel: cancelLabel,
    );
  }

  static Future<bool?> destructive(
    BuildContext context, {
    String? title,
    required String message,
    String? confirmLabel,
    String? cancelLabel,
  }) {
    return _show(
      context,
      variant: AppDialogVariant.destructive,
      title: title,
      message: message,
      confirmLabel: confirmLabel,
      cancelLabel: cancelLabel,
    );
  }

  static Future<bool?> info(
    BuildContext context, {
    String? title,
    required String message,
    String? confirmLabel,
  }) {
    return _show(
      context,
      variant: AppDialogVariant.info,
      title: title,
      message: message,
      confirmLabel: confirmLabel,
    );
  }

  static Future<bool?> _show(
    BuildContext context, {
    required AppDialogVariant variant,
    required String message,
    String? title,
    String? confirmLabel,
    String? cancelLabel,
  }) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => _AppDialogContent(
        variant: variant,
        title: title,
        message: message,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
      ),
    );
  }
}

class _AppDialogContent extends StatelessWidget {
  final AppDialogVariant variant;
  final String? title;
  final String message;
  final String? confirmLabel;
  final String? cancelLabel;

  const _AppDialogContent({
    required this.variant,
    required this.title,
    required this.message,
    required this.confirmLabel,
    required this.cancelLabel,
  });

  @override
  Widget build(BuildContext context) {
    final style = AppDialogStyle(context: context, variant: variant);
    final resolvedConfirm = confirmLabel ?? style.defaultConfirmLabel;
    final resolvedCancel = cancelLabel ?? style.defaultCancelLabel;

    return Dialog(
      backgroundColor: style.backgroundColor,
      insetPadding: AppDialogLayout.insetPadding(context),
      shape: RoundedRectangleBorder(borderRadius: style.borderRadius),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: AppDialogLayout.maxWidth(context),
        ),
        child: Padding(
          padding: AppDialogLayout.contentPadding(context),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context, style),
              SizedBox(height: AppDialogLayout.sectionSpacing(context)),
              if (title != null && title!.isNotEmpty) ...[
                Text(title!, style: style.titleTextStyle),
                SizedBox(height: AppDialogLayout.titleSpacing(context)),
              ],
              Text(message, style: style.messageTextStyle),
              SizedBox(height: AppDialogLayout.actionsTopSpacing(context)),
              Align(
                alignment: Alignment.centerRight,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (resolvedCancel != null) ...[
                      AppButton.outline(
                        label: resolvedCancel,
                        onPressed: () => Navigator.of(context).pop(false),
                      ),
                      SizedBox(width: AppDialogLayout.buttonGap(context)),
                    ],
                    _buildPrimaryButton(context, style, resolvedConfirm),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, AppDialogStyle style) {
    final size = AppDialogLayout.iconContainerSize(context);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: style.iconBackground,
        borderRadius: context.radius.all.full,
      ),
      child: Icon(style.icon, color: style.accentColor, size: context.space.lg),
    );
  }

  Widget _buildPrimaryButton(
    BuildContext context,
    AppDialogStyle style,
    String label,
  ) {
    switch (variant) {
      case AppDialogVariant.destructive:
        return AppButton.danger(
          label: label,
          onPressed: () => Navigator.of(context).pop(true),
        );
      case AppDialogVariant.confirm:
      case AppDialogVariant.info:
        return AppButton.primary(
          label: label,
          onPressed: () => Navigator.of(context).pop(true),
        );
    }
  }
}
