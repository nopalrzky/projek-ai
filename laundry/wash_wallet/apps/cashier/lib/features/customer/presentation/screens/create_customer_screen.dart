import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/customer_cubit.dart';
import '../bloc/customer_state.dart';

import '../widgets/customer_form_section.dart';

class CreateCustomerScreen extends StatefulWidget {
  final int outletId;

  const CreateCustomerScreen({super.key, required this.outletId});

  @override
  State<CreateCustomerScreen> createState() => _CreateCustomerScreenState();
}

class _CreateCustomerScreenState extends State<CreateCustomerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _dobController = TextEditingController();

  String? _selectedGender;
  String? _selectedDateBackendFormat;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _dobController.dispose();
    super.dispose();
  }

  Future<void> _handleDateTap() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365 * 20)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: context.colors.primary,
              onPrimary: Colors.white,
              surface: context.colors.surface,
              onSurface: context.colors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _dobController.text = DateFormat('dd/MM/yyyy').format(picked);
        _selectedDateBackendFormat = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  void _handleSubmit() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<CustomerCubit>().store(
        outletId: widget.outletId,
        name: _nameController.text,
        email: _emailController.text.isNotEmpty ? _emailController.text : null,
        phone: _phoneController.text.isNotEmpty ? _phoneController.text : null,
        address: _addressController.text.isNotEmpty
            ? _addressController.text
            : null,
        gender: _selectedGender,
        dateOfBirth: _selectedDateBackendFormat,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<CustomerCubit, CustomerState>(
      listener: (context, state) {
        if (state is CustomerActionSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  Icon(Icons.check_circle_rounded, color: Colors.white),
                  SizedBox(width: context.space.sm),
                  const Text('Pelanggan berhasil ditambahkan'),
                ],
              ),
              backgroundColor: context.colors.success,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
            ),
          );
          Navigator.pop(context, true);
        }
        if (state is CustomerFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  Icon(Icons.error_rounded, color: Colors.white),
                  SizedBox(width: context.space.sm),
                  Expanded(child: Text(state.failure.message)),
                ],
              ),
              backgroundColor: context.colors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
            ),
          );
        }
      },
      builder: (context, state) {
        return CustomerFormSection(
          formKey: _formKey,
          nameController: _nameController,
          emailController: _emailController,
          phoneController: _phoneController,
          addressController: _addressController,
          dateOfBirthController: _dobController,
          selectedGender: _selectedGender,
          onGenderChanged: (val) => setState(() => _selectedGender = val),
          onDateTap: _handleDateTap,
          isLoading: state is CustomerLoading,
          onSubmit: _handleSubmit,
          submitLabel: 'Simpan Pelanggan',
        );
      },
    );

    return isCompact
          ? AppLayout(
              header: AppHeader(
                title: 'Tambah Pelanggan',
                backgroundColor: context.colors.surface,
                onBackPressed: () => Navigator.pop(context),
              ),
              scrollable: true,
              padding: EdgeInsets.symmetric(
                horizontal: context.space.lg,
                vertical: context.space.md,
              ),
              body: content,
            )
          : Column(
              children: [
                PageContentHeader(
                  title: 'Tambah Pelanggan',
                  breadcrumbs: [
                    const BreadcrumbItem(label: 'Pelanggan'),
                    BreadcrumbItem(
                      label: 'Daftar Pelanggan',
                      onTap: () => Navigator.pop(context),
                    ),
                    const BreadcrumbItem(label: 'Tambah Pelanggan'),
                  ],
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.space.lg,
                      vertical: context.space.md,
                    ),
                    child: ContentConstraint(child: content),
                  ),
                ),
              ],
            );
  }
}
