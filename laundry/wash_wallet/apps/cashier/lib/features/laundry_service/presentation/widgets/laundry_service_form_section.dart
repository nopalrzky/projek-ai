import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../features/unit/presentation/bloc/unit_cubit.dart';
import '../../../../features/unit/presentation/bloc/unit_state.dart';
import '../../../../features/category/presentation/bloc/category_cubit.dart';
import '../../../../features/category/presentation/bloc/category_state.dart';

class LaundryServiceFormSection extends StatelessWidget {
  final GlobalKey<FormState> formKey;

  final TextEditingController nameController;
  final TextEditingController descController;
  final TextEditingController priceController;
  final TextEditingController durationController;
  final TextEditingController minQtyController;

  final int? selectedCategoryId;
  final int? selectedUnitId;
  final ValueChanged<int?> onCategoryChanged;
  final ValueChanged<int?> onUnitChanged;

  final bool? isActive;
  final ValueChanged<bool>? onActiveChanged;

  // Actions
  final VoidCallback onSubmit;
  final bool isLoading;
  final String submitLabel;

  const LaundryServiceFormSection({
    super.key,
    required this.formKey,
    required this.nameController,
    required this.descController,
    required this.priceController,
    required this.durationController,
    required this.minQtyController,
    required this.selectedCategoryId,
    required this.selectedUnitId,
    required this.onCategoryChanged,
    required this.onUnitChanged,
    this.isActive,
    this.onActiveChanged,
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
          _buildSectionTitle(context, 'Detail Layanan'),
          Text(
            'Informasi dasar layanan yang akan ditampilkan di aplikasi.',
            style: context.typography.bodySmall.copyWith(
              color: context.colors.onSurfaceVariant,
            ),
          ),
          SizedBox(height: context.space.md),
          _buildNameField(context),
          SizedBox(height: context.space.md),
          _buildCategoryDropdown(context),
          SizedBox(height: context.space.md),
          _buildDescriptionField(context),

          SizedBox(height: context.space.xl),
          _buildSectionTitle(context, 'Harga & Pengerjaan'),
          Text(
            'Tentukan harga per satuan dan estimasi waktu pengerjaan.',
            style: context.typography.bodySmall.copyWith(
              color: context.colors.onSurfaceVariant,
            ),
          ),
          SizedBox(height: context.space.md),
          Row(
            children: [
              Expanded(flex: 2, child: _buildPriceField(context)),
              SizedBox(width: context.space.md),
              Expanded(flex: 1, child: _buildUnitDropdown(context)),
            ],
          ),
          SizedBox(height: context.space.md),
          Row(
            children: [
              Expanded(child: _buildDurationField(context)),
              SizedBox(width: context.space.md),
              Expanded(child: _buildMinQtyField(context)),
            ],
          ),

          if (isActive != null && onActiveChanged != null) ...[
            SizedBox(height: context.space.xl),
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
      decoration: const InputDecoration(
        labelText: 'Nama Layanan *',
        hintText: 'Cth: Cuci Kering, Setrika',
        prefixIcon: Icon(Icons.local_laundry_service_outlined),
      ),
      textInputAction: TextInputAction.next,
      validator: (value) =>
          (value == null || value.isEmpty) ? 'Nama wajib diisi' : null,
      enabled: !isLoading,
    );
  }

  Widget _buildDescriptionField(BuildContext context) {
    return TextFormField(
      controller: descController,
      decoration: const InputDecoration(
        labelText: 'Deskripsi (Opsional)',
        prefixIcon: Icon(Icons.description_outlined),
        alignLabelWithHint: true,
      ),
      maxLines: 2,
      textInputAction: TextInputAction.next,
      enabled: !isLoading,
    );
  }

  Widget _buildPriceField(BuildContext context) {
    return TextFormField(
      controller: priceController,
      decoration: const InputDecoration(
        labelText: 'Harga *',
        prefixIcon: Icon(Icons.attach_money),
        prefixText: 'Rp ',
      ),
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      textInputAction: TextInputAction.next,
      validator: (value) =>
          (value == null || value.isEmpty) ? 'Wajib diisi' : null,
      enabled: !isLoading,
    );
  }

  Widget _buildDurationField(BuildContext context) {
    return TextFormField(
      controller: durationController,
      decoration: const InputDecoration(
        labelText: 'Durasi (Jam) *',
        prefixIcon: Icon(Icons.timer_outlined),
        suffixText: 'Jam',
      ),
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      textInputAction: TextInputAction.next,
      validator: (value) =>
          (value == null || value.isEmpty) ? 'Wajib diisi' : null,
      enabled: !isLoading,
    );
  }

  Widget _buildMinQtyField(BuildContext context) {
    return TextFormField(
      controller: minQtyController,
      decoration: const InputDecoration(
        labelText: 'Min. Qty',
        prefixIcon: Icon(Icons.shopping_basket_outlined),
      ),
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      textInputAction: TextInputAction.done,
      enabled: !isLoading,
    );
  }

  Widget _buildCategoryDropdown(BuildContext context) {
    return BlocBuilder<CategoryCubit, CategoryState>(
      builder: (context, state) {
        if (state is CategoryLoading) {
          return const LinearProgressIndicator();
        }

        if (state is CategoriesLoaded && state.categories.isEmpty) {
          return Container(
            padding: EdgeInsets.all(context.space.md),
            decoration: BoxDecoration(
              color: Theme.of(
                context,
              ).colorScheme.errorContainer.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(context.radius.md),
              border: Border.all(color: Theme.of(context).colorScheme.error),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.warning_amber_rounded,
                      color: Theme.of(context).colorScheme.error,
                      size: 20,
                    ),
                    SizedBox(width: context.space.sm),
                    Text(
                      'Kategori Belum Ada',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Theme.of(context).colorScheme.error,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: context.space.xs),
                Text(
                  'Buat minimal 1 kategori agar dapat melanjutkan.',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.onErrorContainer,
                  ),
                ),
                SizedBox(height: context.space.sm),
                ElevatedButton.icon(
                  onPressed: () =>
                      context.push('/settings/setup-outlet/categories'),
                  icon: const Icon(Icons.add_rounded, size: 16),
                  label: const Text('Buat Kategori'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: context.colors.error,
                    foregroundColor: context.colors.onError,
                    padding: EdgeInsets.symmetric(
                      horizontal: context.space.md,
                      vertical: 0,
                    ),
                    minimumSize: const Size(0, 36),
                  ),
                ),
              ],
            ),
          );
        }

        List<DropdownMenuItem<int>> items = [];

        if (state is CategoriesLoaded) {
          items = state.categories
              .map((c) => DropdownMenuItem(value: c.id, child: Text(c.name)))
              .toList();
        }

        return DropdownButtonFormField<int>(
          initialValue: selectedCategoryId,
          decoration: const InputDecoration(
            labelText: 'Kategori *',
            prefixIcon: Icon(Icons.category_outlined),
          ),
          items: items,
          onChanged: isLoading ? null : onCategoryChanged,
          validator: (value) => value == null ? 'Pilih kategori' : null,
          hint: const Text('Pilih Kategori'),
        );
      },
    );
  }

  Widget _buildUnitDropdown(BuildContext context) {
    return BlocBuilder<UnitCubit, UnitState>(
      builder: (context, state) {
        List<DropdownMenuItem<int>> items = [];

        if (state is UnitsLoaded) {
          items = state.units
              .map(
                (u) =>
                    DropdownMenuItem(value: u.id, child: Text(u.symbol ?? '')),
              )
              .toList();
        }

        return DropdownButtonFormField<int>(
          initialValue: selectedUnitId,
          decoration: const InputDecoration(
            labelText: 'Satuan *',
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 16),
          ),
          items: items,
          onChanged: isLoading ? null : onUnitChanged,
          validator: (value) => value == null ? 'Pilih' : null,
          hint: const Text('Unit'),
        );
      },
    );
  }

  // --- ACTIONS ---

  Widget _buildStatusSwitch(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.border),
      ),
      child: SwitchListTile(
        value: isActive ?? true,
        onChanged: isLoading ? null : onActiveChanged,
        title: Text('Status Aktif', style: context.typography.bodyLarge),
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
        foregroundColor: context.colors.onPrimary,
      ),
      child: isLoading
          ? SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: context.colors.onPrimary,
              ),
            )
          : Text(submitLabel),
    );
  }
}
