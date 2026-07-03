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
        body: Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    context.colors.primary.withValues(alpha: 0.05),
                    context.colors.background,
                    context.colors.primary.withValues(alpha: 0.03),
                  ],
                ),
              ),
            ),
            Positioned(
              top: -50,
              right: -50,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      context.colors.primary.withValues(alpha: 0.15),
                      context.colors.primary.withValues(alpha: 0.0),
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: -80,
              left: -80,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      context.colors.primary.withValues(alpha: 0.1),
                      context.colors.primary.withValues(alpha: 0.0),
                    ],
                  ),
                ),
              ),
            ),
            // Content
            SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(context.space.xl),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: AppDialogLayout.formMaxWidth(context)),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildHeader(context),
                        SizedBox(height: context.space.xxxl),
                        _buildLoginCard(context),
                        SizedBox(height: context.space.xl),
                        _buildFooter(context),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      children: [
        // Animated Logo Container
        TweenAnimationBuilder(
          tween: Tween<double>(begin: 0, end: 1),
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeOutBack,
          builder: (context, double value, child) {
            return Transform.scale(
              scale: value,
              child: Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      context.colors.primary,
                      context.colors.primary.withValues(alpha: 0.7),
                    ],
                  ),
                  borderRadius: context.radius.all.xxl,
                  boxShadow: [
                    BoxShadow(
                      color: context.colors.primary.withValues(alpha: 0.4),
                      blurRadius: 30,
                      spreadRadius: 2,
                      offset: const Offset(0, 15),
                    ),
                    BoxShadow(
                      color: context.colors.primary.withValues(alpha: 0.2),
                      blurRadius: 60,
                      spreadRadius: 10,
                      offset: const Offset(0, 25),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.local_laundry_service_rounded,
                  size: 60,
                  color: context.colors.onPrimary,
                ),
              ),
            );
          },
        ),
        SizedBox(height: context.space.xxl),
        // App Name with gradient
        ShaderMask(
          shaderCallback: (bounds) => LinearGradient(
            colors: [
              context.colors.primary,
              context.colors.primary.withValues(alpha: 0.8),
            ],
          ).createShader(bounds),
          child: Text(
            'Wash Wallet',
            style: context.typography.displayLarge.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              letterSpacing: -1,
              fontSize: 36,
            ),
          ),
        ),
        SizedBox(height: context.space.sm),
        Text(
          'Sistem Manajemen Laundry Modern',
          style: context.typography.bodyLarge.copyWith(
            color: context.colors.textSecondary,
            letterSpacing: 0.5,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildLoginCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: context.radius.all.xxl,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 40,
            spreadRadius: 0,
            offset: const Offset(0, 20),
          ),
          BoxShadow(
            color: context.colors.primary.withValues(alpha: 0.05),
            blurRadius: 60,
            spreadRadius: 10,
            offset: const Offset(0, 30),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(context.space.xxl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(context.space.sm),
                  decoration: BoxDecoration(
                    color: context.colors.primary.withValues(alpha: 0.1),
                    borderRadius: context.radius.all.md,
                  ),
                  child: Icon(
                    Icons.login_rounded,
                    color: context.colors.primary,
                    size: 24,
                  ),
                ),
                SizedBox(width: context.space.md),
                Expanded(
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
                        'Masuk ke akun Anda',
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: context.space.xxl),
            const LoginForm(),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: context.space.lg,
            vertical: context.space.md,
          ),
          decoration: BoxDecoration(
            color: context.colors.surfaceVariant.withValues(alpha: 0.3),
            borderRadius: context.radius.all.lg,
            border: Border.all(
              color: context.colors.outline.withValues(alpha: 0.1),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.support_agent_rounded,
                size: 18,
                color: context.colors.primary,
              ),
              SizedBox(width: context.space.sm),
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
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: context.space.lg),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.verified_user_rounded,
              size: 14,
              color: context.colors.textTertiary,
            ),
            SizedBox(width: context.space.xs),
            Text(
              'Secured by WashWallet  •  v1.0.0',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textTertiary,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
