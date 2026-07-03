import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PinBoxInput extends StatelessWidget {
  final int length;
  final String currentValue;
  final bool obscureText;
  final String? errorText;
  final ValueChanged<String> onChanged;
  final ValueChanged<String>? onCompleted;
  final TextEditingController? controller;

  const PinBoxInput({
    super.key,
    this.length = 6,
    required this.currentValue,
    this.obscureText = true,
    this.errorText,
    required this.onChanged,
    this.onCompleted,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    final defaultPinTheme = PinTheme(
      width: 56,
      height: 64,
      textStyle: context.typography.headlineMedium.copyWith(
        color: context.colors.primary,
        fontWeight: FontWeight.bold,
      ),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.outlineVariant),
      ),
    );

    final focusedPinTheme = defaultPinTheme.copyDecorationWith(
      border: Border.all(color: context.colors.primary, width: 2),
      borderRadius: BorderRadius.circular(context.radius.md),
    );

    final errorPinTheme = defaultPinTheme.copyDecorationWith(
      border: Border.all(color: context.colors.error, width: 1.5),
      borderRadius: BorderRadius.circular(context.radius.md),
    );

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: Pinput(
            controller: controller,
            length: length,
            defaultPinTheme: defaultPinTheme,
            focusedPinTheme: focusedPinTheme,
            errorPinTheme: errorPinTheme,
            forceErrorState: errorText != null && errorText!.isNotEmpty,
            obscureText: obscureText,
            obscuringWidget: Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                color: context.colors.onSurface,
                shape: BoxShape.circle,
              ),
            ),
            onChanged: onChanged,
            onCompleted: onCompleted,
            useNativeKeyboard: true,
            showCursor: true,
            cursor: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  width: 24,
                  height: 2,
                  color: context.colors.primary,
                ),
              ],
            ),
          ),
        ),
        if (errorText != null && errorText!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 8.0),
            child: Text(
              errorText!,
              style: context.typography.bodySmall.copyWith(
                color: context.colors.error,
              ),
            ),
          ),
      ],
    );
  }
}
