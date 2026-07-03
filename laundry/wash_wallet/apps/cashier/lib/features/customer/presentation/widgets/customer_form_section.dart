import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CustomerFormSection extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController phoneController;
  final TextEditingController addressController;
  final TextEditingController dateOfBirthController;

  final String? selectedGender;
  final ValueChanged<String?> onGenderChanged;

  final bool? isActive;
  final ValueChanged<bool>? onActiveChanged;

  final VoidCallback onDateTap;
  final VoidCallback onSubmit;
  final bool isLoading;
  final String submitLabel;

  const CustomerFormSection({
    super.key,
    required this.formKey,
    required this.nameController,
    required this.emailController,
    required this.phoneController,
    required this.addressController,
    required this.dateOfBirthController,
    required this.selectedGender,
    required this.onGenderChanged,
    this.isActive,
    this.onActiveChanged,
    required this.onDateTap,
    required this.onSubmit,
    required this.isLoading,
    required this.submitLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildPersonalInfoCard(context),
          SizedBox(height: context.space.lg),
          _buildContactCard(context),
          if (isActive != null && onActiveChanged != null) ...[
            SizedBox(height: context.space.lg),
            _buildStatusCard(context),
          ],
          SizedBox(height: context.space.xxl),
          _buildSubmitButton(context),
          SizedBox(height: context.space.md),
        ],
      ),
    );
  }

  Widget _buildPersonalInfoCard(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.xl),
        side: BorderSide(
          color: context.colors.border.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(context.radius.xl),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              context.colors.surface,
              context.colors.surface.withValues(alpha: 0.95),
            ],
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(context.space.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionHeader(
                context,
                'Informasi Pribadi',
                Icons.person_rounded,
                context.colors.primary,
              ),
              SizedBox(height: context.space.lg),
              _buildNameField(context),
              SizedBox(height: context.space.md),
              _buildGenderDropdown(context),
              SizedBox(height: context.space.md),
              _buildDateOfBirthField(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContactCard(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.xl),
        side: BorderSide(
          color: context.colors.border.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(context.radius.xl),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              context.colors.surface,
              context.colors.surface.withValues(alpha: 0.95),
            ],
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(context.space.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionHeader(
                context,
                'Kontak & Alamat',
                Icons.contact_phone_rounded,
                context.colors.secondary,
              ),
              SizedBox(height: context.space.lg),
              _buildPhoneField(context),
              SizedBox(height: context.space.md),
              _buildEmailField(context),
              SizedBox(height: context.space.md),
              _buildAddressField(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.xl),
        side: BorderSide(
          color: context.colors.border.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(context.radius.xl),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              context.colors.surface,
              context.colors.surface.withValues(alpha: 0.95),
            ],
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(context.space.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionHeader(
                context,
                'Status Pelanggan',
                Icons.toggle_on_rounded,
                isActive == true
                    ? context.colors.success
                    : context.colors.disabled,
              ),
              SizedBox(height: context.space.sm),
              _buildStatusSwitch(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
  ) {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(context.space.sm),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(context.radius.md),
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.2),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        SizedBox(width: context.space.sm),
        Text(
          title,
          style: context.typography.headlineMedium.copyWith(
            fontWeight: FontWeight.bold,
            color: context.colors.textPrimary,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }

  Widget _buildNameField(BuildContext context) {
    return TextFormField(
      controller: nameController,
      decoration: InputDecoration(
        labelText: 'Nama Lengkap *',
        hintText: 'Masukkan nama lengkap pelanggan',
        prefixIcon: Container(
          margin: EdgeInsets.all(context.space.sm),
          padding: EdgeInsets.all(context.space.xs),
          decoration: BoxDecoration(
            color: context.colors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(
            Icons.person_outline_rounded,
            color: context.colors.primary,
          ),
        ),
        filled: true,
        fillColor: context.colors.background,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(
            color: context.colors.border.withValues(alpha: 0.3),
          ),
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
      validator: (value) =>
          (value == null || value.isEmpty) ? 'Nama wajib diisi' : null,
      enabled: !isLoading,
    );
  }

  Widget _buildGenderDropdown(BuildContext context) {
    return DropdownButtonFormField<String>(
      initialValue: selectedGender,
      decoration: InputDecoration(
        labelText: 'Jenis Kelamin',
        hintText: 'Pilih jenis kelamin',
        prefixIcon: Container(
          margin: EdgeInsets.all(context.space.sm),
          padding: EdgeInsets.all(context.space.xs),
          decoration: BoxDecoration(
            color: context.colors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(Icons.wc_rounded, color: context.colors.primary),
        ),
        filled: true,
        fillColor: context.colors.background,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(
            color: context.colors.border.withValues(alpha: 0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(color: context.colors.primary, width: 2),
        ),
      ),
      items: [
        DropdownMenuItem(
          value: 'male',
          child: Row(
            children: [
              Icon(Icons.male_rounded, color: Colors.blue, size: 20),
              SizedBox(width: context.space.sm),
              const Text('Laki-laki'),
            ],
          ),
        ),
        DropdownMenuItem(
          value: 'female',
          child: Row(
            children: [
              Icon(Icons.female_rounded, color: Colors.pink, size: 20),
              SizedBox(width: context.space.sm),
              const Text('Perempuan'),
            ],
          ),
        ),
      ],
      onChanged: isLoading ? null : onGenderChanged,
    );
  }

  Widget _buildDateOfBirthField(BuildContext context) {
    return TextFormField(
      controller: dateOfBirthController,
      readOnly: true,
      onTap: isLoading ? null : onDateTap,
      decoration: InputDecoration(
        labelText: 'Tanggal Lahir',
        hintText: 'Pilih tanggal lahir',
        prefixIcon: Container(
          margin: EdgeInsets.all(context.space.sm),
          padding: EdgeInsets.all(context.space.xs),
          decoration: BoxDecoration(
            color: context.colors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(Icons.cake_rounded, color: context.colors.primary),
        ),
        suffixIcon: Icon(
          Icons.calendar_today_rounded,
          color: context.colors.textSecondary,
        ),
        filled: true,
        fillColor: context.colors.background,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(
            color: context.colors.border.withValues(alpha: 0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(color: context.colors.primary, width: 2),
        ),
      ),
    );
  }

  Widget _buildPhoneField(BuildContext context) {
    return TextFormField(
      controller: phoneController,
      decoration: InputDecoration(
        labelText: 'No. Telepon',
        hintText: 'Contoh: 081234567890',
        prefixIcon: Container(
          margin: EdgeInsets.all(context.space.sm),
          padding: EdgeInsets.all(context.space.xs),
          decoration: BoxDecoration(
            color: context.colors.secondary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(Icons.phone_rounded, color: context.colors.secondary),
        ),
        filled: true,
        fillColor: context.colors.background,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(
            color: context.colors.border.withValues(alpha: 0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(color: context.colors.primary, width: 2),
        ),
      ),
      keyboardType: TextInputType.phone,
      textInputAction: TextInputAction.next,
      enabled: !isLoading,
    );
  }

  Widget _buildEmailField(BuildContext context) {
    return TextFormField(
      controller: emailController,
      decoration: InputDecoration(
        labelText: 'Email',
        hintText: 'Contoh: pelanggan@email.com',
        prefixIcon: Container(
          margin: EdgeInsets.all(context.space.sm),
          padding: EdgeInsets.all(context.space.xs),
          decoration: BoxDecoration(
            color: context.colors.secondary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(Icons.email_rounded, color: context.colors.secondary),
        ),
        filled: true,
        fillColor: context.colors.background,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(
            color: context.colors.border.withValues(alpha: 0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(color: context.colors.primary, width: 2),
        ),
      ),
      keyboardType: TextInputType.emailAddress,
      textInputAction: TextInputAction.next,
      enabled: !isLoading,
    );
  }

  Widget _buildAddressField(BuildContext context) {
    return TextFormField(
      controller: addressController,
      decoration: InputDecoration(
        labelText: 'Alamat',
        hintText: 'Masukkan alamat lengkap',
        prefixIcon: Container(
          margin: EdgeInsets.all(context.space.sm),
          padding: EdgeInsets.all(context.space.xs),
          decoration: BoxDecoration(
            color: context.colors.secondary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(
            Icons.location_on_rounded,
            color: context.colors.secondary,
          ),
        ),
        alignLabelWithHint: true,
        filled: true,
        fillColor: context.colors.background,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(
            color: context.colors.border.withValues(alpha: 0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
          borderSide: BorderSide(color: context.colors.primary, width: 2),
        ),
      ),
      maxLines: 3,
      textInputAction: TextInputAction.done,
      enabled: !isLoading,
    );
  }

  Widget _buildStatusSwitch(BuildContext context) {
    if (isActive == null || onActiveChanged == null) {
      return const SizedBox.shrink();
    }

    return Container(
      decoration: BoxDecoration(
        color: context.colors.background,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.border.withValues(alpha: 0.3)),
      ),
      child: SwitchListTile(
        value: isActive!,
        onChanged: isLoading ? null : onActiveChanged,
        title: Row(
          children: [
            Container(
              padding: EdgeInsets.all(context.space.xs),
              decoration: BoxDecoration(
                color:
                    (isActive!
                            ? context.colors.success
                            : context.colors.disabled)
                        .withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(context.radius.sm),
              ),
              child: Icon(
                isActive! ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: isActive!
                    ? context.colors.success
                    : context.colors.disabled,
                size: 20,
              ),
            ),
            SizedBox(width: context.space.sm),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Status Aktif',
                  style: context.typography.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  isActive!
                      ? 'Pelanggan dapat bertransaksi'
                      : 'Pelanggan tidak dapat bertransaksi',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        activeThumbColor: context.colors.success,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
      ),
    );
  }

  Widget _buildSubmitButton(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(context.radius.lg),
        gradient: LinearGradient(
          colors: [
            context.colors.primary,
            context.colors.primary.withValues(alpha: 0.8),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: context.colors.primary.withValues(alpha: 0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: isLoading ? null : onSubmit,
        style: ElevatedButton.styleFrom(
          padding: EdgeInsets.symmetric(vertical: context.space.lg),
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(context.radius.lg),
          ),
        ),
        child: isLoading
            ? Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(width: context.space.sm),
                  const Text(
                    'Menyimpan...',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                ],
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.save_rounded, color: Colors.white),
                  SizedBox(width: context.space.sm),
                  Text(
                    submitLabel,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
