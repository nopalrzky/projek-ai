import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/category_cubit.dart';
import '../bloc/category_state.dart';
import '../widgets/category_info_card.dart';
import '../widgets/category_services_section.dart';
import 'edit_category_screen.dart';

class ShowCategoryScreen extends StatefulWidget {
  final int categoryId;

  const ShowCategoryScreen({super.key, required this.categoryId});

  @override
  State<ShowCategoryScreen> createState() => _ShowCategoryScreenState();
}

class _ShowCategoryScreenState extends State<ShowCategoryScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData({bool forceRefresh = false}) {
    context.read<CategoryCubit>().getById(
      id: widget.categoryId,
      forceRefresh: forceRefresh,
    );
  }

  void _handleRefresh() {
    _loadData(forceRefresh: true);
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
        if (state is CategoryLoading) {
          return const AppLoadingIndicator();
        }

        if (state is CategoryFailure) {
          return AppErrorState(
            message: state.failure.message,
            onRetry: () => _loadData(forceRefresh: true),
          );
        }

        if (state is CategoryDetailLoaded) {
          final category = state.category;

          return SingleChildScrollView(
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                CategoryInfoCard(category: category),
                SizedBox(height: context.space.lg),
                CategoryServicesSection(
                  services: category.laundryServices ?? [],
                ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );

    List<Widget> buildActions(CategoryState state) {
      if (state is CategoryDetailLoaded) {
        return [
          IconButton(
            onPressed: _handleRefresh,
            icon: Icon(
              Icons.refresh_rounded,
              color: context.colors.textPrimary,
            ),
            tooltip: 'Muat Ulang',
          ),
          PopupMenuButton<String>(
            icon: Icon(
              Icons.more_vert_rounded,
              color: context.colors.textPrimary,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
            elevation: 8,
            onSelected: (value) {
              if (value == 'edit') {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        EditCategoryScreen(category: state.category),
                  ),
                ).then((result) {
                  if (result == true) {
                    _handleRefresh();
                  }
                });
              } else if (value == 'delete') {
                _handleDelete();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: context.colors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.edit_rounded,
                        size: 18,
                        color: context.colors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text('Edit'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: context.colors.error.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.delete_rounded,
                        size: 18,
                        color: context.colors.error,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Hapus',
                      style: TextStyle(color: context.colors.error),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ];
      }
      return [];
    }

    if (isCompact) {
      return BlocBuilder<CategoryCubit, CategoryState>(
        builder: (context, state) {
          return AppLayout(
            header: AppHeader(
              title: 'Detail Kategori',
              backgroundColor: context.colors.surface,
              onBackPressed: () => Navigator.pop(context),
              actions: buildActions(state),
            ),
            body: content,
          );
        }
      );
    }

    return BlocBuilder<CategoryCubit, CategoryState>(
      builder: (context, state) {
        return Column(
          children: [
            PageContentHeader(
              title: 'Detail Kategori',
              breadcrumbs: [
                const BreadcrumbItem(label: 'Pengaturan'),
                BreadcrumbItem(label: 'Kategori', onTap: () => Navigator.pop(context)),
                const BreadcrumbItem(label: 'Detail Kategori'),
              ],
              actions: buildActions(state),
            ),
            Expanded(
              child: ContentConstraint(
                child: content,
              ),
            ),
          ],
        );
      }
    );
  }

  void _handleDelete() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: context.colors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.delete_rounded, color: context.colors.error),
            ),
            SizedBox(width: context.space.sm),
            const Text('Hapus Kategori'),
          ],
        ),
        content: const Text(
          'Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<CategoryCubit>().destroy(widget.categoryId);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: context.colors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }
}
