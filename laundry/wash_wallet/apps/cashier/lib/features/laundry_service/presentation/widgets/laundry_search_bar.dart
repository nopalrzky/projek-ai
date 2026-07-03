import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class LaundrySearchBar extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSearch;
  final VoidCallback onClear;

  const LaundrySearchBar({
    super.key,
    required this.controller,
    required this.onSearch,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.md,
        vertical: context.space.sm,
      ),
      color: context.colors.surface,
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          hintText: 'Cari layanan (Cuci Kering, Setrika...)',
          prefixIcon: const Icon(Icons.search),
          filled: true,
          fillColor: context.colors.background,
          contentPadding: EdgeInsets.symmetric(
            vertical: 0,
            horizontal: context.space.md,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(context.radius.lg),
            borderSide: BorderSide.none,
          ),
          suffixIcon: controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, size: 20),
                  onPressed: onClear,
                )
              : null,
        ),
        onSubmitted: (_) => onSearch(),
      ),
    );
  }
}
