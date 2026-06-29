import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CustomerSearchBar extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onClear;
  final bool isLoading;

  const CustomerSearchBar({
    super.key,
    required this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onClear,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.colors.border.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: context.colors.textTertiary.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        onSubmitted: onSubmitted,
        style: context.typography.bodyMedium,
        decoration: InputDecoration(
          hintText: 'Cari nama atau nomor HP pelanggan...',
          hintStyle: context.typography.bodyMedium.copyWith(
            color: context.colors.textSecondary,
          ),
          prefixIcon: Icon(
            Icons.search_rounded,
            color: context.colors.primary,
            size: 22,
          ),
          suffixIcon: _buildSuffixIcon(context),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(
            horizontal: context.space.md,
            vertical: context.space.md,
          ),
        ),
      ),
    );
  }

  Widget? _buildSuffixIcon(BuildContext context) {
    if (isLoading) {
      return Padding(
        padding: EdgeInsets.all(context.space.sm),
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: context.colors.primary,
          ),
        ),
      );
    }

    if (controller.text.isNotEmpty) {
      return IconButton(
        icon: Icon(
          Icons.clear_rounded,
          color: context.colors.textSecondary,
          size: 20,
        ),
        onPressed: () {
          controller.clear();
          onClear?.call();
        },
      );
    }

    return null;
  }
}

