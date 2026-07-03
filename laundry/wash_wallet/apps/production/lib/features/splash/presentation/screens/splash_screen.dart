import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initializeSplash();
  }

  Future<void> _initializeSplash() async {
    await Future.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;

    final onboardingService = OnboardingService(
      await SharedPreferences.getInstance(),
    );

    final hasCompletedOnboarding = onboardingService.isCompleted();

    if (!hasCompletedOnboarding) {
      if (mounted) {
        context.go('/onboarding');
      }
      return;
    }

    if (mounted) {
      await context.read<AuthCubit>().checkAuthStatus();

      if (!mounted) return;

      final authState = context.read<AuthCubit>().state;

      if (authState is Authenticated) {
        context.go('/home');
      } else {
        context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      context.colors.primary,
                      context.colors.primary.withValues(alpha: 0.8),
                    ],
                  ),
                  borderRadius: context.radius.all.xxl,
                  boxShadow: [
                    BoxShadow(
                      color: context.colors.primary.withValues(alpha: 0.3),
                      blurRadius: 30,
                      offset: const Offset(0, 15),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.local_laundry_service_rounded,
                  size: 64,
                  color: context.colors.onPrimary,
                ),
              ),

              SizedBox(height: context.space.xxl),

              Text(
                'Wash Wallet',
                style: context.typography.displayLarge.copyWith(
                  color: context.colors.textPrimary,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -1,
                ),
              ),

              SizedBox(height: context.space.sm),

              Padding(
                padding: context.space.insetsHorizontal.xl,
                child: Text(
                  'Laundry POS Management System',
                  textAlign: TextAlign.center,
                  style: context.typography.bodyLarge.copyWith(
                    color: context.colors.textSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
              ),

              SizedBox(height: context.space.xxxl),

              const AppLoadingIndicator(),

              SizedBox(height: context.space.lg),

              Text(
                'Memuat aplikasi...',
                style: context.typography.bodySmall.copyWith(
                  color: context.colors.textTertiary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
