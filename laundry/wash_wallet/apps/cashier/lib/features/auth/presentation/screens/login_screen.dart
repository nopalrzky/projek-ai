import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/auth_cubit.dart';
import '../bloc/auth_state.dart';
import '../widgets/login_form.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is Authenticated) {
          context.go('/home');
        }

        if (state is AuthFailureState) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  Icon(
                    Icons.error_outline_rounded,
                    color: context.colors.onError,
                  ),
                  SizedBox(width: context.space.md),
                  Expanded(
                    child: Text(
                      state.failure.message,
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.onError,
                      ),
                    ),
                  ),
                ],
              ),
              backgroundColor: context.colors.error,
              behavior: SnackBarBehavior.floating,
              margin: EdgeInsets.all(context.space.lg),
              shape: RoundedRectangleBorder(
                borderRadius: context.radius.all.md,
              ),
              duration: const Duration(seconds: 4),
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: context.colors.background,
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(context.space.xl),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildHeader(context),
                    SizedBox(height: context.space.xxl * 2),
                    _buildLoginCard(context),
                    SizedBox(height: context.space.xl),
                    _buildFooter(context),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                context.colors.primary,
                context.colors.primary.withValues(alpha: 0.8),
              ],
            ),
            borderRadius: context.radius.all.xl,
            boxShadow: [
              BoxShadow(
                color: context.colors.primary.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Icon(
            Icons.local_laundry_service_rounded,
            size: 56,
            color: context.colors.onPrimary,
          ),
        ),
        SizedBox(height: context.space.xl),
        Text(
          'WashWallet POS',
          style: context.typography.displayLarge.copyWith(
            color: context.colors.textPrimary,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.5,
          ),
        ),
        SizedBox(height: context.space.sm),
        Text(
          'Sistem Manajemen Laundry Modern',
          style: context.typography.bodyLarge.copyWith(
            color: context.colors.textSecondary,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildLoginCard(BuildContext context) {
    return AppCard.elevated(
      size: AppCardSize.lg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Selamat Datang',
            style: context.typography.headlineMedium.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.xs),
          Text(
            'Masuk ke akun Anda untuk melanjutkan',
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
          SizedBox(height: context.space.xl),
          const LoginForm(),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(height: 1, width: 40, color: context.colors.outline),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: context.space.md),
              child: Text(
                'atau',
                style: context.typography.bodySmall.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ),
            Container(height: 1, width: 40, color: context.colors.outline),
          ],
        ),
        SizedBox(height: context.space.lg),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Butuh bantuan?',
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            SizedBox(width: context.space.xs),
            TextButton(
              onPressed: () {},
              style: TextButton.styleFrom(
                padding: EdgeInsets.symmetric(horizontal: context.space.sm),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                'Hubungi Admin',
                style: context.typography.bodyMedium.copyWith(
                  color: context.colors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: context.space.md),
        Text(
          'Version 1.0.0',
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textTertiary,
          ),
        ),
      ],
    );
  }
}
