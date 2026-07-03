import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../bloc/unit_cubit.dart';
import '../bloc/unit_state.dart';
import '../widgets/unit_search_bar.dart';

class IndexUnitsScreen extends StatefulWidget {
  const IndexUnitsScreen({super.key});

  @override
  State<IndexUnitsScreen> createState() => _IndexUnitsScreenState();
}

class _IndexUnitsScreenState extends State<IndexUnitsScreen> {
  final TextEditingController _searchController = TextEditingController();
  Unit? _selectedUnit;

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
    context.read<UnitCubit>().getAll(
          search:
              _searchController.text.isEmpty ? null : _searchController.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    return AppLayout(
      userName: authState is Authenticated ? authState.employee.name : null,
      onLogout: () => context.read<AuthCubit>().logout(),
      header: isCompact
          ? AppHeader(
              title: 'Daftar Unit',
              type: AppHeaderType.standard,
              backgroundColor: context.colors.surface,
              onBackPressed: () => context.pop(),
            )
          : null,
      body: BlocBuilder<UnitCubit, UnitState>(
        builder: (context, state) {
          if (isCompact) {
            return _buildMobileList(context, state);
          }
          return _buildTabletTable(context, state);
        },
      ),
    );
  }

  Widget _buildMobileList(BuildContext context, UnitState state) {
    return Column(
      children: [
        UnitSearchBar(
          controller: _searchController,
          onSearch: _loadData,
          onClear: () {
            _searchController.clear();
            _loadData();
          },
        ),
        Expanded(child: _buildMobileContent(context, state)),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, UnitState state) {
    if (state is UnitLoading) {
      return const AppLoadingIndicator();
    }
    if (state is UnitFailure) {
      return AppErrorState(
        message: state.failure.message,
        onRetry: _loadData,
      );
    }
    if (state is UnitsLoaded) {
      if (state.units.isEmpty) {
        return const AppEmptyState(
          title: 'Belum ada unit',
          description: 'Tidak ada data unit yang ditemukan.',
        );
      }
      return RefreshIndicator(
        onRefresh: () async => _loadData(),
        child: ListView.separated(
          padding: EdgeInsets.all(context.space.md),
          itemCount: state.units.length,
          separatorBuilder: (context, index) =>
              SizedBox(height: context.space.sm),
          itemBuilder: (context, index) {
            final unit = state.units[index];
            return Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
              child: ListTile(
                title: Text(unit.name ?? ''),
                subtitle: Text(unit.description ?? ''),
                trailing: StatusChip(
                  label: unit.isActive ? 'Aktif' : 'Nonaktif',
                  color: unit.isActive
                      ? context.colors.success
                      : context.colors.error,
                ),
              ),
            );
          },
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, UnitState state) {
    final loadedState = state is UnitsLoaded ? state : null;
    final dataView = AppDataView<Unit>(
      breadcrumbs: const [
        BreadcrumbItem(label: 'Home'),
        BreadcrumbItem(label: 'Unit'),
      ],
      pageTitle: 'Daftar Unit',
      searchController: _searchController,
      searchHint: 'Cari unit...',
      onSearch: _loadData,
      onSearchClear: () {
        _searchController.clear();
        _loadData();
      },
      columns: _buildTabletColumnDefs(context),
      rows: loadedState?.units ?? [],
      isLoading: state is UnitLoading ||
          (state is UnitsLoaded && state.isPageLoading),
      errorMessage: state is UnitFailure ? state.failure.message : null,
      emptyMessage: 'Belum ada unit',
      totalCount: loadedState?.total,
      currentPage: loadedState?.currentPage,
      lastPage: loadedState?.lastPage,
      from: loadedState?.from,
      to: loadedState?.to,
      onPageChanged: loadedState != null
          ? (page) => context.read<UnitCubit>().changePage(
                page,
                search: _searchController.text.isEmpty
                    ? null
                    : _searchController.text,
              )
          : null,
      onRowTap: (unit) {
        setState(() {
          _selectedUnit = unit;
        });
      },
      isRowHighlighted: (unit) => unit.id == _selectedUnit?.id,
    );

    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(flex: 2, child: dataView),
        if (_selectedUnit != null) ...[
          VerticalDivider(width: 1, color: context.colors.outlineVariant),
          Expanded(
            flex: 1,
            child: _buildUnitDetailPanel(context, _selectedUnit!),
          ),
        ],
      ],
    );
  }

  Widget _buildUnitDetailPanel(BuildContext context, Unit unit) {
    return Column(
      children: [
        Container(
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
                  'Detail Unit',
                  style: context.typography.titleMedium,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => setState(() => _selectedUnit = null),
                tooltip: 'Tutup',
              ),
            ],
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: EdgeInsets.all(context.space.lg),
                  decoration: BoxDecoration(
                    color: context.colors.surface,
                    borderRadius: BorderRadius.circular(context.radius.lg),
                    border: Border.all(color: context.colors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Informasi Dasar',
                        style: context.typography.headlineMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          color: context.colors.primary,
                        ),
                      ),
                      SizedBox(height: context.space.md),
                      _buildInfoRow(context, 'Nama Unit', unit.name ?? '-'),
                      _buildInfoRow(context, 'Deskripsi', unit.description ?? '-'),
                      _buildInfoRow(
                        context,
                        'Status',
                        unit.isActive ? 'Aktif' : 'Nonaktif',
                        valueColor: unit.isActive
                            ? context.colors.success
                            : context.colors.error,
                        valueWeight: FontWeight.bold,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    String label,
    String value, {
    Color? valueColor,
    FontWeight? valueWeight,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.space.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
          ),
          SizedBox(width: context.space.sm),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: context.typography.bodyMedium.copyWith(
                fontWeight: valueWeight ?? FontWeight.w600,
                color: valueColor ?? context.colors.textPrimary,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }

  List<DataTableColumnDef<Unit>> _buildTabletColumnDefs(BuildContext context) {
    return [
      DataTableColumnDef<Unit>(
        id: 'name',
        header: 'Nama Unit',
        flex: 2,
        cellBuilder: (context, unit) => Text(unit.name ?? ''),
      ),
      DataTableColumnDef<Unit>(
        id: 'description',
        header: 'Deskripsi',
        flex: 3,
        cellBuilder: (context, unit) => Text(unit.description ?? '-'),
      ),
      DataTableColumnDef<Unit>(
        id: 'status',
        header: 'Status',
        width: 100,
        cellBuilder: (context, unit) => StatusChip(
          label: unit.isActive ? 'Aktif' : 'Nonaktif',
          color: unit.isActive ? context.colors.success : context.colors.error,
        ),
      ),
    ];
  }
}
