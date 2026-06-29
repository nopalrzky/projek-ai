import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_dialog_variant.dart';

@immutable
class AppDialogStyle {
  final BuildContext context;
  final AppDialogVariant variant;

  const AppDialogStyle({required this.context, required this.variant});

  Color get backgroundColor => context.colors.surface;

  Color get titleColor => context.colors.textPrimary;

  Color get messageColor => context.colors.textSecondary;

  Color get accentColor {
    switch (variant) {
      case AppDialogVariant.confirm:
        return context.colors.primary;
      case AppDialogVariant.destructive:
        return context.colors.error;
      case AppDialogVariant.info:
        return context.colors.info;
    }
  }

  Color get iconBackground => accentColor.withValues(alpha: 0.12);

  IconData get icon {
    switch (variant) {
      case AppDialogVariant.confirm:
        return Icons.help_outline;
      case AppDialogVariant.destructive:
        return Icons.warning_amber_rounded;
      case AppDialogVariant.info:
        return Icons.info_outline;
    }
  }

  TextStyle get titleTextStyle => context.typography.labelMedium.copyWith(
    color: titleColor,
    fontWeight: FontWeight.w700,
  );

  TextStyle get messageTextStyle =>
      context.typography.bodyMedium.copyWith(color: messageColor);

  BorderRadius get borderRadius => context.radius.all.lg;

  String get defaultConfirmLabel {
    switch (variant) {
      case AppDialogVariant.confirm:
        return 'Konfirmasi';
      case AppDialogVariant.destructive:
        return 'Lanjutkan';
      case AppDialogVariant.info:
        return 'Mengerti';
    }
  }

  String? get defaultCancelLabel {
    switch (variant) {
      case AppDialogVariant.confirm:
      case AppDialogVariant.destructive:
        return 'Batal';
      case AppDialogVariant.info:
        return null;
    }
  }
}
