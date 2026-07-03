import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';


import '../../auth/presentation/bloc/auth_cubit.dart';
import '../../auth/presentation/bloc/auth_state.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _addressController;
  String? _selectedGender;

  @override
  void initState() {
    super.initState();
    final employee = _resolveEmployee(context.read<AuthCubit>().state);

    _nameController = TextEditingController(text: employee?.name ?? '');
    _emailController = TextEditingController(text: employee?.email ?? '');
    _phoneController = TextEditingController(text: employee?.phone ?? '');
    _addressController = TextEditingController(text: employee?.address ?? '');
    _selectedGender = employee?.gender;
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
                title: 'Edit Profil',
                type: AppHeaderType.standard,
                onBackPressed: () =>
                    context.canPop() ? context.pop() : context.go('/profile'),
              ),
              scrollable: true,
              body: _buildConsumer(isTablet: false),
            )
          : Column(
              children: [
                const PageContentHeader(
                  title: 'Edit Profil',
                  breadcrumbs: [
                    BreadcrumbItem(label: 'Profil'),
                    BreadcrumbItem(label: 'Edit'),
                  ],
                ),
                Expanded(child: _buildConsumer(isTablet: true)),
              ],
            );
  }

  Widget _buildConsumer({required bool isTablet}) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is Authenticated) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profil berhasil diperbarui')),
          );
          context.go('/profile');
        } else if (state is ProfileUpdateFailure) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      builder: (context, state) {
        final isLoading = state is ProfileUpdating;

        return ContentConstraint(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(
              isTablet ? context.space.xl : context.space.lg,
            ),
            child: isTablet
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 4, child: _buildSummaryCard(context)),
                      SizedBox(width: context.space.lg),
                      Expanded(
                        flex: 6,
                        child: _buildFormCard(context, isTablet, isLoading),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      _buildSummaryCard(context),
                      SizedBox(height: context.space.lg),
                      _buildFormCard(context, isTablet, isLoading),
                    ],
                  ),
          ),
        );
      },
    );
  }

  Widget _buildSummaryCard(BuildContext context) {
    return _ProfileFormCard(
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              CircleAvatar(
                radius: 52,
                backgroundColor: context.colors.primaryContainer,
                child: Icon(
                  Icons.person,
                  size: 52,
                  color: context.colors.primary,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(4),
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
          SizedBox(height: context.space.lg),
          Text(
            _nameController.text.trim().isEmpty
                ? 'Nama belum diisi'
                : _nameController.text.trim(),
            style: context.typography.headlineSmall,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.space.xs),
          Text(
            _emailController.text.trim().isEmpty
                ? 'Email belum diisi'
                : _emailController.text.trim(),
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFormCard(BuildContext context, bool isTablet, bool isLoading) {
    return _ProfileFormCard(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Informasi Profil', style: context.typography.headlineSmall),
            SizedBox(height: context.space.xs),
            Text(
              'Perbarui data akun kasir yang digunakan pada transaksi.',
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.onSurfaceVariant,
              ),
            ),
            SizedBox(height: context.space.xl),
            AppTextField.outlined(
              label: 'Nama Lengkap',
              controller: _nameController,
              prefixIcon: const Icon(Icons.person_outline),
              hint: 'Nama lengkap Anda',
              onChanged: (_) => setState(() {}),
            ),
            SizedBox(height: context.space.md),
            AppTextField.outlined(
              label: 'Email',
              controller: _emailController,
              prefixIcon: const Icon(Icons.email_outlined),
              hint: 'john@example.com',
              keyboardType: TextInputType.emailAddress,
              onChanged: (_) => setState(() {}),
            ),
            SizedBox(height: context.space.md),
            AppTextField.outlined(
              label: 'No. Handphone',
              controller: _phoneController,
              prefixIcon: const Icon(Icons.phone_outlined),
              hint: '08xxxxxxxxxx',
              keyboardType: TextInputType.phone,
            ),
            SizedBox(height: context.space.md),
            DropdownButtonFormField<String>(
              initialValue: _selectedGender,
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
              onChanged: (value) => setState(() => _selectedGender = value),
            ),
            SizedBox(height: context.space.md),
            AppTextField.outlined(
              label: 'Alamat',
              controller: _addressController,
              prefixIcon: const Icon(Icons.location_on_outlined),
              hint: 'Alamat lengkap',
              maxLines: 3,
            ),
            SizedBox(height: context.space.xl),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (isTablet) ...[
                  AppButton.secondary(
                    label: 'Batal',
                    onPressed: isLoading ? null : () => context.go('/profile'),
                  ),
                  SizedBox(width: context.space.md),
                ],
                ConstrainedBox(
                  constraints: BoxConstraints(
                    minWidth: isTablet ? 220 : 0,
                    maxWidth: isTablet ? 260 : double.infinity,
                  ),
                  child: AppButton.primary(
                    label: 'Simpan Perubahan',
                    onPressed: isLoading ? null : _handleSaveChanges,
                    isFullWidth: !isTablet,
                    isLoading: isLoading,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _handleSaveChanges() {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Nama lengkap wajib diisi')));
      return;
    }

    context.read<AuthCubit>().updateProfile(
      name: name,
      email: _emptyToNull(_emailController.text),
      phone: _emptyToNull(_phoneController.text),
      gender: _selectedGender,
      address: _emptyToNull(_addressController.text),
    );
  }

  String? _emptyToNull(String value) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }

  AuthEmployee? _resolveEmployee(AuthState state) {
    return switch (state) {
      Authenticated(:final employee) => employee,
      AuthenticatedStale(:final employee) => employee,
      _ => null,
    };
  }
}

class _ProfileFormCard extends StatelessWidget {
  final Widget child;

  const _ProfileFormCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.space.xl),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(color: context.colors.outlineVariant),
      ),
      child: child,
    );
  }
}
