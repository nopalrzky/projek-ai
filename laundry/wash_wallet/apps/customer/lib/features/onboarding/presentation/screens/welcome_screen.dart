import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.teal50, AppColors.neutral0],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: context.space.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(flex: 2),
                Column(
                  children: [
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        color: context.colors.primarySurface,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.local_laundry_service,
                        size: 48,
                        color: context.colors.primary,
                      ),
                    ),
                    SizedBox(height: context.space.md),
                    Text(
                      'WashWallet',
                      style: context.typography.displayLarge.copyWith(
                        color: context.colors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      'Teman laundry terpercayamu',
                      textAlign: TextAlign.center,
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Container(
                  height: 180,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.75),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: context.colors.border),
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    Icons.wash,
                    size: 84,
                    color: context.colors.primaryLight,
                  ),
                ),
                const Spacer(),
                AppButton.primary(
                  label: 'Masuk',
                  onPressed: () => context.go('/login'),
                  isFullWidth: true,
                ),
                SizedBox(height: context.space.md),
                AppButton.outline(
                  label: 'Daftar',
                  onPressed: () => context.go('/register-start'),
                  isFullWidth: true,
                ),
                SizedBox(height: context.space.lg),
                Text(
                  'Dengan mendaftar, kamu menyetujui Syarat & Ketentuan',
                  textAlign: TextAlign.center,
                  style: context.typography.labelSmall.copyWith(
                    color: context.colors.textTertiary,
                  ),
                ),
                SizedBox(height: context.space.md),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
