import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/category_cubit.dart';
import '../bloc/category_state.dart';
import '../widgets/category_form_section.dart';

class CreateCategoryScreen extends StatefulWidget {
  final int outletId;

  const CreateCategoryScreen({super.key, required this.outletId});

  @override
  State<CreateCategoryScreen> createState() => _CreateCategoryScreenState();
}

class _CreateCategoryScreenState extends State<CreateCategoryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<CategoryCubit>().store(
        outletId: widget.outletId,
        name: _nameController.text,
        description: _descController.text.isEmpty ? null : _descController.text,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<CategoryCubit, CategoryState>(
        listener: (context, state) {
          if (state is CategoryActionSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.white),
                    SizedBox(width: context.space.sm),
                    Text(state.message),
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
          if (state is CategoryFailure) {
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
          return CategoryFormSection(
            formKey: _formKey,
            nameController: _nameController,
            descriptionController: _descController,
            isLoading: state is CategoryLoading,
            submitLabel: 'Simpan Kategori',
            onSubmit: _handleSubmit,
          );
        },
      );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Tambah Kategori',
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
          title: 'Tambah Kategori',
          breadcrumbs: [
            const BreadcrumbItem(label: 'Pengaturan'),
            BreadcrumbItem(label: 'Kategori', onTap: () => Navigator.pop(context)),
            const BreadcrumbItem(label: 'Tambah Kategori'),
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
