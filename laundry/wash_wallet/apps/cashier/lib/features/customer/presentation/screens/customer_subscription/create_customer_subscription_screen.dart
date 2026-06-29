import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../../../service_package/presentation/bloc/service_package_cubit.dart';
import '../../../../service_package/presentation/bloc/service_package_state.dart';
import '../../bloc/customer_cubit.dart';
import '../../bloc/customer_state.dart';

class CreateCustomerSubscriptionScreen extends StatefulWidget {
  final Customer customer;

  const CreateCustomerSubscriptionScreen({super.key, required this.customer});

  @override
  State<CreateCustomerSubscriptionScreen> createState() =>
      _CreateCustomerSubscriptionScreenState();
}

class _CreateCustomerSubscriptionScreenState
    extends State<CreateCustomerSubscriptionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _pricePaidController = TextEditingController();
  final _purchaseDateController = TextEditingController();
  final _noteController = TextEditingController();

  ServicePackage? _selectedServicePackage;
  String? _selectedDateBackendFormat;
  bool _isSubmitting = false;
  String? _servicePackageError;

  @override
  void initState() {
    super.initState();
    final today = DateTime.now();
    _purchaseDateController.text = DateFormat('dd/MM/yyyy').format(today);
    _selectedDateBackendFormat = DateFormat('yyyy-MM-dd').format(today);

    context.read<ServicePackageCubit>().getAll(
      isActive: true,
      perPage: 100,
    );
  }

  @override
  void dispose() {
    _pricePaidController.dispose();
    _purchaseDateController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _handleDateTap() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
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
        _purchaseDateController.text = DateFormat('dd/MM/yyyy').format(picked);
        _selectedDateBackendFormat = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  void _handleSubmit() {
    if (_selectedServicePackage == null) {
      setState(() => _servicePackageError = 'Paket layanan harus dipilih');
      return;
    }

    if (_formKey.currentState?.validate() ?? false) {
      if (_isSubmitting) return;

      setState(() => _isSubmitting = true);

      final pricePaid = double.tryParse(
        _pricePaidController.text.replaceAll(RegExp(r'[^0-9]'), ''),
      );

      if (pricePaid == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Data tidak valid'),
            backgroundColor: context.colors.error,
          ),
        );
        setState(() => _isSubmitting = false);
        return;
      }

      context.read<CustomerCubit>().storeCustomerSubscription(
        customerId: widget.customer.id,
        servicePackageId: _selectedServicePackage!.id,
        pricePaid: pricePaid,
        purchaseDate: _selectedDateBackendFormat,
        note: _noteController.text.isNotEmpty ? _noteController.text : null,
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
                    const Icon(Icons.check_circle_rounded, color: Colors.white),
                    SizedBox(width: context.space.sm),
                    const Text('Deposit berhasil ditambahkan'),
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
            setState(() => _isSubmitting = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.error_rounded, color: Colors.white),
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
          return Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildFormSection(),
                SizedBox(height: context.space.xl),
                _buildSubmitButton(state),
              ],
            ),
          );
        },
    );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Tambah Deposit',
          subtitle: widget.customer.name,
          backgroundColor: context.colors.surface,
          onBackPressed: () => Navigator.pop(context),
        ),
        scrollable: true,
        padding: EdgeInsets.symmetric(
          horizontal: context.space.lg,
          vertical: context.space.md,
        ),
        body: content,
      );
    }

    return Column(
      children: [
        PageContentHeader(
          title: 'Tambah Deposit',
          subtitle: widget.customer.name,
          breadcrumbs: [
            const BreadcrumbItem(label: 'Pelanggan'),
            BreadcrumbItem(label: 'Detail Pelanggan', onTap: () => Navigator.pop(context)),
            const BreadcrumbItem(label: 'Tambah Deposit'),
          ],
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: context.space.lg,
              vertical: context.space.md,
            ),
            child: ContentConstraint(
              child: content,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFormSection() {
    return Container(
      padding: EdgeInsets.all(context.space.lg),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.lg),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Informasi Deposit',
            style: context.typography.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.md),
          _buildServicePackageDropdown(),
          SizedBox(height: context.space.md),
          AppTextField.outlined(
            label: 'Harga Dibayar *',
            hint: 'Masukkan harga yang dibayar',
            controller: _pricePaidController,
            keyboardType: TextInputType.number,
            prefixIcon: const Icon(Icons.attach_money_rounded),
            suffixText: 'Rp',
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              _CurrencyInputFormatter(),
            ],
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Harga yang dibayar harus diisi';
              }
              final numValue = double.tryParse(
                value.replaceAll(RegExp(r'[^0-9]'), ''),
              );
              if (numValue == null) {
                return 'Harga tidak valid';
              }
              if (numValue < 0) {
                return 'Harga minimal Rp 0';
              }
              return null;
            },
          ),
          SizedBox(height: context.space.md),
          AppTextField.outlined(
            label: 'Tanggal Pembelian *',
            hint: 'Pilih tanggal',
            controller: _purchaseDateController,
            readOnly: true,
            prefixIcon: const Icon(Icons.calendar_today_rounded),
            onTap: _handleDateTap,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Tanggal pembelian harus dipilih';
              }
              return null;
            },
          ),
          SizedBox(height: context.space.md),
          AppTextField.outlined(
            label: 'Catatan',
            hint: 'Tambahkan catatan (opsional)',
            controller: _noteController,
            maxLines: 4,
            maxLength: 1000,
          ),
        ],
      ),
    );
  }

  Widget _buildServicePackageDropdown() {
    return BlocBuilder<ServicePackageCubit, ServicePackageState>(
      builder: (context, state) {
        if (state is ServicePackageLoading) {
          return AppDropdown<ServicePackage>(
            label: 'Paket Layanan *',
            hint: 'Memuat paket layanan...',
            items: const [],
            itemLabel: (package) => package.name,
            onChanged: (_) {},
            enabled: false,
          );
        }

        if (state is ServicePackageFailure) {
          return AppDropdown<ServicePackage>(
            label: 'Paket Layanan *',
            hint: 'Gagal memuat paket layanan',
            items: const [],
            itemLabel: (package) => package.name,
            onChanged: (_) {},
            enabled: false,
            errorText: state.failure.message,
          );
        }

        if (state is ServicePackagesLoaded) {
          final packages = state.packages;

          if (packages.isEmpty) {
            return AppDropdown<ServicePackage>(
              label: 'Paket Layanan *',
              hint: 'Tidak ada paket layanan tersedia',
              items: const [],
              itemLabel: (package) => package.name,
              onChanged: (_) {},
              enabled: false,
              errorText: 'Tidak ada paket layanan aktif',
            );
          }

          return AppDropdown<ServicePackage>(
            label: 'Paket Layanan *',
            hint: 'Pilih paket layanan',
            value: _selectedServicePackage,
            items: packages,
            itemLabel: (package) =>
                '${package.name} - ${package.price} (${package.validityDays} hari)',
            onChanged: (package) {
              setState(() {
                _selectedServicePackage = package;
                _servicePackageError = null;
                _pricePaidController.text = NumberFormat(
                  '#,###',
                  'id_ID',
                ).format(package.price);
              });
            },
            errorText: _servicePackageError,
            prefixIcon: const Icon(Icons.card_membership_rounded),
          );
        }

        return AppDropdown<ServicePackage>(
          label: 'Paket Layanan *',
          hint: 'Pilih paket layanan',
          items: const [],
          itemLabel: (package) => package.name,
          onChanged: (_) {},
          enabled: false,
        );
      },
    );
  }

  Widget _buildSubmitButton(CustomerState state) {
    final isLoading = state is CustomerLoading || _isSubmitting;

    return AppButton.primary(
      label: 'Simpan Deposit',
      onPressed: isLoading ? null : _handleSubmit,
      isLoading: isLoading,
      icon: const Icon(Icons.save_rounded),
    );
  }
}

class _CurrencyInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue;
    }

    final numValue = int.tryParse(newValue.text);
    if (numValue == null) {
      return oldValue;
    }

    final formatter = NumberFormat('#,###', 'id_ID');
    final formatted = formatter.format(numValue);

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
