import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_text_field_variant.dart';
import 'app_text_field_size.dart';
import 'app_text_field_style.dart';

class AppTextField extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? errorText;
  final String? helperText;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final AppTextFieldVariant variant;
  final AppTextFieldSize size;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool obscureText;
  final bool enabled;
  final bool readOnly;
  final bool autofocus;
  final int? maxLines;
  final int? maxLength;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final String? suffixText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final List<TextInputFormatter>? inputFormatters;
  final String? Function(String?)? validator;

  const AppTextField({
    super.key,
    this.label,
    this.hint,
    this.errorText,
    this.helperText,
    this.controller,
    this.focusNode,
    this.variant = AppTextFieldVariant.defaultVariant,
    this.size = AppTextFieldSize.md,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.maxLines = 1,
    this.maxLength,
    this.prefixIcon,
    this.suffixIcon,
    this.suffixText,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.inputFormatters,
    this.validator,
  });

  const AppTextField.outlined({
    super.key,
    this.label,
    this.hint,
    this.errorText,
    this.helperText,
    this.controller,
    this.focusNode,
    this.size = AppTextFieldSize.md,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.maxLines = 1,
    this.maxLength,
    this.prefixIcon,
    this.suffixIcon,
    this.suffixText,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.inputFormatters,
    this.validator,
  }) : variant = AppTextFieldVariant.outlined;

  const AppTextField.filled({
    super.key,
    this.label,
    this.hint,
    this.errorText,
    this.helperText,
    this.controller,
    this.focusNode,
    this.size = AppTextFieldSize.md,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.maxLines = 1,
    this.maxLength,
    this.prefixIcon,
    this.suffixIcon,
    this.suffixText,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.inputFormatters,
    this.validator,
  }) : variant = AppTextFieldVariant.filled;

  const AppTextField.search({
    super.key,
    this.hint,
    this.controller,
    this.focusNode,
    this.size = AppTextFieldSize.md,
    this.enabled = true,
    this.readOnly = false,
    this.autofocus = false,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
  }) : label = null,
       errorText = null,
       helperText = null,
       variant = AppTextFieldVariant.filled,
       keyboardType = TextInputType.text,
       textInputAction = TextInputAction.search,
       obscureText = false,
       maxLines = 1,
       maxLength = null,
       prefixIcon = const Icon(Icons.search),
       suffixIcon = null,
       suffixText = null,
       inputFormatters = null,
       validator = null;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  late FocusNode _focusNode;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    } else {
      _focusNode.removeListener(_onFocusChange);
    }
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null && widget.errorText!.isNotEmpty;
    final hasHelper =
        widget.helperText != null && widget.helperText!.isNotEmpty;

    final style = AppTextFieldStyle(
      variant: widget.variant,
      size: widget.size,
      isEnabled: widget.enabled,
      isFocused: _isFocused,
      isError: hasError,
      isSuccess: widget.variant == AppTextFieldVariant.success,
      context: context,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        TextFormField(
          controller: widget.controller,
          focusNode: _focusNode,
          style: style.textStyle,
          decoration: style.decoration(
            label: widget.label,
            hint: widget.hint,
            errorText: hasError ? widget.errorText : null,
            helperText: hasHelper ? widget.helperText : null,
            prefixIcon: widget.prefixIcon,
            suffixIcon: widget.suffixIcon,
            suffixText: widget.suffixText,
          ),
          keyboardType: widget.keyboardType,
          textInputAction: widget.textInputAction,
          obscureText: widget.obscureText,
          enabled: widget.enabled,
          readOnly: widget.readOnly,
          autofocus: widget.autofocus,
          maxLines: widget.maxLines,
          maxLength: widget.maxLength,
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          onTap: widget.onTap,
          inputFormatters: widget.inputFormatters,
          validator: widget.validator,
        ),
      ],
    );
  }
}
