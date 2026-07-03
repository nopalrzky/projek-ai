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

    return isCompact
          ? AppLayout(
              header: AppHeader(
                title: 'Profil Saya',
                type: AppHeaderType.standard,
                onBackPressed: () => Navigator.pop(context),
              ),
              scrollable: true,
              body: BlocConsumer<AuthCubit, AuthState>(
                listener: (context, state) {
                  if (state is Authenticated) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Profil berhasil diperbarui'),
                      ),
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
                    onGenderChanged: (val) =>
                        setState(() => _selectedGender = val),
                    onSave: () => _handleSaveChanges(context),
                    isLoading: isLoading,
                  );
                },
              ),
            )
          : Column(
              children: [
                const PageContentHeader(
                  title: 'Profil Saya',
                  breadcrumbs: [BreadcrumbItem(label: 'Profil')],
                ),
                Expanded(
                  child: BlocConsumer<AuthCubit, AuthState>(
                    listener: (context, state) {
                      if (state is Authenticated) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Profil berhasil diperbarui'),
                          ),
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
                        onGenderChanged: (val) =>
                            setState(() => _selectedGender = val),
                        onSave: () => _handleSaveChanges(context),
                        isTablet: true,
                        isLoading: isLoading,
                      );
                    },
                  ),
                ),
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
  final bool isTablet;
  final bool isLoading;

  const _ProfileSettingContent({
    required this.nameController,
    required this.emailController,
    required this.phoneController,
    required this.addressController,
    required this.selectedGender,
    required this.onGenderChanged,
    required this.onSave,
    this.isTablet = false,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return ContentConstraint(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(isTablet ? context.space.xl : context.space.lg),
        child: isTablet
            ? _buildTabletLayout(context)
            : _buildMobileLayout(context),
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Column(
      children: [
        _buildAvatarSection(context),
        SizedBox(height: context.space.xl),
        _buildFormCard(context, isTablet: false),
      ],
    );
  }

  Widget _buildTabletLayout(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(flex: 4, child: _buildProfileSummaryCard(context)),
        SizedBox(width: context.space.lg),
        Expanded(flex: 6, child: _buildFormCard(context, isTablet: true)),
      ],
    );
  }

  Widget _buildProfileSummaryCard(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.xl),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(color: context.colors.outlineVariant),
      ),
      child: Column(
        children: [
          _buildAvatarSection(context),
          SizedBox(height: context.space.lg),
          Text(
            nameController.text.isEmpty
                ? 'Nama belum diisi'
                : nameController.text,
            style: context.typography.headlineSmall,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.space.xs),
          Text(
            emailController.text.isEmpty
                ? 'Email belum diisi'
                : emailController.text,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.space.lg),
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(context.space.md),
            decoration: BoxDecoration(
              color: context.colors.primaryContainer,
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
            child: Text(
              'Kelola data profil kasir agar identitas akun tetap konsisten di seluruh transaksi.',
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormCard(BuildContext context, {required bool isTablet}) {
    return Container(
      padding: EdgeInsets.all(isTablet ? context.space.xl : 0),
      decoration: BoxDecoration(
        color: isTablet ? context.colors.surface : null,
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: isTablet
            ? Border.all(color: context.colors.outlineVariant)
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isTablet) ...[
            Text('Informasi Profil', style: context.typography.headlineSmall),
            SizedBox(height: context.space.xs),
            Text(
              'Perbarui nama dan email yang digunakan pada akun kasir ini.',
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.onSurfaceVariant,
              ),
            ),
            SizedBox(height: context.space.xl),
          ],
          AppTextField.outlined(
            label: 'Nama Lengkap',
            controller: nameController,
            prefixIcon: const Icon(Icons.person_outline),
            hint: 'Nama lengkap Anda',
          ),
          SizedBox(height: context.space.md),
          AppTextField.outlined(
            label: 'Email',
            controller: emailController,
            prefixIcon: const Icon(Icons.email_outlined),
            hint: 'john@example.com',
            keyboardType: TextInputType.emailAddress,
          ),
          AppTextField.outlined(
            label: 'No. Handphone',
            controller: phoneController,
            prefixIcon: const Icon(Icons.phone_outlined),
            hint: '08xxxxxxxxxx',
            keyboardType: TextInputType.phone,
          ),
          SizedBox(height: context.space.md),
          DropdownButtonFormField<String>(
            initialValue: selectedGender,
            decoration: InputDecoration(
              labelText: 'Jenis Kelamin',
              prefixIcon: const Icon(Icons.people_outline),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
            ),
            items: const [
              DropdownMenuItem(value: 'male', child: Text('Laki-laki')),
              DropdownMenuItem(value: 'female', child: Text('Perempuan')),
            ],
            onChanged: onGenderChanged,
          ),
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
              constraints: BoxConstraints(
                minWidth: isTablet ? 220 : double.infinity,
              ),
              child: AppButton.primary(
                label: 'Simpan Perubahan',
                onPressed: onSave,
                isFullWidth: !isTablet,
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
