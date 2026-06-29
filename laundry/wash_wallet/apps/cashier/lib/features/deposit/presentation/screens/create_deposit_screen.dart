import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../account/presentation/bloc/account_cubit.dart';
import '../../../account/presentation/bloc/account_state.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/deposit_cubit.dart';
import '../bloc/deposit_state.dart';

class CreateDepositScreen extends StatefulWidget {
  final int outletId;
  const CreateDepositScreen({super.key, required this.outletId});

  @override
  State<CreateDepositScreen> createState() => _CreateDepositScreenState();
}

class _CreateDepositScreenState extends State<CreateDepositScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();

  int? _selectedDestinationAccountId;
  File? _selectedImage;
  bool _isLoadingImage = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AccountCubit>().loadTransferAccounts(widget.outletId);
    });
  }

  @override
  void dispose() {
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    setState(() => _isLoadingImage = true);

    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.error_rounded, color: Colors.white),
                SizedBox(width: context.space.sm),
                Expanded(child: Text('Gagal memilih gambar: $e')),
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
    } finally {
      setState(() => _isLoadingImage = false);
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
                Icon(Icons.error_rounded, color: Colors.white),
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

      context.read<DepositCubit>().store(
        destinationAccountId: _selectedDestinationAccountId!,
        amount: amount,
        notes: _notesController.text.isNotEmpty ? _notesController.text : null,
        attachmentPath: _selectedImage?.path,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<DepositCubit, DepositState>(
        listener: (context, state) {
          if (state is DepositActionSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    Icon(Icons.check_circle_rounded, color: Colors.white),
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
          if (state is DepositFailure) {
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
        builder: (context, depositState) {
          final isLoading = depositState is DepositLoading;

          return Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildSectionTitle('Tujuan Setoran'),
                SizedBox(height: context.space.sm),
                BlocBuilder<AccountCubit, AccountState>(
                  builder: (context, accountState) {
                    if (accountState is AccountLoading) {
                      return Container(
                        padding: EdgeInsets.all(context.space.md),
                        decoration: BoxDecoration(
                          color: context.colors.surface,
                          borderRadius: BorderRadius.circular(
                            context.radius.md,
                          ),
                          border: Border.all(color: context.colors.border),
                        ),
                        child: Center(
                          child: CircularProgressIndicator(
                            color: context.colors.primary,
                          ),
                        ),
                      );
                    }

                    if (accountState is AccountsLoaded) {
                      final accounts = accountState.accounts;

                      if (accounts.isEmpty) {
                        return Container(
                          padding: EdgeInsets.all(context.space.md),
                          decoration: BoxDecoration(
                            color: context.colors.surfaceVariant,
                            borderRadius: BorderRadius.circular(
                              context.radius.md,
                            ),
                            border: Border.all(color: context.colors.border),
                          ),
                          child: Text(
                            'Tidak ada akun tujuan tersedia',
                            style: context.typography.bodyMedium.copyWith(
                              color: context.colors.textSecondary,
                            ),
                          ),
                        );
                      }

                      return DropdownButtonFormField<int>(
                        initialValue: _selectedDestinationAccountId,
                        decoration: InputDecoration(
                          hintText: 'Pilih akun tujuan',
                          filled: true,
                          fillColor: context.colors.surface,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              context.radius.md,
                            ),
                            borderSide: BorderSide(
                              color: context.colors.border,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              context.radius.md,
                            ),
                            borderSide: BorderSide(
                              color: context.colors.border,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              context.radius.md,
                            ),
                            borderSide: BorderSide(
                              color: context.colors.primary,
                              width: 2,
                            ),
                          ),
                          errorBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(
                              context.radius.md,
                            ),
                            borderSide: BorderSide(color: context.colors.error),
                          ),
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: context.space.md,
                            vertical: context.space.sm,
                          ),
                        ),
                        items: accounts.map((account) {
                          return DropdownMenuItem<int>(
                            value: account.id,
                            child: Text(
                              account.name,
                              style: context.typography.bodyMedium,
                            ),
                          );
                        }).toList(),
                        onChanged: isLoading
                            ? null
                            : (value) {
                                setState(() {
                                  _selectedDestinationAccountId = value;
                                });
                              },
                        validator: (value) {
                          if (value == null) {
                            return 'Pilih akun tujuan';
                          }
                          return null;
                        },
                      );
                    }

                    if (accountState is AccountFailure) {
                      return Container(
                        padding: EdgeInsets.all(context.space.md),
                        decoration: BoxDecoration(
                          color: context.colors.errorSurface,
                          borderRadius: BorderRadius.circular(
                            context.radius.md,
                          ),
                          border: Border.all(color: context.colors.error),
                        ),
                        child: Column(
                          children: [
                            Text(
                              accountState.failure.message,
                              style: context.typography.bodyMedium.copyWith(
                                color: context.colors.error,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            SizedBox(height: context.space.sm),
                            ElevatedButton.icon(
                              onPressed: () {
                                context
                                    .read<AccountCubit>()
                                    .loadTransferAccounts(widget.outletId);
                              },
                              icon: Icon(Icons.refresh_rounded),
                              label: Text('Coba Lagi'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: context.colors.primary,
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    return const SizedBox.shrink();
                  },
                ),
                SizedBox(height: context.space.lg),

                _buildSectionTitle('Jumlah Setoran'),
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
                      return 'Jumlah setoran minimal Rp 1';
                    }
                    return null;
                  },
                ),
                SizedBox(height: context.space.lg),

                _buildSectionTitle('Keterangan (Opsional)'),
                SizedBox(height: context.space.sm),
                TextFormField(
                  controller: _notesController,
                  decoration: InputDecoration(
                    hintText: 'Tambahkan keterangan',
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
                  maxLines: 3,
                  maxLength: 1000,
                  enabled: !isLoading,
                ),
                SizedBox(height: context.space.lg),

                _buildSectionTitle('Bukti Setoran (Opsional)'),
                SizedBox(height: context.space.sm),
                if (_selectedImage != null)
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      color: context.colors.surface,
                      borderRadius: BorderRadius.circular(context.radius.md),
                      border: Border.all(color: context.colors.border),
                    ),
                    child: Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(
                            context.radius.md,
                          ),
                          child: Image.file(
                            _selectedImage!,
                            width: double.infinity,
                            height: 200,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: context.space.sm,
                          right: context.space.sm,
                          child: IconButton(
                            onPressed: isLoading
                                ? null
                                : () {
                                    setState(() {
                                      _selectedImage = null;
                                    });
                                  },
                            icon: Icon(Icons.close_rounded),
                            style: IconButton.styleFrom(
                              backgroundColor: context.colors.error,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  InkWell(
                    onTap: isLoading || _isLoadingImage ? null : _pickImage,
                    borderRadius: BorderRadius.circular(context.radius.md),
                    child: Container(
                      height: 120,
                      decoration: BoxDecoration(
                        color: context.colors.surfaceVariant,
                        borderRadius: BorderRadius.circular(context.radius.md),
                        border: Border.all(
                          color: context.colors.border,
                          style: BorderStyle.solid,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: _isLoadingImage
                            ? CircularProgressIndicator(
                                color: context.colors.primary,
                              )
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.add_photo_alternate_outlined,
                                    size: 48,
                                    color: context.colors.textSecondary,
                                  ),
                                  SizedBox(height: context.space.xs),
                                  Text(
                                    'Pilih Gambar',
                                    style: context.typography.bodyMedium
                                        .copyWith(
                                          color: context.colors.textSecondary,
                                        ),
                                  ),
                                  SizedBox(height: context.space.xs),
                                  Text(
                                    'JPG, PNG, atau PDF (Max: 5MB)',
                                    style: context.typography.bodySmall
                                        .copyWith(
                                          color: context.colors.textTertiary,
                                        ),
                                  ),
                                ],
                              ),
                      ),
                    ),
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
                      disabledBackgroundColor: context.colors.primary
                          .withValues(alpha: 0.6),
                    ),
                    child: isLoading
                        ? SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            'Buat Setoran',
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
                          'Setoran akan menunggu persetujuan dari admin/owner sebelum diproses.',
                          style: context.typography.bodySmall.copyWith(
                            color: context.colors.textSecondary,
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
          title: 'Buat Setoran',
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
          title: 'Buat Setoran',
          breadcrumbs: [
            const BreadcrumbItem(label: 'Dana'),
            BreadcrumbItem(label: 'Setoran', onTap: () => Navigator.pop(context)),
            const BreadcrumbItem(label: 'Buat Setoran'),
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
