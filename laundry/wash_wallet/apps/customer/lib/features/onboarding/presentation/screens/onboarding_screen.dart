import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/onboarding_cubit.dart';
import '../bloc/onboarding_state.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  final List<_OnboardingSlideData> _slides = const [
    _OnboardingSlideData(
      icon: Icons.local_laundry_service,
      title: 'Laundry Tanpa Antri',
      description: 'Pesan layanan laundry dari mana saja, kapan saja.',
    ),
    _OnboardingSlideData(
      icon: Icons.location_on,
      title: 'Temukan Outlet Terdekat',
      description: 'Kami tunjukkan outlet laundry terpercaya di sekitarmu.',
    ),
    _OnboardingSlideData(
      icon: Icons.check_circle,
      title: 'Pantau Pesananmu',
      description: 'Lacak status laundry secara real-time hingga selesai.',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  bool get _isLastPage => _currentPage == _slides.length - 1;

  Future<void> _onPrimaryTap() async {
    if (_isLastPage) {
      await context.read<OnboardingCubit>().completeOnboarding();
      return;
    }

    await _pageController.nextPage(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
    );
  }

  Future<void> _onSkipTap() async {
    await context.read<OnboardingCubit>().completeOnboarding();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      body: SafeArea(
        child: BlocBuilder<OnboardingCubit, OnboardingState>(
          builder: (context, state) {
            final isLoading = state is OnboardingChecking;

            return Column(
              children: [
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    itemCount: _slides.length,
                    onPageChanged: (value) {
                      setState(() {
                        _currentPage = value;
                      });
                    },
                    itemBuilder: (context, index) {
                      final slide = _slides[index];

                      return Padding(
                        padding: EdgeInsets.all(context.space.xl),
                        child: Column(
                          children: [
                            const Spacer(),
                            Container(
                              width: 200,
                              height: 200,
                              decoration: BoxDecoration(
                                color: context.colors.primarySurface,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              alignment: Alignment.center,
                              child: Icon(
                                slide.icon,
                                size: 96,
                                color: context.colors.primary,
                              ),
                            ),
                            SizedBox(height: context.space.xxl),
                            Text(
                              slide.title,
                              textAlign: TextAlign.center,
                              style: context.typography.headlineLarge.copyWith(
                                fontWeight: FontWeight.bold,
                                color: context.colors.textPrimary,
                              ),
                            ),
                            SizedBox(height: context.space.sm),
                            Text(
                              slide.description,
                              textAlign: TextAlign.center,
                              style: context.typography.bodyMedium.copyWith(
                                color: context.colors.textSecondary,
                              ),
                            ),
                            const Spacer(),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: EdgeInsets.fromLTRB(
                    context.space.xl,
                    context.space.md,
                    context.space.xl,
                    context.space.xl,
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(_slides.length, (index) {
                          final isActive = index == _currentPage;
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 220),
                            margin: EdgeInsets.symmetric(
                              horizontal: context.space.xs / 2,
                            ),
                            width: isActive ? 22 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: isActive
                                  ? context.colors.primary
                                  : context.colors.divider,
                              borderRadius: BorderRadius.circular(999),
                            ),
                          );
                        }),
                      ),
                      SizedBox(height: context.space.xl),
                      AppButton.primary(
                        label: _isLastPage ? 'Mulai' : 'Lanjut',
                        onPressed: isLoading ? null : _onPrimaryTap,
                        isLoading: isLoading,
                        isFullWidth: true,
                      ),
                      SizedBox(height: context.space.sm),
                      if (!_isLastPage)
                        TextButton(
                          onPressed: isLoading ? null : _onSkipTap,
                          child: const Text('Lewati'),
                        )
                      else
                        SizedBox(height: context.space.xl + context.space.sm),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _OnboardingSlideData {
  final IconData icon;
  final String title;
  final String description;

  const _OnboardingSlideData({
    required this.icon,
    required this.title,
    required this.description,
  });
}
