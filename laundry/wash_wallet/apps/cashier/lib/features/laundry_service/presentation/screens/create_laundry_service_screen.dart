import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_cashier/features/category/presentation/bloc/category_cubit.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_cashier/features/unit/presentation/bloc/unit_cubit.dart';
import '../bloc/laundry_service_cubit.dart';
import '../bloc/laundry_service_state.dart';
import '../widgets/laundry_service_form_section.dart';

class CreateLaundryServiceScreen extends StatefulWidget {
  final int outletId;

  const CreateLaundryServiceScreen({super.key, required this.outletId});

  @override
  State<CreateLaundryServiceScreen> createState() =>
      _CreateLaundryServiceScreenState();
}

class _CreateLaundryServiceScreenState
    extends State<CreateLaundryServiceScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _priceController = TextEditingController();
  final _durationController = TextEditingController();
  final _minQtyController = TextEditingController(text: '1');

  int? _selectedCategoryId;
  int? _selectedUnitId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) {
        context.read<CategoryCubit>().getAll(outletId: widget.outletId);
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

      context.read<LaundryServiceCubit>().store(
        unitId: _selectedUnitId!,
        categoryId: _selectedCategoryId!,
        name: _nameController.text,
        description: _descController.text.isNotEmpty
            ? _descController.text
            : null,
        price: double.parse(_priceController.text),
        durationHours: int.parse(_durationController.text),
        minQuantity: int.tryParse(_minQtyController.text) ?? 1,
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
            onCategoryChanged: (val) =>
                setState(() => _selectedCategoryId = val),
            onUnitChanged: (val) => setState(() => _selectedUnitId = val),
            isLoading: state is LaundryServiceLoading,
            submitLabel: 'Simpan Layanan',
            onSubmit: _handleSubmit,
          );
        },
      );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Buat Layanan',
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
          title: 'Buat Layanan',
          breadcrumbs: [
            const BreadcrumbItem(label: 'Pengaturan'),
            BreadcrumbItem(label: 'Layanan', onTap: () => Navigator.pop(context)),
            const BreadcrumbItem(label: 'Buat Layanan'),
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
}
