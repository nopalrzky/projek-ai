import 'package:flutter/material.dart';
import '../../theme/extensions/app_spacing_extension.dart';
import 'app_button.dart';
import 'app_button_size.dart';

class AppButtonTheme {
  AppButtonTheme._();

  static Widget dialogActions({
    required BuildContext context,
    required String cancelLabel,
    required String confirmLabel,
    VoidCallback? onCancel,
    VoidCallback? onConfirm,
    bool isConfirmLoading = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        AppButton.outline(
          label: cancelLabel,
          size: AppButtonSize.md,
          onPressed: onCancel,
        ),
        SizedBox(width: context.space.md),
        AppButton.primary(
          label: confirmLabel,
          size: AppButtonSize.md,
          onPressed: onConfirm,
          isLoading: isConfirmLoading,
        ),
      ],
    );
  }

  static Widget fullWidthPrimary({
    required String label,
    VoidCallback? onPressed,
    bool isLoading = false,
    Widget? icon,
  }) {
    return AppButton.primary(
      label: label,
      onPressed: onPressed,
      isLoading: isLoading,
      icon: icon,
      isFullWidth: true,
      size: AppButtonSize.lg,
    );
  }

  static Widget deleteConfirmation({
    required BuildContext context,
    VoidCallback? onCancel,
    VoidCallback? onDelete,
    bool isDeleteLoading = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        AppButton.outline(
          label: 'Batal',
          size: AppButtonSize.md,
          onPressed: onCancel,
        ),
        SizedBox(width: context.space.md),
        AppButton.danger(
          label: 'Hapus',
          size: AppButtonSize.md,
          onPressed: onDelete,
          isLoading: isDeleteLoading,
        ),
      ],
    );
  }
}
