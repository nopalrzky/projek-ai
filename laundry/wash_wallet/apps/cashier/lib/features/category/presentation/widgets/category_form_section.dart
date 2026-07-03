import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CategoryFormSection extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController descriptionController;
  final bool? isActive;
  final ValueChanged<bool>? onActiveChanged;
  final bool isLoading;
  final VoidCallback onSubmit;
  final String submitLabel;

  const CategoryFormSection({
    super.key,
    required this.formKey,
    required this.nameController,
    required this.descriptionController,
    this.isActive,
    this.onActiveChanged,
    required this.isLoading,
    required this.onSubmit,
    required this.submitLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildSectionTitle(context, 'Detail Kategori'),
          Text(
            'Kategori digunakan untuk mengelompokkan layanan laundry agar lebih mudah ditemukan di menu kasir.',
            style: context.typography.bodySmall.copyWith(
              color: context.colors.onSurfaceVariant,
            ),
          ),
          SizedBox(height: context.space.md),
          _buildNameField(context),
          SizedBox(height: context.space.md),
          _buildDescriptionField(context),
          if (isActive != null && onActiveChanged != null) ...[
            SizedBox(height: context.space.lg),
            _buildStatusSwitch(context),
          ],
          SizedBox(height: context.space.xxl),
          _buildSubmitButton(context),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: context.typography.headlineMedium.copyWith(
        fontWeight: FontWeight.bold,
        color: context.colors.primary,
      ),
    );
  }

  Widget _buildNameField(BuildContext context) {
    return TextFormField(
      controller: nameController,
      decoration: InputDecoration(
        labelText: 'Nama Kategori',
        hintText: 'Contoh: Pakaian, Sepatu, Karpet',
        prefixIcon: const Icon(Icons.category_outlined),
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
          borderSide: BorderSide(color: context.colors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(color: context.colors.error),
        ),
      ),
      textInputAction: TextInputAction.next,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Nama kategori wajib diisi';
        }
        if (value.length < 3) {
          return 'Nama kategori minimal 3 karakter';
        }
        return null;
      },
      enabled: !isLoading,
    );
  }

  Widget _buildDescriptionField(BuildContext context) {
    return TextFormField(
      controller: descriptionController,
      decoration: InputDecoration(
        labelText: 'Deskripsi (Opsional)',
        hintText: 'Tambahkan detail kategori...',
        prefixIcon: const Icon(Icons.description_outlined),
        alignLabelWithHint: true,
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
          borderSide: BorderSide(color: context.colors.primary, width: 2),
        ),
      ),
      maxLines: 3,
      maxLength: 255,
      textInputAction: TextInputAction.done,
      enabled: !isLoading,
    );
  }

  Widget _buildStatusSwitch(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.border.withValues(alpha: 0.3)),
      ),
      child: SwitchListTile(
        value: isActive!,
        onChanged: isLoading ? null : onActiveChanged,
        title: Text(
          'Status Aktif',
          style: context.typography.bodyLarge.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          isActive!
              ? 'Kategori ini dapat digunakan dalam transaksi'
              : 'Kategori ini disembunyikan dari menu transaksi',
          style: context.typography.bodySmall.copyWith(
            color: context.colors.onSurfaceVariant,
          ),
        ),
        secondary: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isActive!
                ? context.colors.success.withValues(alpha: 0.1)
                : context.colors.disabled.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(
            isActive! ? Icons.check_circle_rounded : Icons.cancel_rounded,
            color: isActive! ? context.colors.success : context.colors.disabled,
          ),
        ),
        activeThumbColor: context.colors.primary,
      ),
    );
  }

  Widget _buildSubmitButton(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onSubmit,
      style: ElevatedButton.styleFrom(
        padding: EdgeInsets.symmetric(vertical: context.space.md),
        backgroundColor: context.colors.primary,
        foregroundColor: Colors.white,
        disabledBackgroundColor: context.colors.disabled,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
        elevation: 0,
      ),
      child: isLoading
          ? SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(
                  context.colors.onPrimary,
                ),
              ),
            )
          : Text(
              submitLabel,
              style: context.typography.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
    );
  }
}
