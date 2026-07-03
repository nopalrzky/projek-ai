import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/customer_cubit.dart';
import '../bloc/customer_state.dart';

import '../widgets/customer_form_section.dart';

class EditCustomerScreen extends StatefulWidget {
  final Customer customer;

  const EditCustomerScreen({super.key, required this.customer});

  @override
  State<EditCustomerScreen> createState() => _EditCustomerScreenState();
}

class _EditCustomerScreenState extends State<EditCustomerScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _dobController;

  String? _selectedGender;
  String? _selectedDateBackendFormat;
  late bool _isActive;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.customer.name);
    _emailController = TextEditingController(text: widget.customer.email);
    _phoneController = TextEditingController(text: widget.customer.phone);
    _addressController = TextEditingController(text: widget.customer.address);
    _isActive = widget.customer.isActive;
    _selectedGender = widget.customer.gender;

    if (widget.customer.dateOfBirth != null) {
      try {
        final date = widget.customer.dateOfBirth!;
        _dobController = TextEditingController(
          text: DateFormat('dd/MM/yyyy').format(date),
        );
        _selectedDateBackendFormat = DateFormat('yyyy-MM-dd').format(date);
      } catch (e) {
        _dobController = TextEditingController();
      }
    } else {
      _dobController = TextEditingController();
    }
  }

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
    final initialDate = _selectedDateBackendFormat != null
        ? DateTime.tryParse(_selectedDateBackendFormat!) ?? DateTime.now()
        : DateTime.now().subtract(const Duration(days: 365 * 20));

    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
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
      context.read<CustomerCubit>().update(
        id: widget.customer.id,
        name: _nameController.text,
        email: _emailController.text.isNotEmpty ? _emailController.text : null,
        phone: _phoneController.text.isNotEmpty ? _phoneController.text : null,
        address: _addressController.text.isNotEmpty
            ? _addressController.text
            : null,
        gender: _selectedGender,
        dateOfBirth: _selectedDateBackendFormat,
        isActive: _isActive,
        outletId: widget.customer.outletId,
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
          Navigator.pop(context, true);
        }
        if (state is CustomerFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.failure.message),
              backgroundColor: context.colors.error,
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
          isActive: _isActive,
          onActiveChanged: (val) => setState(() => _isActive = val),
          onDateTap: _handleDateTap,
          isLoading: state is CustomerLoading,
          onSubmit: _handleSubmit,
          submitLabel: 'Simpan Perubahan',
        );
      },
    );

    return isCompact
          ? AppLayout(
              header: AppHeader(
                title: 'Edit Pelanggan',
                onBackPressed: () => Navigator.pop(context),
              ),
              scrollable: true,
              padding: EdgeInsets.all(context.space.lg),
              body: content,
            )
          : Column(
              children: [
                PageContentHeader(
                  title: 'Edit Pelanggan',
                  breadcrumbs: [
                    const BreadcrumbItem(label: 'Pelanggan'),
                    BreadcrumbItem(
                      label: 'Daftar Pelanggan',
                      onTap: () => Navigator.pop(context),
                    ),
                    const BreadcrumbItem(label: 'Edit Pelanggan'),
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
