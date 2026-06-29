import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_state.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _dateOfBirthController = TextEditingController();

  CustomerAccount? _customer;
  String? _selectedGender;
  String? _nameError;
  String? _emailError;
  String? _dateOfBirthError;
  bool _initialized = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _dateOfBirthController.dispose();
    super.dispose();
  }

  void _initFromCustomer(CustomerAccount customer) {
    _customer = customer;
    if (_initialized) return;

    _initialized = true;
    _nameController.text = customer.name;
    _emailController.text = customer.email ?? '';
    _dateOfBirthController.text = customer.dateOfBirth ?? '';
    _selectedGender = _normalizeGender(customer.gender);
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final initialDate = _initialDate(now);
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1900),
      lastDate: now,
    );

    if (pickedDate == null || !mounted) return;

    setState(() {
      _dateOfBirthController.text = _formatDate(pickedDate);
      _dateOfBirthError = null;
    });
  }

  DateTime _initialDate(DateTime now) {
    final currentValue = _dateOfBirthController.text.trim();
    final parsedDate = DateTime.tryParse(currentValue);
    if (parsedDate != null && !parsedDate.isAfter(now)) {
      return parsedDate;
    }

    return DateTime(now.year - 20, now.month, now.day);
  }

  String _formatDate(DateTime date) {
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');

    return '${date.year}-$month-$day';
  }

  bool _validate() {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final dateOfBirth = _dateOfBirthController.text.trim();

    String? nameError;
    String? emailError;
    String? dateOfBirthError;

    if (name.isEmpty) {
      nameError = 'Nama tidak boleh kosong';
    }

    if (email.isNotEmpty) {
      final emailRegex = RegExp(r'^[\w.-]+@([\w-]+\.)+[\w-]{2,}$');
      if (!emailRegex.hasMatch(email)) {
        emailError = 'Format email tidak valid';
      }
    }

    if (dateOfBirth.isNotEmpty) {
      final parsedDate = DateTime.tryParse(dateOfBirth);
      final now = DateTime.now();
      if (parsedDate == null) {
        dateOfBirthError = 'Format tanggal lahir tidak valid';
      } else if (parsedDate.isAfter(DateTime(now.year, now.month, now.day))) {
        dateOfBirthError = 'Tanggal lahir tidak boleh di masa depan';
      }
    }

    setState(() {
      _nameError = nameError;
      _emailError = emailError;
      _dateOfBirthError = dateOfBirthError;
    });

    return nameError == null && emailError == null && dateOfBirthError == null;
  }

  void _submit() {
    if (_isSubmitting || !_validate()) return;

    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final dateOfBirth = _dateOfBirthController.text.trim();

    setState(() {
      _isSubmitting = true;
    });

    context.read<CustomerAuthCubit>().updateProfile(
      name: name,
      email: email.isEmpty ? null : email,
      gender: _selectedGender,
      dateOfBirth: dateOfBirth.isEmpty ? null : dateOfBirth,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CustomerAuthCubit, CustomerAuthState>(
      listener: (context, state) {
        if (state is CustomerAuthError && _isSubmitting) {
          setState(() {
            _isSubmitting = false;
          });
          AppSnackbar.error(context, message: state.message);
          return;
        }

        if (state is CustomerAuthAuthenticated && _isSubmitting) {
          setState(() {
            _isSubmitting = false;
          });
          AppSnackbar.success(context, message: 'Profil berhasil diperbarui');
          context.pop();
        }
      },
      builder: (context, state) {
        if (state is CustomerAuthAuthenticated) {
          _initFromCustomer(state.customer);
        }

        final customer = _customer;
        final isLoading = _isSubmitting && state is CustomerAuthLoading;

        return Scaffold(
          backgroundColor: context.colors.background,
          appBar: AppBar(
            title: Text(
              'Edit Profil',
              style: context.typography.titleMedium.copyWith(
                color: context.colors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            backgroundColor: context.colors.surface,
            foregroundColor: context.colors.textPrimary,
            elevation: 0,
          ),
          body: customer == null
              ? const Center(child: AppLoadingIndicator())
              : SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: EdgeInsets.all(context.space.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _PhoneInfoRow(phone: customer.phone),
                      SizedBox(height: context.space.xl),
                      AppTextField.outlined(
                        controller: _nameController,
                        label: 'Nama Lengkap',
                        hint: 'Masukkan nama lengkap',
                        keyboardType: TextInputType.name,
                        textInputAction: TextInputAction.next,
                        errorText: _nameError,
                        onChanged: (_) {
                          if (_nameError == null) return;
                          setState(() {
                            _nameError = null;
                          });
                        },
                      ),
                      SizedBox(height: context.space.md),
                      AppTextField.outlined(
                        controller: _emailController,
                        label: 'Email',
                        hint: 'Masukkan email',
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        errorText: _emailError,
                        helperText: 'Opsional',
                        onChanged: (_) {
                          if (_emailError == null) return;
                          setState(() {
                            _emailError = null;
                          });
                        },
                      ),
                      SizedBox(height: context.space.md),
                      _GenderSelector(
                        value: _selectedGender,
                        onChanged: (value) {
                          setState(() {
                            _selectedGender = value;
                          });
                        },
                      ),
                      SizedBox(height: context.space.md),
                      AppTextField.outlined(
                        controller: _dateOfBirthController,
                        label: 'Tanggal Lahir',
                        hint: 'Pilih tanggal lahir',
                        readOnly: true,
                        errorText: _dateOfBirthError,
                        helperText: 'Opsional',
                        suffixIcon: Icon(
                          Icons.calendar_today_outlined,
                          color: context.colors.textSecondary,
                        ),
                        onTap: _pickDateOfBirth,
                      ),
                      SizedBox(height: context.space.xxl),
                    ],
                  ),
                ),
          bottomNavigationBar: customer == null
              ? null
              : SafeArea(
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.space.lg,
                      vertical: context.space.md,
                    ),
                    child: AppButton.primary(
                      label: 'Simpan',
                      isLoading: isLoading,
                      isFullWidth: true,
                      onPressed: isLoading ? null : _submit,
                    ),
                  ),
                ),
        );
      },
    );
  }

  String? _normalizeGender(String? gender) {
    if (gender == 'male' || gender == 'female') return gender;
    return null;
  }
}

class _PhoneInfoRow extends StatelessWidget {
  final String phone;

  const _PhoneInfoRow({required this.phone});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          Icon(Icons.phone_outlined, color: context.colors.textSecondary),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Nomor HP',
                  style: context.typography.labelSmall.copyWith(
                    color: context.colors.textTertiary,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(
                  phone,
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          SizedBox(width: context.space.sm),
          Text(
            'Tidak dapat diubah',
            style: context.typography.labelSmall.copyWith(
              color: context.colors.textDisabled,
            ),
          ),
        ],
      ),
    );
  }
}

class _GenderSelector extends StatelessWidget {
  final String? value;
  final ValueChanged<String?> onChanged;

  const _GenderSelector({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Gender',
          style: context.typography.labelMedium.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        SizedBox(height: context.space.xs),
        Row(
          children: [
            Expanded(
              child: _GenderOption(
                label: 'Laki-laki',
                value: 'male',
                selectedValue: value,
                onTap: () => onChanged(value == 'male' ? null : 'male'),
              ),
            ),
            SizedBox(width: context.space.sm),
            Expanded(
              child: _GenderOption(
                label: 'Perempuan',
                value: 'female',
                selectedValue: value,
                onTap: () => onChanged(value == 'female' ? null : 'female'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _GenderOption extends StatelessWidget {
  final String label;
  final String value;
  final String? selectedValue;
  final VoidCallback onTap;

  const _GenderOption({
    required this.label,
    required this.value,
    required this.selectedValue,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = selectedValue == value;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: EdgeInsets.symmetric(
          vertical: context.space.sm,
          horizontal: context.space.md,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? context.colors.primarySurface
              : context.colors.surface,
          border: Border.all(
            color: isSelected ? context.colors.primary : context.colors.border,
            width: isSelected ? 1.5 : 1,
          ),
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isSelected) ...[
              Icon(
                Icons.check_circle_rounded,
                size: context.space.md,
                color: context.colors.primary,
              ),
              SizedBox(width: context.space.xs),
            ],
            Flexible(
              child: Text(
                label,
                style: context.typography.labelMedium.copyWith(
                  color: isSelected
                      ? context.colors.primary
                      : context.colors.textSecondary,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
