import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CustomerSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSearch;
  final VoidCallback onClear;

  const CustomerSearchBar({
    super.key,
    required this.controller,
    required this.onSearch,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          hintText: 'Cari nama atau no. telepon...',
          hintStyle: context.typography.bodyMedium.copyWith(
            color: context.colors.textTertiary,
          ),
          prefixIcon: Icon(
            Icons.search_rounded,
            color: context.colors.textSecondary,
          ),
          filled: true,
          fillColor: context.colors.background,
          contentPadding: EdgeInsets.symmetric(
            vertical: context.space.md,
            horizontal: context.space.md,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(context.radius.lg),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(context.radius.lg),
            borderSide: BorderSide(
              color: context.colors.border.withValues(alpha: 0.3),
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(context.radius.lg),
            borderSide: BorderSide(color: context.colors.primary, width: 2),
          ),
          suffixIcon: controller.text.isNotEmpty
              ? IconButton(
                  icon: Icon(
                    Icons.clear_rounded,
                    color: context.colors.textSecondary,
                  ),
                  onPressed: onClear,
                )
              : null,
        ),
        onSubmitted: (_) => onSearch(),
      ),
    );
  }
}
