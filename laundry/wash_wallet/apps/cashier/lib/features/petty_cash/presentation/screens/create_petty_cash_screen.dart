import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/petty_cash_cubit.dart';
import '../bloc/petty_cash_state.dart';

class CreatePettyCashScreen extends StatefulWidget {
  const CreatePettyCashScreen({super.key});

  @override
  State<CreatePettyCashScreen> createState() => _CreatePettyCashScreenState();
}

class _CreatePettyCashScreenState extends State<CreatePettyCashScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();

  DateTime _selectedDate = DateTime.now();

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
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

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  void _handleSubmit() {
    if (_formKey.currentState?.validate() ?? false) {
      final authState = context.read<AuthCubit>().state;

      if (authState is! Authenticated) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_rounded, color: Colors.white),
                SizedBox(width: context.space.sm),
                const Expanded(child: Text('Anda harus login terlebih dahulu')),
              ],
            ),
            backgroundColor: context.colors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
          ),
        );
        return;
      }

      final amountText = _amountController.text
          .replaceAll('Rp', '')
          .replaceAll('.', '')
          .replaceAll(' ', '')
          .trim();
      final amount = double.tryParse(amountText) ?? 0;

      final requestDate = DateFormat('yyyy-MM-dd').format(_selectedDate);

      context.read<PettyCashCubit>().store(
        amount: amount,
        description: _descriptionController.text,
        requestDate: requestDate,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<PettyCashCubit, PettyCashState>(
      listener: (context, state) {
        if (state is PettyCashActionSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.white),
                  SizedBox(width: context.space.sm),
                  Expanded(child: Text(state.message)),
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
        if (state is PettyCashFailure) {
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
      builder: (context, pettyCashState) {
        final isLoading = pettyCashState is PettyCashLoading;

        return Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildSectionTitle('Tanggal Permintaan'),
              SizedBox(height: context.space.sm),
              InkWell(
                onTap: isLoading ? null : _selectDate,
                borderRadius: BorderRadius.circular(context.radius.md),
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: context.space.md,
                    vertical: context.space.md,
                  ),
                  decoration: BoxDecoration(
                    color: context.colors.surface,
                    borderRadius: BorderRadius.circular(context.radius.md),
                    border: Border.all(color: context.colors.border),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.calendar_today_rounded,
                        color: context.colors.primary,
                        size: 20,
                      ),
                      SizedBox(width: context.space.md),
                      Expanded(
                        child: Text(
                          DateFormat(
                            'EEEE, dd MMMM yyyy',
                            'id_ID',
                          ).format(_selectedDate),
                          style: context.typography.bodyLarge.copyWith(
                            color: context.colors.textPrimary,
                          ),
                        ),
                      ),
                      Icon(
                        Icons.arrow_drop_down_rounded,
                        color: context.colors.textSecondary,
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: context.space.lg),

              _buildSectionTitle('Jumlah Permintaan'),
              SizedBox(height: context.space.sm),
              TextFormField(
                controller: _amountController,
                decoration: InputDecoration(
                  hintText: 'Masukkan jumlah',
                  prefixText: 'Rp ',
                  filled: true,
                  fillColor: context.colors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(color: context.colors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(color: context.colors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(
                      color: context.colors.primary,
                      width: 2,
                    ),
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(color: context.colors.error),
                  ),
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: context.space.md,
                    vertical: context.space.sm,
                  ),
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  _ThousandsSeparatorInputFormatter(),
                ],
                enabled: !isLoading,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Jumlah tidak boleh kosong';
                  }
                  final amount =
                      double.tryParse(
                        value.replaceAll('.', '').replaceAll(' ', ''),
                      ) ??
                      0;
                  if (amount < 1) {
                    return 'Jumlah permintaan minimal Rp 1';
                  }
                  return null;
                },
              ),
              SizedBox(height: context.space.lg),

              _buildSectionTitle('Deskripsi Kebutuhan'),
              SizedBox(height: context.space.sm),
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  hintText: 'Jelaskan kebutuhan kas kecil',
                  filled: true,
                  fillColor: context.colors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(color: context.colors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(color: context.colors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(
                      color: context.colors.primary,
                      width: 2,
                    ),
                  ),
                  errorBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    borderSide: BorderSide(color: context.colors.error),
                  ),
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: context.space.md,
                    vertical: context.space.sm,
                  ),
                ),
                maxLines: 4,
                maxLength: 1000,
                enabled: !isLoading,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Deskripsi tidak boleh kosong';
                  }
                  if (value.length < 10) {
                    return 'Deskripsi minimal 10 karakter';
                  }
                  return null;
                },
              ),
              SizedBox(height: context.space.xl),

              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.colors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                    elevation: 0,
                    disabledBackgroundColor: context.colors.primary.withValues(
                      alpha: 0.6,
                    ),
                  ),
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        )
                      : Text(
                          'Ajukan Permintaan',
                          style: context.typography.bodyLarge.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              SizedBox(height: context.space.md),

              Container(
                padding: EdgeInsets.all(context.space.md),
                decoration: BoxDecoration(
                  color: context.colors.primarySurface.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(context.radius.md),
                  border: Border.all(
                    color: context.colors.primary.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.info_outline_rounded,
                      color: context.colors.primary,
                      size: 20,
                    ),
                    SizedBox(width: context.space.sm),
                    Expanded(
                      child: Text(
                        'Permintaan kas kecil akan direview oleh pemilik. Pastikan jumlah dan deskripsi sudah benar.',
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Buat Permintaan Kas Kecil',
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
          title: 'Buat Permintaan Kas Kecil',
          breadcrumbs: [
            const BreadcrumbItem(label: 'Dana'),
            BreadcrumbItem(
              label: 'Kas Kecil',
              onTap: () => Navigator.pop(context),
            ),
            const BreadcrumbItem(label: 'Buat Permintaan Kas Kecil'),
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

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: context.typography.headlineMedium.copyWith(
        fontWeight: FontWeight.w600,
        color: context.colors.textPrimary,
      ),
    );
  }
}

class _ThousandsSeparatorInputFormatter extends TextInputFormatter {
  final NumberFormat _formatter = NumberFormat('#,###', 'id_ID');

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (newValue.text.isEmpty) {
      return newValue;
    }

    final int value = int.tryParse(newValue.text.replaceAll('.', '')) ?? 0;
    final String newText = _formatter.format(value);

    return TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: newText.length),
    );
  }
}
