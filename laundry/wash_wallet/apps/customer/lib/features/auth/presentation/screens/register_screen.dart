import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/customer_auth_cubit.dart';
import '../bloc/customer_auth_state.dart';

class RegisterScreen extends StatefulWidget {
  final String phone;

  const RegisterScreen({super.key, required this.phone});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _dateOfBirthController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String? _gender;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _dateOfBirthController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String _resolvePhone(BuildContext context) {
    if (widget.phone.isNotEmpty) return widget.phone;

    final state = context.read<CustomerAuthCubit>().state;
    if (state is CustomerAuthOtpVerifiedNewUser) {
      return state.phone;
    }

    return '';
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 20, now.month, now.day),
      firstDate: DateTime(1900),
      lastDate: now,
    );

    if (pickedDate == null) return;

    final month = pickedDate.month.toString().padLeft(2, '0');
    final day = pickedDate.day.toString().padLeft(2, '0');
    final formatted = '${pickedDate.year}-$month-$day';
    _dateOfBirthController.text = formatted;
  }

  void _submit() {
    final phone = _resolvePhone(context);
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final dateOfBirth = _dateOfBirthController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (phone.isEmpty) {
      AppSnackbar.error(
        context,
        message: 'Nomor tidak ditemukan. Silakan ulangi verifikasi OTP.',
      );
      context.go('/login');
      return;
    }

    if (name.isEmpty) {
      AppSnackbar.warning(context, message: 'Nama lengkap wajib diisi.');
      return;
    }

    if (password.isNotEmpty && password.length < 6) {
      AppSnackbar.warning(context, message: 'Password minimal 6 karakter.');
      return;
    }

    if (password != confirmPassword) {
      AppSnackbar.warning(context, message: 'Konfirmasi password tidak cocok.');
      return;
    }

    context.read<CustomerAuthCubit>().register(
      phone: phone,
      name: name,
      email: email.isEmpty ? null : email,
      gender: _gender,
      password: password.isEmpty ? null : password,
      dateOfBirth: dateOfBirth.isEmpty ? null : dateOfBirth,
    );
  }

  @override
  Widget build(BuildContext context) {
    final phone = _resolvePhone(context);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: BlocConsumer<CustomerAuthCubit, CustomerAuthState>(
        listener: (context, state) {
          if (state is CustomerAuthAuthenticated) {
            context.go('/home');
          } else if (state is CustomerAuthError) {
            AppSnackbar.error(context, message: state.message);
          }
        },
        builder: (context, state) {
          final isLoading = state is CustomerAuthLoading;

          return Column(
            children: [
              Expanded(
                flex: 6,
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: Image.asset(
                        'assets/images/register_illustration.png',
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
                              Colors.black.withValues(alpha: 0.4),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 5,
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: context.colors.background,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(context.radius.xl),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 20,
                        offset: const Offset(0, -8),
                      ),
                    ],
                  ),
                  child: SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(
                      context.space.xl,
                      context.space.xl,
                      context.space.xl,
                      MediaQuery.of(context).padding.bottom + context.space.xl,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Daftar Akun',
                                    style: context.typography.displayLarge
                                        .copyWith(
                                          color: context.colors.textPrimary,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  SizedBox(height: context.space.xs),
                                  Text(
                                    'Lengkapi data untuk pengalaman terbaik',
                                    style: context.typography.bodyMedium
                                        .copyWith(
                                          color: context.colors.textSecondary,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: context.space.sm,
                                vertical: context.space.xs,
                              ),
                              decoration: BoxDecoration(
                                color: context.colors.success.withValues(
                                  alpha: 0.12,
                                ),
                                borderRadius: BorderRadius.circular(
                                  context.radius.lg,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.verified,
                                    size: 16,
                                    color: context.colors.success,
                                  ),
                                  SizedBox(width: context.space.xs),
                                  Text(
                                    'Verified',
                                    style: context.typography.labelSmall
                                        .copyWith(
                                          color: context.colors.success,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: context.space.lg),
                        Text(
                          'WhatsApp: $phone',
                          style: context.typography.bodySmall.copyWith(
                            color: context.colors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: context.space.xl),

                        _buildSectionHeader(context, 'Informasi Pribadi'),
                        SizedBox(height: context.space.md),
                        AppTextField.outlined(
                          controller: _nameController,
                          label: 'Nama Lengkap*',
                          prefixIcon: const Icon(Icons.person_outline),
                          enabled: !isLoading,
                        ),
                        SizedBox(height: context.space.md),
                        AppTextField.outlined(
                          controller: _emailController,
                          label: 'Email (opsional)',
                          keyboardType: TextInputType.emailAddress,
                          prefixIcon: const Icon(Icons.email_outlined),
                          enabled: !isLoading,
                        ),
                        SizedBox(height: context.space.md),
                        Row(
                          children: [
                            Expanded(
                              child: AppDropdown<String>(
                                label: 'Gender',
                                hint: 'Pilih',
                                value: _gender,
                                items: const ['male', 'female'],
                                itemLabel: (item) =>
                                    item == 'male' ? 'Pria' : 'Wanita',
                                onChanged: (value) =>
                                    setState(() => _gender = value),
                                enabled: !isLoading,
                                prefixIcon: const Icon(Icons.wc_outlined),
                              ),
                            ),
                            SizedBox(width: context.space.md),
                            Expanded(
                              child: AppTextField.outlined(
                                controller: _dateOfBirthController,
                                label: 'Tgl Lahir',
                                hint: 'YYYY-MM-DD',
                                readOnly: true,
                                enabled: !isLoading,
                                onTap: _pickDateOfBirth,
                                prefixIcon: const Icon(
                                  Icons.calendar_today_outlined,
                                ),
                              ),
                            ),
                          ],
                        ),

                        SizedBox(height: context.space.xl),
                        _buildSectionHeader(context, 'Keamanan'),
                        SizedBox(height: context.space.md),
                        AppTextField.outlined(
                          controller: _passwordController,
                          label: 'Password (opsional)',
                          obscureText: _obscurePassword,
                          enabled: !isLoading,
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            onPressed: () {
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
                        AppTextField.outlined(
                          controller: _confirmPasswordController,
                          label: 'Konfirmasi Password',
                          obscureText: _obscureConfirmPassword,
                          enabled: !isLoading,
                          prefixIcon: const Icon(Icons.lock_person_outlined),
                          suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                _obscureConfirmPassword =
                                    !_obscureConfirmPassword;
                              });
                            },
                            icon: Icon(
                              _obscureConfirmPassword
                                  ? Icons.visibility_off
                                  : Icons.visibility,
                            ),
                          ),
                        ),

                        SizedBox(height: context.space.xl),
                        AppButton.primary(
                          onPressed: isLoading ? null : _submit,
                          label: isLoading ? 'Memproses...' : 'Daftar Sekarang',
                          isLoading: isLoading,
                          isFullWidth: true,
                        ),
                        SizedBox(height: context.space.md),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Row(
      children: [
        Text(
          title.toUpperCase(),
          style: context.typography.labelSmall.copyWith(
            color: context.colors.primary,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        SizedBox(width: context.space.sm),
        Expanded(
          child: Divider(
            color: context.colors.primary.withValues(alpha: 0.15),
            thickness: 1,
          ),
        ),
      ],
    );
  }
}
