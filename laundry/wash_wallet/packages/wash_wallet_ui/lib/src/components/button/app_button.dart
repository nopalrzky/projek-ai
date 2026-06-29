import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_button_variant.dart';
import 'app_button_size.dart';
import 'app_button_style.dart';

class AppButton extends StatelessWidget {
  final String? label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isLoading;
  final Widget? icon;
  final bool isFullWidth;
  final String? tooltip;
  final bool isIconOnly;

  const AppButton._({
    super.key,
    this.label,
    required this.variant,
    this.onPressed,
    this.size = AppButtonSize.md,
    this.isLoading = false,
    this.icon,
    this.isFullWidth = false,
    this.tooltip,
    this.isIconOnly = false,
  });

  const AppButton.primary({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    AppButtonSize size = AppButtonSize.md,
    bool isLoading = false,
    Widget? icon,
    bool isFullWidth = false,
  }) : this._(
         key: key,
         label: label,
         variant: AppButtonVariant.primary,
         onPressed: onPressed,
         size: size,
         isLoading: isLoading,
         icon: icon,
         isFullWidth: isFullWidth,
       );

  const AppButton.secondary({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    AppButtonSize size = AppButtonSize.md,
    bool isLoading = false,
    Widget? icon,
    bool isFullWidth = false,
  }) : this._(
         key: key,
         label: label,
         variant: AppButtonVariant.secondary,
         onPressed: onPressed,
         size: size,
         isLoading: isLoading,
         icon: icon,
         isFullWidth: isFullWidth,
       );

  const AppButton.tonal({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    AppButtonSize size = AppButtonSize.md,
    bool isLoading = false,
    Widget? icon,
    bool isFullWidth = false,
  }) : this._(
         key: key,
         label: label,
         variant: AppButtonVariant.tonal,
         onPressed: onPressed,
         size: size,
         isLoading: isLoading,
         icon: icon,
         isFullWidth: isFullWidth,
       );

  const AppButton.outline({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    AppButtonSize size = AppButtonSize.md,
    bool isLoading = false,
    Widget? icon,
    bool isFullWidth = false,
  }) : this._(
         key: key,
         label: label,
         variant: AppButtonVariant.outline,
         onPressed: onPressed,
         size: size,
         isLoading: isLoading,
         icon: icon,
         isFullWidth: isFullWidth,
       );

  const AppButton.ghost({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    AppButtonSize size = AppButtonSize.md,
    bool isLoading = false,
    Widget? icon,
    bool isFullWidth = false,
  }) : this._(
         key: key,
         label: label,
         variant: AppButtonVariant.ghost,
         onPressed: onPressed,
         size: size,
         isLoading: isLoading,
         icon: icon,
         isFullWidth: isFullWidth,
       );

  const AppButton.danger({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    AppButtonSize size = AppButtonSize.md,
    bool isLoading = false,
    Widget? icon,
    bool isFullWidth = false,
  }) : this._(
         key: key,
         label: label,
         variant: AppButtonVariant.danger,
         onPressed: onPressed,
         size: size,
         isLoading: isLoading,
         icon: icon,
         isFullWidth: isFullWidth,
       );

  const AppButton.success({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    AppButtonSize size = AppButtonSize.md,
    bool isLoading = false,
    Widget? icon,
    bool isFullWidth = false,
  }) : this._(
         key: key,
         label: label,
         variant: AppButtonVariant.success,
         onPressed: onPressed,
         size: size,
         isLoading: isLoading,
         icon: icon,
         isFullWidth: isFullWidth,
       );

  const AppButton.icon({
    Key? key,
    required Widget icon,
    VoidCallback? onPressed,
    AppButtonSize size = AppButtonSize.md,
    String? tooltip,
  }) : this._(
         key: key,
         icon: icon,
         onPressed: onPressed,
         size: size,
         tooltip: tooltip,
         variant: AppButtonVariant.ghost,
         isIconOnly: true,
       );

  @override
  Widget build(BuildContext context) {
    if (isIconOnly) {
      return _buildIconOnlyButton(context);
    }

    final isEnabled = onPressed != null && !isLoading;

    final style = AppButtonStyle(
      variant: variant,
      size: size,
      isEnabled: isEnabled,
      context: context,
    );

    final buttonChild = isLoading
        ? _buildLoadingIndicator(style)
        : _buildContent(style, context);

    final button = Material(
      color: style.backgroundColor,
      borderRadius: style.borderRadius,
      child: InkWell(
        onTap: isEnabled ? onPressed : null,
        borderRadius: style.borderRadius,
        splashColor: style.overlayColor,
        highlightColor: style.overlayColor.withValues(alpha: 0.05),
        child: Container(
          height: size.height,
          constraints: BoxConstraints(
            minWidth: isFullWidth ? double.infinity : size.minWidth,
          ),
          padding: style.padding,
          decoration: BoxDecoration(
            border: style.border != null
                ? Border.all(
                    color: style.border!.color,
                    width: style.border!.width,
                  )
                : null,
            borderRadius: style.borderRadius,
          ),
          child: Center(child: buttonChild),
        ),
      ),
    );

    if (isFullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }

    return button;
  }

  Widget _buildContent(AppButtonStyle style, BuildContext context) {
    if (icon != null && label != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconTheme(
            data: IconThemeData(
              color: style.foregroundColor,
              size: style.loadingIndicatorSize,
            ),
            child: icon!,
          ),
          SizedBox(width: context.space.sm),
          Text(label!, style: style.textStyle, textAlign: TextAlign.center),
        ],
      );
    }

    return Text(
      label ?? '',
      style: style.textStyle,
      textAlign: TextAlign.center,
    );
  }

  Widget _buildLoadingIndicator(AppButtonStyle style) {
    return SizedBox(
      width: style.loadingIndicatorSize,
      height: style.loadingIndicatorSize,
      child: CircularProgressIndicator(
        strokeWidth: style.loadingIndicatorStrokeWidth,
        valueColor: AlwaysStoppedAnimation<Color>(style.foregroundColor),
      ),
    );
  }

  Widget _buildIconOnlyButton(BuildContext context) {
    final buttonSize = size.height;

    final button = Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(buttonSize / 2),
        child: Container(
          width: buttonSize,
          height: buttonSize,
          alignment: Alignment.center,
          child: IconTheme(
            data: IconThemeData(
              color: onPressed != null
                  ? context.colors.textPrimary
                  : context.colors.textDisabled,
              size: buttonSize * 0.5,
            ),
            child: icon!,
          ),
        ),
      ),
    );

    if (tooltip != null) {
      return Tooltip(message: tooltip!, child: button);
    }

    return button;
  }
}
