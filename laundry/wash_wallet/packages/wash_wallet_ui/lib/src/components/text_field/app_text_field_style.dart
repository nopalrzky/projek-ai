import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_text_field_variant.dart';
import 'app_text_field_size.dart';

@immutable
class AppTextFieldStyle {
  final AppTextFieldVariant variant;
  final AppTextFieldSize size;
  final bool isEnabled;
  final bool isFocused;
  final bool isError;
  final bool isSuccess;
  final BuildContext context;

  const AppTextFieldStyle({
    required this.variant,
    required this.size,
    required this.isEnabled,
    required this.isFocused,
    required this.isError,
    required this.isSuccess,
    required this.context,
  });

  Color? get fillColor {
    if (!isEnabled) {
      return context.colors.disabled;
    }

    switch (variant) {
      case AppTextFieldVariant.filled:
        return context.colors.surfaceVariant;
      case AppTextFieldVariant.defaultVariant:
      case AppTextFieldVariant.outlined:
      case AppTextFieldVariant.danger:
      case AppTextFieldVariant.success:
        return Colors.transparent;
    }
  }

  Color get borderColor {
    if (!isEnabled) {
      return context.colors.disabledBorder;
    }

    if (isError || variant == AppTextFieldVariant.danger) {
      return context.colors.error;
    }

    if (isSuccess || variant == AppTextFieldVariant.success) {
      return context.colors.success;
    }

    if (isFocused) {
      return context.colors.primary;
    }

    switch (variant) {
      case AppTextFieldVariant.defaultVariant:
        return context.colors.border;
      case AppTextFieldVariant.outlined:
        return context.colors.borderStrong;
      case AppTextFieldVariant.filled:
        return Colors.transparent;
      case AppTextFieldVariant.danger:
        return context.colors.error;
      case AppTextFieldVariant.success:
        return context.colors.success;
    }
  }

  Color get focusedBorderColor {
    if (isError || variant == AppTextFieldVariant.danger) {
      return context.colors.errorDark;
    }

    if (isSuccess || variant == AppTextFieldVariant.success) {
      return context.colors.successDark;
    }

    return context.colors.primary;
  }

  Color get textColor {
    if (!isEnabled) {
      return context.colors.textDisabled;
    }
    return context.colors.textPrimary;
  }

  Color get hintColor {
    return context.colors.textTertiary;
  }

  Color get labelColor {
    if (!isEnabled) {
      return context.colors.textDisabled;
    }

    if (isError || variant == AppTextFieldVariant.danger) {
      return context.colors.error;
    }

    if (isSuccess || variant == AppTextFieldVariant.success) {
      return context.colors.success;
    }

    if (isFocused) {
      return context.colors.primary;
    }

    return context.colors.textSecondary;
  }

  Color get errorColor {
    return context.colors.error;
  }

  Color get successColor {
    return context.colors.success;
  }

  Color get iconColor {
    if (!isEnabled) {
      return context.colors.textDisabled;
    }

    if (isError || variant == AppTextFieldVariant.danger) {
      return context.colors.error;
    }

    if (isSuccess || variant == AppTextFieldVariant.success) {
      return context.colors.success;
    }

    return context.colors.textSecondary;
  }

  TextStyle get textStyle {
    return context.typography.bodyMedium.copyWith(color: textColor);
  }

  TextStyle get hintStyle {
    return context.typography.bodyMedium.copyWith(color: hintColor);
  }

  TextStyle get labelStyle {
    return context.typography.labelMedium.copyWith(color: labelColor);
  }

  TextStyle get errorStyle {
    return context.typography.caption.copyWith(color: errorColor);
  }

  TextStyle get helperStyle {
    return context.typography.caption.copyWith(color: successColor);
  }

  BorderRadius get borderRadius {
    switch (size) {
      case AppTextFieldSize.sm:
        return context.radius.all.sm;
      case AppTextFieldSize.md:
        return context.radius.all.md;
      case AppTextFieldSize.lg:
        return context.radius.all.md;
    }
  }

  EdgeInsets get contentPadding {
    final horizontal = size.contentPadding;
    final vertical = context.space.md;

    return EdgeInsets.symmetric(horizontal: horizontal, vertical: vertical);
  }

  double get borderWidth {
    switch (variant) {
      case AppTextFieldVariant.defaultVariant:
        return 1.0;
      case AppTextFieldVariant.outlined:
        return 1.5;
      case AppTextFieldVariant.filled:
        return 0;
      case AppTextFieldVariant.danger:
      case AppTextFieldVariant.success:
        return 1.5;
    }
  }

  double get focusedBorderWidth {
    return borderWidth + 0.5;
  }

  InputDecoration decoration({
    String? label,
    String? hint,
    String? errorText,
    String? helperText,
    Widget? prefixIcon,
    Widget? suffixIcon,
    String? suffixText,
  }) {
    return InputDecoration(
      labelText: label,
      labelStyle: labelStyle,
      hintText: hint,
      hintStyle: hintStyle,
      errorText: errorText,
      errorStyle: errorStyle,
      errorMaxLines: 2,
      helperText: helperText,
      helperStyle: helperStyle,
      helperMaxLines: 2,
      prefixIcon: prefixIcon != null
          ? IconTheme(
              data: IconThemeData(color: iconColor, size: 20),
              child: prefixIcon,
            )
          : null,
      suffixIcon: suffixIcon != null
          ? IconTheme(
              data: IconThemeData(color: iconColor, size: 20),
              child: suffixIcon,
            )
          : null,
      suffixText: suffixText,
      suffixStyle: textStyle,
      filled: fillColor != null,
      fillColor: fillColor,
      contentPadding: contentPadding,
      border: _buildBorder(),
      enabledBorder: _buildBorder(),
      focusedBorder: _buildFocusedBorder(),
      errorBorder: _buildErrorBorder(),
      focusedErrorBorder: _buildFocusedErrorBorder(),
      disabledBorder: _buildDisabledBorder(),
      constraints: BoxConstraints(minHeight: size.height),
    );
  }

  OutlineInputBorder _buildBorder() {
    return OutlineInputBorder(
      borderRadius: borderRadius,
      borderSide: BorderSide(color: borderColor, width: borderWidth),
    );
  }

  OutlineInputBorder _buildFocusedBorder() {
    return OutlineInputBorder(
      borderRadius: borderRadius,
      borderSide: BorderSide(
        color: focusedBorderColor,
        width: focusedBorderWidth,
      ),
    );
  }

  OutlineInputBorder _buildErrorBorder() {
    return OutlineInputBorder(
      borderRadius: borderRadius,
      borderSide: BorderSide(color: errorColor, width: borderWidth),
    );
  }

  OutlineInputBorder _buildFocusedErrorBorder() {
    return OutlineInputBorder(
      borderRadius: borderRadius,
      borderSide: BorderSide(color: errorColor, width: focusedBorderWidth),
    );
  }

  OutlineInputBorder _buildDisabledBorder() {
    return OutlineInputBorder(
      borderRadius: borderRadius,
      borderSide: BorderSide(
        color: context.colors.disabledBorder,
        width: borderWidth,
      ),
    );
  }
}
