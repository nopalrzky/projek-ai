import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingPage> _pages = const [
    OnboardingPage(
      icon: Icons.local_laundry_service_rounded,
      title: 'Kelola Laundry Lebih Mudah',
      description:
          'Wash Wallet membantu Anda mengelola order laundry, pelanggan, dan produksi dalam satu aplikasi.',
    ),
    OnboardingPage(
      icon: Icons.factory_rounded,
      title: 'Pantau Produksi Secara Real-time',
      description:
          'Lihat status pencucian, pengeringan, penyetrikaan, dan pelipatan secara langsung.',
    ),
    OnboardingPage(
      icon: Icons.dashboard_rounded,
      title: 'Dashboard Produksi Modern',
      description:
          'Pantau order aktif, prioritas, dan performa produksi dengan dashboard yang lengkap.',
    ),
  ];

  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
    });
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _completeOnboarding();
    }
  }

  void _skipOnboarding() {
    _completeOnboarding();
  }

  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    final onboardingService = OnboardingService(prefs);
    await onboardingService.complete();

    if (mounted) {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Skip Button
            Padding(
              padding: context.space.insetsAll.lg,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (_currentPage < _pages.length - 1)
                    AppButton.ghost(
                      label: 'Lewati',
                      onPressed: _skipOnboarding,
                      size: AppButtonSize.sm,
                    ),
                ],
              ),
            ),

            // PageView
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return _OnboardingPageView(page: _pages[index]);
                },
              ),
            ),

            // Page Indicators
            Padding(
              padding: context.space.insetsVertical.lg,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _pages.length,
                  (index) => _PageIndicator(isActive: index == _currentPage),
                ),
              ),
            ),

            // Next/Get Started Button
            Padding(
              padding: context.space.insetsAll.xl,
              child: AppButton.primary(
                label: _currentPage == _pages.length - 1
                    ? 'Mulai Sekarang'
                    : 'Lanjutkan',
                onPressed: _nextPage,
                isFullWidth: true,
                size: AppButtonSize.lg,
                icon: Icon(
                  _currentPage == _pages.length - 1
                      ? Icons.check_rounded
                      : Icons.arrow_forward_rounded,
                  size: 20,
                ),
              ),
            ),

            SizedBox(height: context.space.md),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPageView extends StatelessWidget {
  final OnboardingPage page;

  const _OnboardingPageView({required this.page});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: context.space.insetsHorizontal.xl,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Icon Container
          Container(
            width: 140,
            height: 140,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  context.colors.primary,
                  context.colors.primary.withOpacity(0.7),
                ],
              ),
              borderRadius: context.radius.all.xxl,
              boxShadow: [
                BoxShadow(
                  color: context.colors.primary.withOpacity(0.3),
                  blurRadius: 30,
                  offset: const Offset(0, 15),
                ),
              ],
            ),
            child: Icon(page.icon, size: 72, color: context.colors.onPrimary),
          ),

          SizedBox(height: context.space.xxxl),

          Text(
            page.title,
            textAlign: TextAlign.center,
            style: context.typography.displaySmall.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),

          SizedBox(height: context.space.lg),

          // Description
          Text(
            page.description,
            textAlign: TextAlign.center,
            style: context.typography.bodyLarge.copyWith(
              color: context.colors.textSecondary,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

class _PageIndicator extends StatelessWidget {
  final bool isActive;

  const _PageIndicator({required this.isActive});

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: EdgeInsets.symmetric(horizontal: context.space.xs),
      width: isActive ? 32 : 8,
      height: 8,
      decoration: BoxDecoration(
        color: isActive ? context.colors.primary : context.colors.border,
        borderRadius: context.radius.all.sm,
      ),
    );
  }
}

class OnboardingPage {
  final IconData icon;
  final String title;
  final String description;

  const OnboardingPage({
    required this.icon,
    required this.title,
    required this.description,
  });
}

