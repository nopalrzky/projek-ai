import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../bloc/onboarding_cubit.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  bool _visible = false;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      setState(() => _visible = true);
      _startSplash();
    });
  }

  Future<void> _startSplash() async {
    await Future.wait([
      Future.delayed(const Duration(milliseconds: 1500)),
      _checkConditions(),
    ]);
  }

  Future<void> _checkConditions() async {
    final authCubit = context.read<CustomerAuthCubit>();
    final onboardingCubit = context.read<OnboardingCubit>();

    await Future.wait([
      authCubit.checkAuthStatus(),
      onboardingCubit.checkOnboardingStatus(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.teal600, AppColors.teal800],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedOpacity(
                opacity: _visible ? 1 : 0,
                duration: const Duration(milliseconds: 800),
                child: Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.local_laundry_service,
                    size: 52,
                    color: Colors.white,
                  ),
                ),
              ),
              SizedBox(height: context.space.md),
              AnimatedSlide(
                offset: _visible ? Offset.zero : const Offset(0, 0.3),
                duration: const Duration(milliseconds: 600),
                curve: Curves.easeOutCubic,
                child: Column(
                  children: [
                    Text(
                      'WashWallet',
                      style: context.typography.displayLarge.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      'Laundry lebih mudah',
                      style: context.typography.bodyMedium.copyWith(
                        color: Colors.white.withValues(alpha: 0.75),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
