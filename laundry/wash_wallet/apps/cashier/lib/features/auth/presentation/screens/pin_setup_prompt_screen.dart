import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/auth_cubit.dart';

class PinSetupPromptScreen extends StatelessWidget {
  const PinSetupPromptScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: AppDialogLayout.formMaxWidth(context),
            ),
            child: Padding(
              padding: EdgeInsets.all(context.space.xl),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 160,
                      height: 160,
                      decoration: BoxDecoration(
                        color: context.colors.primary.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.lock_outline_rounded,
                        size: 80,
                        color: context.colors.primary,
                      ),
                    ),
                  ),
                  SizedBox(height: context.space.xxl),
                  Text(
                    'PIN Anda belum disetting',
                    style: context.typography.headlineMedium.copyWith(
                      color: context.colors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: context.space.md),
                  Text(
                    'Buat PIN 6 digit agar akses dan pergantian akun di perangkat ini lebih cepat. Anda tetap bisa melanjutkan pekerjaan sekarang dan mengatur PIN nanti.',
                    style: context.typography.bodyLarge.copyWith(
                      color: context.colors.textSecondary,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: context.space.xxl),
                  AppButton.primary(
                    label: 'Setting sekarang',
                    onPressed: () => context.go('/setup-pin'),
                    isFullWidth: true,
                    size: AppButtonSize.lg,
                  ),
                  SizedBox(height: context.space.md),
                  AppButton.ghost(
                    label: 'Lewati',
                    onPressed: () {
                      context.read<AuthCubit>().skipPinSetup();
                    },
                    isFullWidth: true,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
