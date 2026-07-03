import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:go_router/go_router.dart';
import '../../../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../../../features/auth/presentation/bloc/auth_state.dart';
import '../bloc/membership_plan_cubit.dart';
import '../bloc/membership_plan_state.dart';
import '../widgets/membership_plan_search_bar.dart';
import '../widgets/membership_plan_list_view.dart';

class IndexMembershipPlanScreen extends StatefulWidget {
  final int outletId;

  const IndexMembershipPlanScreen({super.key, required this.outletId});

  @override
  State<IndexMembershipPlanScreen> createState() =>
      _IndexMembershipPlanScreenState();
}

class _IndexMembershipPlanScreenState extends State<IndexMembershipPlanScreen> {
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
    context.read<MembershipPlanCubit>().getAll(
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
      header: isCompact
          ? AppHeader(
              title: 'Membership Plan',
              type: AppHeaderType.standard,
              backgroundColor: context.colors.surface,
              onBackPressed: () => context.pop(),
            )
          : null,
      body: BlocConsumer<MembershipPlanCubit, MembershipPlanState>(
        listener: (context, state) {
          if (state is MembershipPlanFailure) {
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

  Widget _buildMobileList(BuildContext context, MembershipPlanState state) {
    return Column(
      children: [
        MembershipPlanSearchBar(
          controller: _searchController,
          onSearch: _handleSearch,
          onClear: () {
            _searchController.clear();
            _loadData();
            setState(() {});
          },
        ),
        Expanded(child: _buildMobileContent(context, state)),
      ],
    );
  }

  Widget _buildMobileContent(BuildContext context, MembershipPlanState state) {
    if (state is MembershipPlanLoading) {
      return const AppLoadingIndicator();
    }
    if (state is MembershipPlanFailure) {
      return AppErrorState(message: state.failure.message, onRetry: _loadData);
    }
    if (state is MembershipPlansLoaded) {
      final filteredPlans = _filterPlans(state.plans);

      if (filteredPlans.isEmpty) {
        return AppEmptyState(
          title: 'Belum ada membership plan',
          description: _searchController.text.isNotEmpty
              ? 'Tidak ada membership plan yang sesuai dengan pencarian.'
              : 'Belum ada membership plan yang tersedia. Silakan hubungi owner untuk menambahkan membership plan.',
          icon: Icons.card_membership_outlined,
        );
      }
      return MembershipPlanListView(
        plans: filteredPlans,
        onRefresh: _loadData,
        onTap: _handleTap,
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildTabletTable(BuildContext context, MembershipPlanState state) {
    final loadedState = state is MembershipPlansLoaded ? state : null;
    return AppDataView<MembershipPlan>(
      breadcrumbs: const [
        BreadcrumbItem(label: 'Home'),
        BreadcrumbItem(label: 'Membership Plan'),
      ],
      pageTitle: 'Daftar Membership Plan',
      searchController: _searchController,
      searchHint: 'Cari membership plan...',
      onSearch: _handleSearch,
      onSearchClear: () {
        _searchController.clear();
        _loadData();
      },
      columns: _buildTabletColumnDefs(context),
      rows: loadedState?.plans ?? [],
      isLoading: state is MembershipPlanLoading ||
          (state is MembershipPlansLoaded && state.isPageLoading),
      errorMessage: state is MembershipPlanFailure
          ? state.failure.message
          : null,
      emptyMessage: 'Belum ada membership plan',
      totalCount: loadedState?.total,
      currentPage: loadedState?.currentPage,
      lastPage: loadedState?.lastPage,
      from: loadedState?.from,
      to: loadedState?.to,
      onPageChanged: loadedState != null
          ? (page) => context.read<MembershipPlanCubit>().changePage(
                page,
                outletId: widget.outletId,
                search: _searchController.text.isEmpty
                    ? null
                    : _searchController.text,
              )
          : null,
      rowActions: [
        DataTableRowAction<MembershipPlan>(
          icon: Icons.visibility_outlined,
          tooltip: 'Lihat',
          onTap: _handleTap,
        ),
      ],
      onRowTap: _handleTap,
    );
  }

  List<DataTableColumnDef<MembershipPlan>> _buildTabletColumnDefs(
    BuildContext context,
  ) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return [
      DataTableColumnDef<MembershipPlan>(
        id: 'name',
        header: 'Nama Plan',
        flex: 2,
        cellBuilder: (context, plan) => Text(plan.name),
      ),
      DataTableColumnDef<MembershipPlan>(
        id: 'level',
        header: 'Level',
        width: 100,
        cellBuilder: (context, plan) => Text(plan.level?.toString() ?? '-'),
      ),
      DataTableColumnDef<MembershipPlan>(
        id: 'price',
        header: 'Harga',
        width: 150,
        cellBuilder: (context, plan) => Text(currencyFormat.format(plan.price)),
      ),
      DataTableColumnDef<MembershipPlan>(
        id: 'discount',
        header: 'Diskon',
        width: 100,
        cellBuilder: (context, plan) => Text('${plan.discountPercentage}%'),
      ),
      DataTableColumnDef<MembershipPlan>(
        id: 'duration',
        header: 'Durasi',
        width: 100,
        cellBuilder: (context, plan) => Text('${plan.durationDays} hari'),
      ),
      DataTableColumnDef<MembershipPlan>(
        id: 'status',
        header: 'Status',
        width: 100,
        cellBuilder: (context, plan) => StatusChip(
          label: plan.isActive ? 'Aktif' : 'Nonaktif',
          color: plan.isActive ? context.colors.success : context.colors.error,
        ),
      ),
    ];
  }

  List<MembershipPlan> _filterPlans(List<MembershipPlan> plans) {
    if (_searchController.text.isEmpty) {
      return plans;
    }

    final searchLower = _searchController.text.toLowerCase();
    return plans.where((plan) {
      return plan.name.toLowerCase().contains(searchLower) ||
          (plan.description?.toLowerCase().contains(searchLower) ?? false);
    }).toList();
  }

  void _handleSearch() {
    setState(() {});
  }

  void _handleTap(MembershipPlan plan) {
    context
        .push('/membership-plans/${plan.id}')
        .then((_) => _loadData());
  }
}
