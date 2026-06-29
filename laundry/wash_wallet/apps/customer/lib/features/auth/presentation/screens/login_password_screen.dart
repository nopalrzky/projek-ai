import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/customer_auth_cubit.dart';
import '../bloc/customer_auth_state.dart';

class LoginPasswordScreen extends StatefulWidget {
  final String? phone;

  const LoginPasswordScreen({super.key, this.phone});

  @override
  State<LoginPasswordScreen> createState() => _LoginPasswordScreenState();
}

class _LoginPasswordScreenState extends State<LoginPasswordScreen> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  Timer? _rateLimitTimer;
  int _rateLimitRemainingSeconds = 0;
  bool _obscurePassword = true;

  bool get _isRateLimited => _rateLimitRemainingSeconds > 0;

  @override
  void initState() {
    super.initState();
    if (widget.phone != null) {
      _phoneController.text = widget.phone!;
    }
  }

  @override
  void dispose() {
    _rateLimitTimer?.cancel();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _startRateLimitCooldown() {
    _rateLimitTimer?.cancel();

    setState(() {
      _rateLimitRemainingSeconds = 60;
    });

    _rateLimitTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      if (_rateLimitRemainingSeconds <= 1) {
        timer.cancel();
        setState(() {
          _rateLimitRemainingSeconds = 0;
        });
        return;
      }

      setState(() {
        _rateLimitRemainingSeconds -= 1;
      });
    });
  }

  void _submit() {
    final phone = _phoneController.text.trim();
    final password = _passwordController.text;

    if (phone.isEmpty || password.isEmpty) {
      AppSnackbar.warning(
        context,
        message: 'Nomor WhatsApp dan password wajib diisi.',
      );
      return;
    }

    context.read<CustomerAuthCubit>().loginWithPassword(
      phone: phone,
      password: password,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Login Password',
          style: context.typography.headlineLarge.copyWith(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: BlocConsumer<CustomerAuthCubit, CustomerAuthState>(
        listener: (context, state) {
          if (state is CustomerAuthAuthenticated) {
            context.go('/home');
            return;
          }

          if (state is CustomerAuthError) {
            final message = state.message;
            final normalized = message.toLowerCase();

            if (normalized.contains('too many attempts')) {
              _startRateLimitCooldown();
              AppSnackbar.warning(
                context,
                message: 'Terlalu banyak percobaan. Coba lagi nanti.',
              );
              return;
            }

            AppSnackbar.error(context, message: message);
          }
        },
        builder: (context, state) {
          final isLoading = state is CustomerAuthLoading;
          final isDisabled = isLoading || _isRateLimited;

          return Column(
            children: [
              // Top Illustration (70%)
              Expanded(
                flex: 7,
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: Image.asset(
                        'assets/images/login_illustration.png',
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.2),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Form Card (Approx 30%)
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: context.colors.background,
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(context.radius.xl),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: Padding(
                  padding: EdgeInsets.fromLTRB(
                    context.space.xl,
                    context.space.lg,
                    context.space.xl,
                    MediaQuery.of(context).padding.bottom + context.space.lg,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Masuk Kembali',
                        style: context.typography.displayLarge.copyWith(
                          color: context.colors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: context.space.xs),
                      Text(
                        'Masuk dengan nomor WhatsApp dan password Anda.',
                        textAlign: TextAlign.center,
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                      SizedBox(height: context.space.xxl),
                      AppTextField.outlined(
                        controller: _phoneController,
                        label: 'Nomor WhatsApp',
                        prefixIcon: const Icon(Icons.phone_outlined),
                        keyboardType: TextInputType.phone,
                        enabled: widget.phone == null && !isDisabled,
                      ),
                      SizedBox(height: context.space.lg),
                      AppTextField.outlined(
                        controller: _passwordController,
                        label: 'Password',
                        obscureText: _obscurePassword,
                        enabled: !isDisabled,
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: isDisabled
                              ? null
                              : () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off
                                : Icons.visibility,
                          ),
                        ),
                      ),
                      SizedBox(height: context.space.md),
                      if (_isRateLimited)
                        Text(
                          'Coba lagi dalam $_rateLimitRemainingSeconds detik',
                          style: context.typography.bodySmall.copyWith(
                            color: context.colors.textSecondary,
                          ),
                        ),
                      SizedBox(height: context.space.xl),
                      AppButton.primary(
                        onPressed: isDisabled ? null : _submit,
                        label: isLoading ? 'Memproses...' : 'Masuk',
                        isLoading: isLoading,
                        isFullWidth: true,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
