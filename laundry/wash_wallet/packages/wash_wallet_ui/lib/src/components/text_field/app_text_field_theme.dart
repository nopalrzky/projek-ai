import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_text_field.dart';
import 'app_text_field_size.dart';

class AppTextFieldTheme {
  AppTextFieldTheme._();

  static Widget search({
    String? hint,
    TextEditingController? controller,
    ValueChanged<String>? onChanged,
    ValueChanged<String>? onSubmitted,
  }) {
    return AppTextField.filled(
      hint: hint ?? 'Cari...',
      controller: controller,
      prefixIcon: const Icon(Icons.search),
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      textInputAction: TextInputAction.search,
    );
  }

  static Widget password({
    required BuildContext context,
    String? label,
    String? hint,
    String? errorText,
    TextEditingController? controller,
    ValueChanged<String>? onChanged,
  }) {
    return _PasswordTextField(
      label: label,
      hint: hint,
      errorText: errorText,
      controller: controller,
      onChanged: onChanged,
    );
  }

  static Widget currency({
    String? label,
    String? hint,
    String? errorText,
    TextEditingController? controller,
    ValueChanged<String>? onChanged,
  }) {
    return AppTextField.outlined(
      label: label,
      hint: hint,
      errorText: errorText,
      controller: controller,
      keyboardType: TextInputType.number,
      prefixIcon: const Icon(Icons.attach_money),
      suffixText: 'Rp',
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      onChanged: onChanged,
    );
  }

  static Widget phone({
    String? label,
    String? hint,
    String? errorText,
    TextEditingController? controller,
    ValueChanged<String>? onChanged,
  }) {
    return AppTextField.outlined(
      label: label ?? 'Nomor HP',
      hint: hint ?? '08xx-xxxx-xxxx',
      errorText: errorText,
      controller: controller,
      keyboardType: TextInputType.phone,
      prefixIcon: const Icon(Icons.phone),
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(13),
      ],
      onChanged: onChanged,
    );
  }

  static Widget quantity({
    String? label,
    String? hint,
    String? errorText,
    String? suffixText,
    TextEditingController? controller,
    ValueChanged<String>? onChanged,
  }) {
    return AppTextField.outlined(
      label: label ?? 'Jumlah',
      hint: hint,
      errorText: errorText,
      controller: controller,
      keyboardType: TextInputType.number,
      suffixText: suffixText ?? 'pcs',
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      onChanged: onChanged,
      size: AppTextFieldSize.md,
    );
  }

  static Widget multiline({
    String? label,
    String? hint,
    String? errorText,
    int maxLines = 4,
    TextEditingController? controller,
    ValueChanged<String>? onChanged,
  }) {
    return AppTextField(
      label: label,
      hint: hint,
      errorText: errorText,
      controller: controller,
      maxLines: maxLines,
      keyboardType: TextInputType.multiline,
      textInputAction: TextInputAction.newline,
      onChanged: onChanged,
    );
  }
}

class _PasswordTextField extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? errorText;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;

  const _PasswordTextField({
    this.label,
    this.hint,
    this.errorText,
    this.controller,
    this.onChanged,
  });

  @override
  State<_PasswordTextField> createState() => _PasswordTextFieldState();
}

class _PasswordTextFieldState extends State<_PasswordTextField> {
  bool _obscureText = true;

  void _toggleVisibility() {
    setState(() {
      _obscureText = !_obscureText;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppTextField.outlined(
      label: widget.label ?? 'Password',
      hint: widget.hint,
      errorText: widget.errorText,
      controller: widget.controller,
      obscureText: _obscureText,
      keyboardType: TextInputType.visiblePassword,
      suffixIcon: IconButton(
        icon: Icon(_obscureText ? Icons.visibility_off : Icons.visibility),
        onPressed: _toggleVisibility,
      ),
      onChanged: widget.onChanged,
    );
  }
}
