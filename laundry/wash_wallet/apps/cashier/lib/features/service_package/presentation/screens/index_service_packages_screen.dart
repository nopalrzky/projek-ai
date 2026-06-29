import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/service_package_cubit.dart';
import '../bloc/service_package_state.dart';
import '../widgets/service_package_search_bar.dart';
import '../widgets/service_package_list_view.dart';

class IndexServicePackagesScreen extends StatefulWidget {
  final int outletId;

  const IndexServicePackagesScreen({super.key, required this.outletId});

  @override
  State<IndexServicePackagesScreen> createState() =>
      _IndexServicePackagesScreenState();
}

class _IndexServicePackagesScreenState
    extends State<IndexServicePackagesScreen> {
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

  void _loadData() {
    context.read<ServicePackageCubit>().getAll(
      outletId: widget.outletId,
      search: _searchController.text.isEmpty ? null : _searchController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    return AppLayout(
      userName: authState is Authenticated ? authState.employee.name : null,
      onLogout: () => context.read<AuthCubit>().logout(),
      header: isCompact ? AppHeader(
        title: 'Paket Layanan',
        type: AppHeaderType.standard,
        backgroundColor: context.colors.surface,
        onBackPressed: () => context.pop(),
      ) : null,
      body: BlocConsumer<ServicePackageCubit, ServicePackageState>(
        listener: (context, state) {
          if (state is ServicePackageFailure) {
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

  Widget _buildMobileList(BuildContext context, ServicePackageState state) {
    return Column(
      children: [
        ServicePackageSearchBar(
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

  Widget _buildMobileContent(BuildContext context, ServicePackageState state) {
    if (state is ServicePackageLoading) {
      return const AppLoadingIndicator();
    }
    if (state is ServicePackageFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: _loadData,
      );
    }
    if (state is ServicePackagesLoaded) {
      if (state.packages.isEmpty) {
        return AppEmptyState(
          title: 'Belum ada paket layanan',
          description:
              'Belum ada paket layanan yang tersedia. Silakan hubungi owner untuk menambahkan paket layanan.',
          icon: Icons.card_giftcard_outlined,
        );
      }
      return ServicePackageListView(
        packages: state.packages,
        onRefresh: _loadData,
        onTap: _handleTap,
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, ServicePackageState state) {
    return AppDataView<ServicePackage>(
      breadcrumbs: const [
        BreadcrumbItem(label: 'Home'),
        BreadcrumbItem(label: 'Paket Layanan'),
      ],
      pageTitle: 'Daftar Paket Layanan',
      searchController: _searchController,
      searchHint: 'Cari paket layanan...',
      onSearch: _loadData,
      onSearchClear: () {
        _searchController.clear();
        _loadData();
      },
      columns: _buildTabletColumnDefs(context),
      rows: state is ServicePackagesLoaded ? state.packages : [],
      isLoading: state is ServicePackageLoading,
      errorMessage: state is ServicePackageFailure ? state.failure.message : null,
      emptyMessage: 'Belum ada paket layanan',
      rowActions: [
        DataTableRowAction<ServicePackage>(
          icon: Icons.visibility_outlined,
          tooltip: 'Lihat',
          onTap: _handleTap,
        ),
      ],
      onRowTap: _handleTap,
    );
  }

  List<DataTableColumnDef<ServicePackage>> _buildTabletColumnDefs(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return [
      DataTableColumnDef<ServicePackage>(
        id: 'name',
        header: 'Nama Paket',
        flex: 2,
        cellBuilder: (context, package) => Text(package.name),
      ),
      DataTableColumnDef<ServicePackage>(
        id: 'price',
        header: 'Harga',
        width: 150,
        cellBuilder: (context, package) => Text(currencyFormat.format(package.price)),
      ),
      DataTableColumnDef<ServicePackage>(
        id: 'validityDays',
        header: 'Masa Berlaku',
        width: 150,
        cellBuilder: (context, package) => Text(package.validityDays != null ? '${package.validityDays} hari' : 'Unlimited'),
      ),
      DataTableColumnDef<ServicePackage>(
        id: 'status',
        header: 'Status',
        width: 100,
        cellBuilder: (context, package) => StatusChip(
          label: package.isActive ? 'Aktif' : 'Nonaktif',
          color: package.isActive ? context.colors.success : context.colors.error,
        ),
      ),
    ];
  }

  void _handleTap(ServicePackage package) {
    context.push('/settings/setup-outlet/service-packages/${package.id}').then((_) => _loadData());
  }
}
