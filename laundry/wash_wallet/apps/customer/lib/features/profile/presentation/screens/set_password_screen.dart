import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_state.dart';

class SetPasswordScreen extends StatefulWidget {
  const SetPasswordScreen({super.key});

  @override
  State<SetPasswordScreen> createState() => _SetPasswordScreenState();
}

class _SetPasswordScreenState extends State<SetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _submitted = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _submit() {
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (password.isEmpty) {
      AppSnackbar.warning(context, message: 'Password wajib diisi.');
      return;
    }

    if (password.length < 8) {
      AppSnackbar.warning(context, message: 'Password minimal 8 karakter.');
      return;
    }

    if (password != confirmPassword) {
      AppSnackbar.warning(context, message: 'Konfirmasi password tidak cocok.');
      return;
    }

    _submitted = true;
    context.read<CustomerAuthCubit>().setPassword(
      password: password,
      passwordConfirmation: confirmPassword,
    );
  }

  void _goBack() {
    if (context.canPop()) {
      context.pop();
      return;
    }

    context.go('/profile');
  }

  void _goToProfile() {
    context.go('/profile');
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CustomerAuthCubit, CustomerAuthState>(
      listener: (context, state) {
        if (state is CustomerAuthError) {
          AppSnackbar.error(context, message: state.message);
          return;
        }

        if (state is CustomerAuthAuthenticated &&
            _submitted &&
            state.customer.hasPassword == true) {
          AppSnackbar.success(context, message: 'Password berhasil dibuat.');
          _goToProfile();
        }
      },
      builder: (context, state) {
        final isLoading = state is CustomerAuthLoading;

        return AppLayout(
          showDrawer: false,
          backgroundColor: context.colors.background,
          header: AppHeader(
            title: 'Atur Password',
            onBackPressed: isLoading ? null : _goBack,
          ),
          bottomBar: SafeArea(
            top: false,
            child: Padding(
              padding: EdgeInsets.fromLTRB(
                context.space.lg,
                context.space.md,
                context.space.lg,
                context.space.lg,
              ),
              child: AppButton.primary(
                label: isLoading ? 'Menyimpan...' : 'Simpan Password',
                onPressed: isLoading ? null : _submit,
                isLoading: isLoading,
                isFullWidth: true,
              ),
            ),
          ),
          body: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AppCard.outlined(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.lock_outline_rounded,
                        color: context.colors.primary,
                      ),
                      SizedBox(height: context.space.md),
                      Text(
                        'Buat password akun',
                        style: context.typography.headlineLarge.copyWith(
                          color: context.colors.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: context.space.sm),
                      Text(
                        'Password membantu kamu login lebih mudah tanpa harus selalu memakai OTP.',
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: context.space.lg),
                AppTextField.outlined(
                  controller: _passwordController,
                  label: 'Password',
                  helperText: 'Minimal 8 karakter',
                  obscureText: _obscurePassword,
                  enabled: !isLoading,
                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                  suffixIcon: IconButton(
                    onPressed: isLoading
                        ? null
                        : () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off_rounded
                          : Icons.visibility_rounded,
                    ),
                  ),
                ),
                SizedBox(height: context.space.md),
                AppTextField.outlined(
                  controller: _confirmPasswordController,
                  label: 'Konfirmasi Password',
                  obscureText: _obscureConfirmPassword,
                  enabled: !isLoading,
                  prefixIcon: const Icon(Icons.lock_person_outlined),
                  suffixIcon: IconButton(
                    onPressed: isLoading
                        ? null
                        : () {
                            setState(() {
                              _obscureConfirmPassword =
                                  !_obscureConfirmPassword;
                            });
                          },
                    icon: Icon(
                      _obscureConfirmPassword
                          ? Icons.visibility_off_rounded
                          : Icons.visibility_rounded,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
