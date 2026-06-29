import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/customer_auth_cubit.dart';
import '../bloc/customer_auth_state.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  Timer? _timer;
  int _remainingSeconds = 300;
  String _phone = '';
  String _intent = 'login';
  bool _hasPassword = false;
  bool _resetTimerOnNextOtpRequested = false;

  @override
  void initState() {
    super.initState();
    _bootstrapFromCubitState();
  }

  void _bootstrapFromCubitState() {
    final currentState = context.read<CustomerAuthCubit>().state;
    if (currentState is CustomerAuthOtpRequested) {
      _phone = currentState.phone;
      _intent = currentState.intent;
      _hasPassword = currentState.hasPassword;
      _startTimer();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      if (_remainingSeconds <= 0) {
        timer.cancel();
        return;
      }

      setState(() {
        _remainingSeconds -= 1;
      });
    });
  }

  void _resetTimer() {
    setState(() {
      _remainingSeconds = 300;
    });
    _startTimer();
  }

  String get _timerLabel {
    final minutes = (_remainingSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_remainingSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  void _verifyOtp(String phone) {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      AppSnackbar.warning(context, message: 'Kode OTP tidak valid');
      return;
    }

    context.read<CustomerAuthCubit>().verifyOtp(phone, otp, intent: _intent);
  }

  void _resendOtp() {
    if (_phone.isEmpty) return;

    _resetTimerOnNextOtpRequested = true;
    context.read<CustomerAuthCubit>().requestOtp(_phone, intent: _intent);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: BlocConsumer<CustomerAuthCubit, CustomerAuthState>(
        listener: (context, state) {
          if (state is CustomerAuthOtpRequested) {
            _phone = state.phone;
            _intent = state.intent;
            _hasPassword = state.hasPassword;

            if (_resetTimerOnNextOtpRequested || _timer == null) {
              _resetTimer();
              _resetTimerOnNextOtpRequested = false;
            }
          }

          if (state is CustomerAuthOtpVerifiedNewUser) {
            context.go('/register', extra: state.phone);
          } else if (state is CustomerAuthAuthenticated) {
            context.go('/home');
          } else if (state is CustomerAuthError) {
            AppSnackbar.error(context, message: state.message);
          }
        },
        builder: (context, state) {
          final isLoading = state is CustomerAuthLoading;
          final phone = state is CustomerAuthOtpRequested
              ? state.phone
              : _phone;

          return Column(
            children: [
              // Top Illustration (70%)
              Expanded(
                flex: 7,
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: Image.asset(
                        'assets/images/otp_illustration.png',
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
                        'Verifikasi OTP',
                        style: context.typography.displayLarge.copyWith(
                          color: context.colors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: context.space.xs),
                      Text(
                        'Dikirim via WhatsApp ke $phone',
                        textAlign: TextAlign.center,
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                      SizedBox(height: context.space.xl),
                      AppTextField.outlined(
                        controller: _otpController,
                        label: 'Kode OTP',
                        prefixIcon: const Icon(Icons.lock),
                        keyboardType: TextInputType.number,
                        hint: 'Masukkan 6 digit kode',
                        maxLength: 6,
                        enabled: !isLoading,
                      ),
                      SizedBox(height: context.space.lg),
                      AppButton.primary(
                        onPressed: isLoading ? null : () => _verifyOtp(phone),
                        label: isLoading ? 'Memverifikasi...' : 'Verifikasi',
                        isLoading: isLoading,
                        isFullWidth: true,
                      ),
                      SizedBox(height: context.space.md),
                      if (_remainingSeconds > 0)
                        Text(
                          'Kirim ulang OTP dalam $_timerLabel',
                          textAlign: TextAlign.center,
                          style: context.typography.bodySmall.copyWith(
                            color: context.colors.textSecondary,
                          ),
                        )
                      else
                        AppButton.outline(
                          onPressed: isLoading ? null : _resendOtp,
                          label: 'Kirim Ulang OTP',
                          isFullWidth: true,
                        ),
                      SizedBox(height: context.space.lg),
                      if (_hasPassword && !isLoading)
                        TextButton(
                          onPressed: () => context.go('/login-password', extra: phone),
                          child: const Text('Masuk dengan Password'),
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
