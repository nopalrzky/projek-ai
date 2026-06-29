import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ProfilePasswordSetupCardWidget extends StatelessWidget {
  final VoidCallback onDismiss;

  const ProfilePasswordSetupCardWidget({super.key, required this.onDismiss});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: AppCard.outlined(
        backgroundColor: context.colors.primarySurface,
        borderColor: context.colors.primary,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.lock_outline_rounded, color: context.colors.primary),
            SizedBox(width: context.space.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Amankan akun kamu',
                    style: context.typography.labelMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: context.colors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    'Kamu belum membuat password. Atur password agar akun bisa login lebih mudah dan tetap aman.',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.space.md),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: AppButton.outline(
                      label: 'Atur Password',
                      size: AppButtonSize.sm,
                      icon: const Icon(Icons.arrow_forward_rounded),
                      onPressed: () => context.push('/profile/password'),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: context.space.xs),
            AppButton.icon(
              icon: Icon(
                Icons.close_rounded,
                color: context.colors.textSecondary,
              ),
              onPressed: onDismiss,
              tooltip: 'Tutup',
            ),
          ],
        ),
      ),
    );
  }
}
