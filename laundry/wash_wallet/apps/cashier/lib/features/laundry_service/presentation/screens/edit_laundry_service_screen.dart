import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../features/unit/presentation/bloc/unit_cubit.dart';
import '../../../category/presentation/bloc/category_cubit.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../bloc/laundry_service_cubit.dart';
import '../bloc/laundry_service_state.dart';
import '../widgets/laundry_service_form_section.dart';

class EditLaundryServiceScreen extends StatefulWidget {
  final LaundryService service;

  const EditLaundryServiceScreen({super.key, required this.service});

  @override
  State<EditLaundryServiceScreen> createState() =>
      _EditLaundryServiceScreenState();
}

class _EditLaundryServiceScreenState extends State<EditLaundryServiceScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _descController;
  late TextEditingController _priceController;
  late TextEditingController _durationController;
  late TextEditingController _minQtyController;

  int? _selectedCategoryId;
  int? _selectedUnitId;
  late bool _isActive;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.service.name);
    _descController = TextEditingController(text: widget.service.description);
    _priceController = TextEditingController(
      text: widget.service.price.toString().replaceAll(RegExp(r'\.0$'), ''),
    );
    _durationController = TextEditingController(
      text: widget.service.durationHours.toString(),
    );
    _minQtyController = TextEditingController(
      text: widget.service.minQuantity.toString(),
    );

    _selectedCategoryId = widget.service.categoryId;
    _selectedUnitId = widget.service.unitId;
    _isActive = widget.service.isActive;

    Future.microtask(() {
      final outletId = widget.service.category?.outletId ?? 0;
      if (mounted) {
        context.read<CategoryCubit>().getAll(outletId: outletId);
        context.read<UnitCubit>().getAll();
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _durationController.dispose();
    _minQtyController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedCategoryId == null || _selectedUnitId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mohon lengkapi kategori dan satuan')),
        );
        return;
      }

      context.read<LaundryServiceCubit>().update(
        id: widget.service.id,
        unitId: _selectedUnitId,
        categoryId: _selectedCategoryId,
        name: _nameController.text,
        description: _descController.text.isNotEmpty
            ? _descController.text
            : null,
        price: double.parse(_priceController.text),
        durationHours: int.parse(_durationController.text),
        minQuantity: int.tryParse(_minQtyController.text) ?? 1,
        isActive: _isActive,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<LaundryServiceCubit, LaundryServiceState>(
      listener: (context, state) {
        if (state is LaundryServiceActionSuccess) {
          Navigator.pop(context, true);
        }
        if (state is LaundryServiceFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.failure.message),
              backgroundColor: context.colors.error,
            ),
          );
        }
      },
      builder: (context, state) {
        return LaundryServiceFormSection(
          formKey: _formKey,
          nameController: _nameController,
          descController: _descController,
          priceController: _priceController,
          durationController: _durationController,
          minQtyController: _minQtyController,
          selectedCategoryId: _selectedCategoryId,
          selectedUnitId: _selectedUnitId,
          onCategoryChanged: (val) => setState(() => _selectedCategoryId = val),
          onUnitChanged: (val) => setState(() => _selectedUnitId = val),
          isActive: _isActive,
          onActiveChanged: (val) => setState(() => _isActive = val),
          isLoading: state is LaundryServiceLoading,
          submitLabel: 'Simpan Perubahan',
          onSubmit: _handleSubmit,
        );
      },
    );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Edit Layanan',
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
          title: 'Edit Layanan',
          breadcrumbs: [
            const BreadcrumbItem(label: 'Pengaturan'),
            BreadcrumbItem(
              label: 'Layanan',
              onTap: () => Navigator.pop(context),
            ),
            const BreadcrumbItem(label: 'Edit Layanan'),
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
