import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../membership_plan/presentation/bloc/membership_plan_cubit.dart';
import '../../../../membership_plan/presentation/bloc/membership_plan_state.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../bloc/customer_cubit.dart';
import '../../bloc/customer_state.dart';

class CreateMembershipContractScreen extends StatefulWidget {
  final Customer customer;

  const CreateMembershipContractScreen({super.key, required this.customer});

  @override
  State<CreateMembershipContractScreen> createState() =>
      _CreateMembershipContractScreenState();
}

class _CreateMembershipContractScreenState
    extends State<CreateMembershipContractScreen> {
  final _formKey = GlobalKey<FormState>();
  final _totalPaidController = TextEditingController();
  final _startDateController = TextEditingController();

  MembershipPlan? _selectedPlan;
  String? _selectedDateBackendFormat;
  bool _isSubmitting = false;
  String? _membershipPlanError;

  @override
  void initState() {
    super.initState();
    final today = DateTime.now();
    _startDateController.text = DateFormat('dd/MM/yyyy').format(today);
    _selectedDateBackendFormat = DateFormat('yyyy-MM-dd').format(today);

    context.read<MembershipPlanCubit>().getAll(
      outletId: widget.customer.outletId,
    );
  }

  @override
  void dispose() {
    _totalPaidController.dispose();
    _startDateController.dispose();
    super.dispose();
  }

  Future<void> _handleDateTap() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2030),
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
        _startDateController.text = DateFormat('dd/MM/yyyy').format(picked);
        _selectedDateBackendFormat = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  void _handleSubmit() {
    if (_selectedPlan == null) {
      setState(() => _membershipPlanError = 'Paket membership harus dipilih');
      return;
    }

    if (_formKey.currentState?.validate() ?? false) {
      if (_isSubmitting) return;

      setState(() => _isSubmitting = true);

      double? totalPaid;
      if (_totalPaidController.text.isNotEmpty) {
        totalPaid = double.tryParse(
          _totalPaidController.text.replaceAll(RegExp(r'[^0-9.]'), ''),
        );

        if (totalPaid == null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Total pembayaran tidak valid'),
              backgroundColor: context.colors.error,
            ),
          );
          setState(() => _isSubmitting = false);
          return;
        }
      }

      context.read<CustomerCubit>().storeMembershipContract(
        customerId: widget.customer.id,
        membershipPlanId: _selectedPlan!.id,
        startAt: _selectedDateBackendFormat,
        totalPaid: totalPaid,
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
                  const Text('Membership berhasil ditambahkan'),
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
          title: 'Tambah Membership',
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
          title: 'Tambah Membership',
          subtitle: widget.customer.name,
          breadcrumbs: [
            const BreadcrumbItem(label: 'Pelanggan'),
            BreadcrumbItem(
              label: 'Detail Pelanggan',
              onTap: () => Navigator.pop(context),
            ),
            const BreadcrumbItem(label: 'Tambah Membership'),
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
            'Informasi Membership',
            style: context.typography.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.md),
          _buildMembershipPlanDropdown(),
          SizedBox(height: context.space.md),
          AppTextField.outlined(
            label: 'Total Pembayaran',
            hint: 'Masukkan total pembayaran (opsional)',
            controller: _totalPaidController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            prefixIcon: const Icon(Icons.attach_money_rounded),
            suffixText: 'Rp',
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
              _CurrencyInputFormatter(),
            ],
            validator: (value) {
              if (value != null && value.isNotEmpty) {
                final numValue = double.tryParse(
                  value.replaceAll(RegExp(r'[^0-9.]'), ''),
                );
                if (numValue == null) {
                  return 'Total pembayaran tidak valid';
                }
                if (numValue < 0) {
                  return 'Total pembayaran tidak boleh negatif';
                }
              }
              return null;
            },
          ),
          SizedBox(height: context.space.md),
          AppTextField.outlined(
            label: 'Tanggal Mulai *',
            hint: 'Pilih tanggal mulai',
            controller: _startDateController,
            readOnly: true,
            prefixIcon: const Icon(Icons.calendar_today_rounded),
            onTap: _handleDateTap,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Tanggal mulai harus dipilih';
              }
              return null;
            },
          ),
          if (_selectedPlan != null) ...[
            SizedBox(height: context.space.md),
            _buildPlanInfo(),
          ],
        ],
      ),
    );
  }

  Widget _buildMembershipPlanDropdown() {
    return BlocBuilder<MembershipPlanCubit, MembershipPlanState>(
      builder: (context, state) {
        if (state is MembershipPlanLoading) {
          return AppDropdown<MembershipPlan>(
            label: 'Paket Membership *',
            hint: 'Memuat paket membership...',
            items: const [],
            itemLabel: (plan) => plan.name,
            onChanged: (_) {},
            enabled: false,
          );
        }

        if (state is MembershipPlanFailure) {
          return AppDropdown<MembershipPlan>(
            label: 'Paket Membership *',
            hint: 'Gagal memuat paket membership',
            items: const [],
            itemLabel: (plan) => plan.name,
            onChanged: (_) {},
            enabled: false,
            errorText: state.failure.message,
          );
        }

        if (state is MembershipPlansLoaded) {
          final plans = state.plans.where((p) => p.isActive).toList();

          if (plans.isEmpty) {
            return AppDropdown<MembershipPlan>(
              label: 'Paket Membership *',
              hint: 'Tidak ada paket membership tersedia',
              items: const [],
              itemLabel: (plan) => plan.name,
              onChanged: (_) {},
              enabled: false,
              errorText: 'Tidak ada paket membership aktif',
            );
          }

          return AppDropdown<MembershipPlan>(
            label: 'Paket Membership *',
            hint: 'Pilih paket membership',
            value: _selectedPlan,
            items: plans,
            itemLabel: (plan) => plan.name,
            onChanged: (plan) {
              setState(() {
                _selectedPlan = plan;
                _membershipPlanError = null;
                _totalPaidController.text = NumberFormat(
                  '#,###',
                  'id_ID',
                ).format(plan?.price ?? 0);
              });
            },
            errorText: _membershipPlanError,
            prefixIcon: const Icon(Icons.card_membership_rounded),
          );
        }

        return AppDropdown<MembershipPlan>(
          label: 'Paket Membership *',
          hint: 'Pilih paket membership',
          items: const [],
          itemLabel: (plan) => plan.name,
          onChanged: (_) {},
          enabled: false,
        );
      },
    );
  }

  Widget _buildPlanInfo() {
    if (_selectedPlan == null) return const SizedBox.shrink();

    final plan = _selectedPlan!;
    final priceFormatted = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(plan.price);

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(
          color: context.colors.primary.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline_rounded,
                size: 20,
                color: context.colors.primary,
              ),
              SizedBox(width: context.space.sm),
              Text(
                'Detail Paket',
                style: context.typography.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                  color: context.colors.primary,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.sm),
          _buildInfoRow('Harga', priceFormatted),
          _buildInfoRow('Durasi', '${plan.durationDays} hari'),
          _buildInfoRow('Diskon', '${plan.discountPercentage}%'),
          _buildInfoRow('Level', 'Level ${plan.level}'),
          if (plan.description != null && plan.description!.isNotEmpty) ...[
            SizedBox(height: context.space.xs),
            Text(
              plan.description!,
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(top: context.space.xs),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
          Text(
            value,
            style: context.typography.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton(CustomerState state) {
    final isLoading = state is CustomerLoading || _isSubmitting;

    return AppButton.primary(
      label: 'Simpan Membership',
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

    final numValue = double.tryParse(newValue.text);
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
