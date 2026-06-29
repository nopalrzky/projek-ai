import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CustomerAddressSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;

  const CustomerAddressSearchBar({
    super.key,
    required this.controller,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      onChanged: onChanged,
      textInputAction: TextInputAction.search,
      style: context.typography.bodyMedium.copyWith(
        color: context.colors.textPrimary,
      ),
      decoration: InputDecoration(
        hintText: 'Cari alamat...',
        hintStyle: context.typography.bodyMedium.copyWith(
          color: context.colors.textSecondary,
        ),
        prefixIcon: Icon(
          Icons.search_rounded,
          color: context.colors.textSecondary,
          size: 20,
        ),
        filled: true,
        fillColor: context.colors.surface,
        contentPadding: EdgeInsets.symmetric(
          horizontal: context.space.md,
          vertical: context.space.sm,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
          borderSide: BorderSide(color: context.colors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
          borderSide: BorderSide(color: context.colors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
          borderSide: BorderSide(color: context.colors.primary, width: 1.5),
        ),
      ),
    );
  }
}
