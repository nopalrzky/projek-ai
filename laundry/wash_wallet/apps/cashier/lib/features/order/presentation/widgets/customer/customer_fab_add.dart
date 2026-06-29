import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CustomerFabAdd extends StatelessWidget {
  final VoidCallback onPressed;
  final String label;
  final bool isExtended;

  const CustomerFabAdd({
    super.key,
    required this.onPressed,
    this.label = 'Tambah Pelanggan',
    this.isExtended = true,
  });

  @override
  Widget build(BuildContext context) {
    if (isExtended) {
      return FloatingActionButton.extended(
        onPressed: onPressed,
        elevation: 4,
        backgroundColor: context.colors.primary,
        foregroundColor: Colors.white,
        icon: Container(
          padding: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.add_rounded, size: 20),
        ),
        label: Text(
          label,
          style: context.typography.labelLarge.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      );
    }

    return FloatingActionButton(
      onPressed: onPressed,
      elevation: 4,
      backgroundColor: context.colors.primary,
      foregroundColor: Colors.white,
      child: const Icon(Icons.add_rounded),
    );
  }
}

