import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/category_cubit.dart';
import '../bloc/category_state.dart';
import '../widgets/category_search_bar.dart';
import '../widgets/category_list_view.dart';


class IndexCategoriesScreen extends StatefulWidget {
  final int outletId;

  const IndexCategoriesScreen({super.key, required this.outletId});

  @override
  State<IndexCategoriesScreen> createState() => _IndexCategoriesScreenState();
}

class _IndexCategoriesScreenState extends State<IndexCategoriesScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadData({bool forceRefresh = false}) {
    context.read<CategoryCubit>().getAll(
      outletId: widget.outletId,
      search: _searchController.text.isEmpty ? null : _searchController.text,
      forceRefresh: forceRefresh,
    );
  }

  void _handleRefresh() {
    _loadData(forceRefresh: true);
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    return AppLayout(
      userName: authState is Authenticated ? authState.employee.name : null,
      onLogout: () => context.read<AuthCubit>().logout(),
      header: isCompact ? AppHeader(
        title: 'Daftar Kategori',
        type: AppHeaderType.standard,
        backgroundColor: context.colors.surface,
        onBackPressed: () => context.pop(),
      ) : null,
      floatingActionButton: isCompact ? FloatingActionButton.extended(
        onPressed: () => _navigateToCreateScreen(),
        backgroundColor: context.colors.primary,
        elevation: 4,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text(
          'Tambah',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ) : null,
      body: BlocConsumer<CategoryCubit, CategoryState>(
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
            _handleRefresh();
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
          if (isCompact) {
            return _buildMobileList(context, state);
          }
          return _buildTabletTable(context, state);
        },
      ),
    );
  }

  Widget _buildMobileList(BuildContext context, CategoryState state) {
    return Column(
      children: [
        CategorySearchBar(
          controller: _searchController,
          onSearch: _loadData,
          onClear: () {
            _searchController.clear();
            _loadData();
            setState(() {});
          },
        ),
        Expanded(
          child: _buildMobileContent(context, state),
        ),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, CategoryState state) {
    if (state is CategoryLoading) {
      return const AppLoadingIndicator();
    }
    if (state is CategoryFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: () => _loadData(forceRefresh: true),
      );
    }
    if (state is CategoriesLoaded) {
      if (state.categories.isEmpty) {
        return AppEmptyState(
          title: 'Belum ada kategori',
          description: 'Buat kategori baru untuk mulai menambahkan layanan',
          action: ElevatedButton.icon(
            onPressed: () => _navigateToCreateScreen(),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Buat Kategori'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(
                horizontal: context.space.lg,
                vertical: context.space.md,
              ),
            ),
          ),
        );
      }
      return CategoryListView(
        categories: state.categories,
        onTap: _handleTap,
        onEdit: _handleEdit,
        onDelete: _handleDelete,
        onRefresh: _handleRefresh,
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, CategoryState state) {
    return AppDataView<Category>(
      breadcrumbs: const [
        BreadcrumbItem(label: 'Home'),
        BreadcrumbItem(label: 'Kategori'),
      ],
      pageTitle: 'Daftar Kategori',
      searchController: _searchController,
      searchHint: 'Cari kategori...',
      onSearch: _loadData,
      onSearchClear: () {
        _searchController.clear();
        _loadData();
      },
      primaryActionLabel: 'Tambah',
      primaryActionIcon: Icons.add,
      onPrimaryAction: _navigateToCreateScreen,
      columns: _buildTabletColumnDefs(context),
      rows: state is CategoriesLoaded ? state.categories : [],
      isLoading: state is CategoryLoading,
      errorMessage: state is CategoryFailure ? state.failure.message : null,
      emptyMessage: 'Belum ada kategori',
      rowActions: [
        DataTableRowAction<Category>(
          icon: Icons.visibility_outlined,
          tooltip: 'Lihat',
          onTap: (category) => _handleTap(category.id),
        ),
        DataTableRowAction<Category>(
          icon: Icons.edit_outlined,
          tooltip: 'Edit',
          onTap: _handleEdit,
        ),
        DataTableRowAction<Category>(
          icon: Icons.delete_outline,
          tooltip: 'Hapus',
          color: context.colors.error,
          onTap: (category) => _handleDelete(category.id),
        ),
      ],
      onRowTap: (category) => _handleTap(category.id),
    );
  }

  List<DataTableColumnDef<Category>> _buildTabletColumnDefs(BuildContext context) {
    return [
      DataTableColumnDef<Category>(
        id: 'name',
        header: 'Nama Kategori',
        flex: 2,
        cellBuilder: (context, category) => Text(category.name),
      ),
      DataTableColumnDef<Category>(
        id: 'laundryServicesCount',
        header: 'Jumlah Layanan',
        width: 150,
        cellBuilder: (context, category) => Text(category.laundryServicesCount.toString()),
      ),
      DataTableColumnDef<Category>(
        id: 'status',
        header: 'Status',
        width: 100,
        cellBuilder: (context, category) => StatusChip(
          label: category.isActive ? 'Aktif' : 'Nonaktif',
          color: category.isActive ? context.colors.success : context.colors.error,
        ),
      ),
    ];
  }

  void _navigateToCreateScreen() {
    context
        .push('/settings/setup-outlet/categories/create')
        .then((_) => _handleRefresh());
  }

  void _handleTap(int id) {
    context
        .push('/settings/setup-outlet/categories/$id')
        .then((_) => _handleRefresh());
  }

  void _handleEdit(Category category) {
    context
        .push(
          '/settings/setup-outlet/categories/${category.id}/edit',
          extra: category,
        )
        .then((_) => _handleRefresh());
  }

  void _handleDelete(int id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<CategoryCubit>().destroy(id);
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
