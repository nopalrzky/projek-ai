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
  late final TextEditingController _phoneController;
  late final TextEditingController _addressController;
  String? _selectedGender;

  @override
  void initState() {
    super.initState();
    final authState = context.read<AuthCubit>().state;
    String initialName = '';
    String initialEmail = '';
    String initialPhone = '';
    String? initialGender;
    String initialAddress = '';

    if (authState is Authenticated) {
      initialName = authState.employee.name;
      initialEmail = authState.employee.email ?? '';
      initialPhone = authState.employee.phone ?? '';
      initialGender = authState.employee.gender;
      initialAddress = authState.employee.address ?? '';
    }

    _nameController = TextEditingController(text: initialName);
    _emailController = TextEditingController(text: initialEmail);
    _phoneController = TextEditingController(text: initialPhone);
    _selectedGender = initialGender;
    _addressController = TextEditingController(text: initialAddress);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;
    final body = BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is Authenticated) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profil berhasil diperbarui')),
          );
        } else if (state is ProfileUpdateFailure) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      builder: (context, state) {
        final isLoading = state is ProfileUpdating;
        return _ProfileSettingContent(
          nameController: _nameController,
          emailController: _emailController,
          phoneController: _phoneController,
          addressController: _addressController,
          selectedGender: _selectedGender,
          onGenderChanged: (val) => setState(() => _selectedGender = val),
          onSave: () => _handleSaveChanges(context),
          isLoading: isLoading,
        );
      },
    );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Profil Saya',
          type: AppHeaderType.standard,
          onBackPressed: () => Navigator.pop(context),
        ),
        scrollable: true,
        body: body,
      );
    }

    return Column(
      children: [
        const PageContentHeader(
          title: 'Profil Saya',
          breadcrumbs: [BreadcrumbItem(label: 'Profil')],
        ),
        Expanded(child: body),
      ],
    );
  }

  void _handleSaveChanges(BuildContext context) {
    context.read<AuthCubit>().updateProfile(
      name: _nameController.text,
      email: _emailController.text,
      phone: _phoneController.text,
      gender: _selectedGender,
      address: _addressController.text,
    );
  }
}

class _ProfileSettingContent extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController phoneController;
  final TextEditingController addressController;
  final String? selectedGender;
  final ValueChanged<String?> onGenderChanged;
  final VoidCallback onSave;
  final bool isLoading;

  const _ProfileSettingContent({
    required this.nameController,
    required this.emailController,
    required this.phoneController,
    required this.addressController,
    required this.selectedGender,
    required this.onGenderChanged,
    required this.onSave,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return ContentConstraint(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(context.space.lg),
        child: Column(
          children: [
            _buildAvatarSection(context),
            SizedBox(height: context.space.xl),
            _buildFormCard(context),
          ],
        ),
      ),
    );
  }

  Widget _buildFormCard(BuildContext context) {
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    Widget buildRow(Widget child1, Widget child2) {
      if (isCompact) {
        return Column(
          children: [
            child1,
            SizedBox(height: context.space.md),
            child2,
          ],
        );
      }
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: child1),
          SizedBox(width: context.space.md),
          Expanded(child: child2),
        ],
      );
    }

    final nameField = AppTextField.outlined(
      label: 'Nama Lengkap',
      controller: nameController,
      prefixIcon: const Icon(Icons.person_outline),
      hint: 'Nama lengkap Anda',
    );

    final emailField = AppTextField.outlined(
      label: 'Email',
      controller: emailController,
      prefixIcon: const Icon(Icons.email_outlined),
      hint: 'john@example.com',
      keyboardType: TextInputType.emailAddress,
    );

    final phoneField = AppTextField.outlined(
      label: 'No. Handphone',
      controller: phoneController,
      prefixIcon: const Icon(Icons.phone_outlined),
      hint: '08xxxxxxxxxx',
      keyboardType: TextInputType.phone,
    );

    final genderField = DropdownButtonFormField<String>(
      initialValue: selectedGender,
      decoration: InputDecoration(
        labelText: 'Jenis Kelamin',
        prefixIcon: const Icon(Icons.people_outline),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
      ),
      items: const [
        DropdownMenuItem(value: 'l', child: Text('Laki-laki')),
        DropdownMenuItem(value: 'p', child: Text('Perempuan')),
      ],
      onChanged: onGenderChanged,
    );

    return Container(
      padding: EdgeInsets.all(0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          buildRow(nameField, emailField),
          SizedBox(height: context.space.md),
          buildRow(phoneField, genderField),
          SizedBox(height: context.space.md),
          AppTextField.outlined(
            label: 'Alamat',
            controller: addressController,
            prefixIcon: const Icon(Icons.location_on_outlined),
            hint: 'Alamat lengkap',
            maxLines: 3,
          ),
          SizedBox(height: context.space.xl),
          Align(
            alignment: Alignment.centerRight,
            child: ConstrainedBox(
              constraints: BoxConstraints(minWidth: double.infinity),
              child: AppButton.primary(
                label: 'Simpan Perubahan',
                onPressed: onSave,
                isFullWidth: true,
                isLoading: isLoading,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarSection(BuildContext context) {
    return Stack(
      alignment: Alignment.bottomRight,
      children: [
        CircleAvatar(
          radius: 50,
          backgroundColor: context.colors.primaryContainer,
          child: Icon(Icons.person, size: 50, color: context.colors.primary),
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
    );
  }
}
