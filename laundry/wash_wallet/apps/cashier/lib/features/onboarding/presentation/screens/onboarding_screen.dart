import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingContent> _pages = [
    OnboardingContent(
      icon: Icons.local_laundry_service_rounded,
      title: 'Kelola Laundry dengan Mudah',
      description:
          'Sistem POS modern yang memudahkan pengelolaan bisnis laundry Anda',
    ),
    OnboardingContent(
      icon: Icons.receipt_long,
      title: 'Transaksi Cepat & Akurat',
      description:
          'Catat transaksi dengan cepat, monitor status pesanan secara real-time',
    ),
    OnboardingContent(
      icon: Icons.analytics_outlined,
      title: 'Laporan & Analisis',
      description:
          'Pantau performa bisnis dengan laporan lengkap dan analisis mendalam',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
    });
  }

  Future<void> _onGetStarted() async {
    if (!mounted) return;
    await context.read<AuthCubit>().completeOnboarding();
  }

  void _onNext() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _onGetStarted();
    }
  }

  void _onSkip() {
    _onGetStarted();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      body: SafeArea(
        child: ContentConstraint(
          maxWidth: 600,
          child: Column(
            children: [
              Padding(
                padding: EdgeInsets.all(context.space.lg),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (_currentPage < _pages.length - 1)
                      AppButton.ghost(label: 'Lewati', onPressed: _onSkip)
                    else
                      const SizedBox(height: 48),
                  ],
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: _onPageChanged,
                  itemCount: _pages.length,
                  itemBuilder: (context, index) {
                    return _OnboardingPage(content: _pages[index]);
                  },
                ),
              ),
              Padding(
                padding: EdgeInsets.all(context.space.xl),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _pages.length,
                        (index) =>
                            _DotIndicator(isActive: index == _currentPage),
                      ),
                    ),
                    SizedBox(height: context.space.xl),
                    AppButton.primary(
                      label: _currentPage == _pages.length - 1
                          ? 'Mulai Sekarang'
                          : 'Selanjutnya',
                      onPressed: _onNext,
                      isFullWidth: true,
                      size: AppButtonSize.lg,
                    ),
                    SizedBox(height: context.space.md),
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

class _OnboardingPage extends StatelessWidget {
  final OnboardingContent content;

  const _OnboardingPage({required this.content});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(context.space.xl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 240,
            height: 240,
            decoration: BoxDecoration(
              color: context.colors.primary.withValues(alpha: 0.05),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  color: context.colors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  content.icon,
                  size: 80,
                  color: context.colors.primary,
                ),
              ),
            ),
          ),
          SizedBox(height: context.space.xxl),
          Text(
            content.title,
            style: context.typography.headlineMedium.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.space.lg),
          Text(
            content.description,
            style: context.typography.bodyLarge.copyWith(
              color: context.colors.textSecondary,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _DotIndicator extends StatelessWidget {
  final bool isActive;

  const _DotIndicator({required this.isActive});

  @override
  Widget build(BuildContext context) {
    final color = context.colors.primary;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: EdgeInsets.symmetric(horizontal: context.space.xs),
      height: 8,
      width: isActive ? 24 : 8,
      decoration: BoxDecoration(
        color: isActive ? color : color.withValues(alpha: 0.2),
        borderRadius: context.radius.all.sm,
      ),
    );
  }
}

class OnboardingContent {
  final IconData icon;
  final String title;
  final String description;

  OnboardingContent({
    required this.icon,
    required this.title,
    required this.description,
  });
}
