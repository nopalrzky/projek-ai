import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

class ProfileSettingScreen extends StatefulWidget {
  const ProfileSettingScreen({super.key});

  @override
  State<ProfileSettingScreen> createState() => _ProfileSettingScreenState();
}

class _ProfileSettingScreenState extends State<ProfileSettingScreen> {
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;

  @override
  void initState() {
    super.initState();
    final authState = context.read<AuthCubit>().state;
    String initialName = '';
    String initialEmail = '';

    if (authState is Authenticated) {
      initialName = authState.employee.name;
      initialEmail = authState.employee.email ?? '';
    }

    _nameController = TextEditingController(text: initialName);
    _emailController = TextEditingController(text: initialEmail);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Profil Saya',
        type: AppHeaderType.standard,
        onBackPressed: () => Navigator.pop(context),
      ),
      scrollable: true,
      body: ContentConstraint(
        child: Padding(
          padding: EdgeInsets.all(context.space.lg),
          child: Column(
            children: [
              Stack(
                alignment: Alignment.bottomRight,
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: context.colors.primaryContainer,
                    child: Icon(
                      Icons.person,
                      size: 50,
                      color: context.colors.primary,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(4.0),
                    decoration: BoxDecoration(
                      color: context.colors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.camera_alt,
                      size: 16,
                      color: context.colors.onPrimary,
                    ),
                  ),
                ],
              ),
              SizedBox(height: context.space.xl),
              AppTextField.outlined(
                label: 'Nama Lengkap',
                controller: _nameController,
                prefixIcon: const Icon(Icons.person_outline),
                hint: 'Nama lengkap Anda',
              ),
              SizedBox(height: context.space.md),
              AppTextField.outlined(
                label: 'Email',
                controller: _emailController,
                prefixIcon: const Icon(Icons.email_outlined),
                hint: 'john@example.com',
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: context.space.xl),
              AppButton.primary(
                label: 'Simpan Perubahan',
                onPressed: () => _handleSaveChanges(context),
                isFullWidth: true,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleSaveChanges(BuildContext context) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Menyimpan perubahan...')));
  }
}

