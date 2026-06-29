import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/customer_auth_cubit.dart';
import '../bloc/customer_auth_state.dart';

class LoginScreen extends StatefulWidget {
  final String initialIntent;

  const LoginScreen({super.key, this.initialIntent = 'login'});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _requestOtp({String? intent}) {
    final resolvedIntent = intent ?? widget.initialIntent;
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      AppSnackbar.warning(
        context,
        message: 'Nomor WhatsApp tidak boleh kosong',
      );
      return;
    }

    context.read<CustomerAuthCubit>().requestOtp(phone, intent: resolvedIntent);
  }

  Future<void> _handleAuthError(String message) async {
    final normalized = message.toLowerCase();

    if (normalized == 'not_found') {
      final shouldRegister = await AppDialog.confirm(
        context,
        title: 'Nomor Belum Terdaftar',
        message: 'Nomor ini belum terdaftar. Kirim OTP untuk registrasi?',
        confirmLabel: 'Daftar',
        cancelLabel: 'Batal',
      );

      if (shouldRegister == true && mounted) {
        _requestOtp(intent: 'register');
      }
      return;
    }

    if (normalized == 'already_exists') {
      final shouldLogin = await AppDialog.confirm(
        context,
        title: 'Nomor Sudah Terdaftar',
        message: 'Nomor ini sudah terdaftar. Lanjutkan login via OTP?',
        confirmLabel: 'Lanjut Login',
        cancelLabel: 'Batal',
      );

      if (shouldLogin == true && mounted) {
        _requestOtp(intent: 'login');
      }
      return;
    }

    AppSnackbar.error(context, message: message);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<CustomerAuthCubit, CustomerAuthState>(
        listener: (context, state) {
          if (state is CustomerAuthOtpRequested) {
            context.go('/otp');
          } else if (state is CustomerAuthError) {
            _handleAuthError(state.message);
          }
        },
        builder: (context, state) {
          final isLoading = state is CustomerAuthLoading;

          return Column(
            children: [
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
                        'Selamat Datang',
                        style: context.typography.displayLarge.copyWith(
                          color: context.colors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: context.space.xs),
                      Text(
                        'Masukkan nomor WhatsApp Anda untuk melanjutkan',
                        textAlign: TextAlign.center,
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                      SizedBox(height: context.space.xl),
                      AppTextField.outlined(
                        controller: _phoneController,
                        label: 'Nomor WhatsApp',
                        prefixIcon: const Icon(Icons.phone),
                        keyboardType: TextInputType.phone,
                        hint: 'Contoh: 08123456789',
                        enabled: !isLoading,
                      ),
                      SizedBox(height: context.space.lg),
                      AppButton.primary(
                        onPressed: isLoading ? null : _requestOtp,
                        label: isLoading ? 'Memproses...' : 'Kirim OTP',
                        isLoading: isLoading,
                        isFullWidth: true,
                      ),
                      SizedBox(height: context.space.sm),
                      Center(
                        child: TextButton(
                          onPressed: () {
                            final phone = _phoneController.text.trim();
                            context.go(
                              '/login-password',
                              extra: phone.isNotEmpty ? phone : null,
                            );
                          },
                          child: Text(
                            'Masuk dengan Password',
                            style: context.typography.bodyMedium.copyWith(
                              color: context.colors.primary,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
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
