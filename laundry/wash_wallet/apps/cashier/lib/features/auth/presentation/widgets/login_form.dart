import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/auth_cubit.dart';
import '../bloc/auth_state.dart';

class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordFocusNode = FocusNode();

  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    context.read<AuthCubit>().login(
      username: _usernameController.text.trim(),
      password: _passwordController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthCubit, AuthState>(
      builder: (context, state) {
        final isLoading = state is AuthLoading;

        return Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AppTextField.outlined(
                controller: _usernameController,
                label: 'Username',
                hint: 'Masukkan username',
                prefixIcon: Icon(
                  Icons.person_outline_rounded,
                  color: context.colors.textSecondary,
                ),
                enabled: !isLoading,
                textInputAction: TextInputAction.next,
                onSubmitted: (_) {
                  _passwordFocusNode.requestFocus();
                },
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Username tidak boleh kosong';
                  }
                  if (value.trim().length < 3) {
                    return 'Username minimal 3 karakter';
                  }
                  return null;
                },
              ),
              SizedBox(height: context.space.lg),
              AppTextField.outlined(
                controller: _passwordController,
                focusNode: _passwordFocusNode,
                label: 'Password',
                hint: 'Masukkan password',
                prefixIcon: Icon(
                  Icons.lock_outline_rounded,
                  color: context.colors.textSecondary,
                ),
                obscureText: _obscurePassword,
                enabled: !isLoading,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _handleSubmit(),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                    color: context.colors.textSecondary,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Password tidak boleh kosong';
                  }
                  if (value.length < 6) {
                    return 'Password minimal 6 karakter';
                  }
                  return null;
                },
              ),
              SizedBox(height: context.space.lg),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: isLoading ? null : () {},
                  child: Text(
                    'Lupa Password?',
                    style: context.typography.bodyMedium.copyWith(
                      color: isLoading
                          ? context.colors.textDisabled
                          : context.colors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              SizedBox(height: context.space.xl),
              AppButton.primary(
                label: 'Masuk',
                onPressed: isLoading ? null : _handleSubmit,
                isLoading: isLoading,
                size: AppButtonSize.lg,
                isFullWidth: true,
                icon: isLoading
                    ? null
                    : Icon(
                        Icons.login_rounded,
                        color: context.colors.onPrimary,
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}
