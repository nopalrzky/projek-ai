import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/category_cubit.dart';
import '../bloc/category_state.dart';
import '../widgets/category_info_card.dart';
import '../widgets/category_services_section.dart';
import 'edit_category_screen.dart';

class ShowCategoryScreen extends StatefulWidget {
  final int categoryId;
  final bool isEmbedded;
  final VoidCallback? onClose;

  const ShowCategoryScreen({
    super.key,
    required this.categoryId,
    this.isEmbedded = false,
    this.onClose,
  });

  @override
  State<ShowCategoryScreen> createState() => _ShowCategoryScreenState();
}

class _ShowCategoryScreenState extends State<ShowCategoryScreen> {
  Category? _localCategory;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void didUpdateWidget(ShowCategoryScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.categoryId != widget.categoryId) {
      _loadData();
    }
  }

  Future<void> _loadData({bool forceRefresh = false}) async {
    if (widget.isEmbedded) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
      final category = await context.read<CategoryCubit>().fetchCategorySilently(
        id: widget.categoryId,
        forceRefresh: forceRefresh,
      );
      if (mounted) {
        setState(() {
          _localCategory = category;
          _isLoading = false;
          if (category == null) {
            _error = 'Gagal memuat kategori';
          }
        });
      }
    } else {
      context.read<CategoryCubit>().getById(
        id: widget.categoryId,
        forceRefresh: forceRefresh,
      );
    }
  }

  void _handleRefresh() {
    _loadData(forceRefresh: true);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isEmbedded) {
      return BlocListener<CategoryCubit, CategoryState>(
        listener: _blocListener,
        child: Column(
          children: [
            _buildEmbeddedHeader(),
            Expanded(
              child: _isLoading
                  ? const AppLoadingIndicator()
                  : _error != null
                  ? AppErrorState(message: _error!, onRetry: _loadData)
                  : _localCategory != null
                  ? _buildDetailContent(_localCategory!)
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      );
    }

    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<CategoryCubit, CategoryState>(
      listener: _blocListener,
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
          return _buildDetailContent(state.category);
        }

        return const SizedBox.shrink();
      },
    );

    List<Widget> buildActions(Category? category) {
      if (category != null) {
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
                    builder: (_) => EditCategoryScreen(category: category),
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
          final category = state is CategoryDetailLoaded ? state.category : null;
          return AppLayout(
            header: AppHeader(
              title: 'Detail Kategori',
              backgroundColor: context.colors.surface,
              onBackPressed: () => Navigator.pop(context),
              actions: buildActions(category),
            ),
            body: content,
          );
        },
      );
    }

    return BlocBuilder<CategoryCubit, CategoryState>(
      builder: (context, state) {
        final category = state is CategoryDetailLoaded ? state.category : null;
        return Column(
          children: [
            PageContentHeader(
              title: 'Detail Kategori',
              breadcrumbs: [
                const BreadcrumbItem(label: 'Pengaturan'),
                BreadcrumbItem(
                  label: 'Kategori',
                  onTap: () => Navigator.pop(context),
                ),
                const BreadcrumbItem(label: 'Detail Kategori'),
              ],
              actions: buildActions(category),
            ),
            Expanded(child: ContentConstraint(child: content)),
          ],
        );
      },
    );
  }

  Widget _buildEmbeddedHeader() {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.md,
        vertical: context.space.sm,
      ),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          bottom: BorderSide(color: context.colors.outlineVariant),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Detail Kategori',
              style: context.typography.titleMedium,
            ),
          ),
          if (_localCategory != null) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => EditCategoryScreen(category: _localCategory!),
                  ),
                ).then((result) {
                  if (result == true) {
                    _handleRefresh();
                  }
                });
              },
              tooltip: 'Edit',
            ),
            IconButton(
              icon: Icon(Icons.delete_outline, color: context.colors.error),
              onPressed: _handleDelete,
              tooltip: 'Hapus',
            ),
          ],
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: widget.onClose,
            tooltip: 'Tutup',
          ),
        ],
      ),
    );
  }

  void _blocListener(BuildContext context, CategoryState state) {
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
      if (!widget.isEmbedded) {
        Navigator.pop(context, true);
      } else {
        _loadData();
      }
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
  }

  Widget _buildDetailContent(Category category) {
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

  void _handleDelete() async {
    final result = await AppDialog.destructive(
      context,
      title: 'Hapus Kategori',
      message: 'Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
    );
    
    if (result == true && mounted) {
      context.read<CategoryCubit>().destroy(widget.categoryId);
      if (widget.isEmbedded && widget.onClose != null) {
        widget.onClose!();
      }
    }
  }
}
