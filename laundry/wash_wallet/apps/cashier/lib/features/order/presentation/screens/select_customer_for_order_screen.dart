import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_cashier/features/customer/presentation/screens/create_customer_screen.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../../customer/presentation/bloc/customer_cubit.dart';
import '../../../customer/presentation/bloc/customer_state.dart';
import '../widgets/customer/customer_search_bar.dart';
import '../widgets/customer/customer_tile_card.dart';
import '../widgets/customer/customer_fab_add.dart';
import 'select_laundry_service_for_order_screen.dart';

class SelectCustomerForOrderScreen extends StatefulWidget {
  final int outletId;

  const SelectCustomerForOrderScreen({super.key, required this.outletId});

  @override
  State<SelectCustomerForOrderScreen> createState() =>
      _SelectCustomerForOrderScreenState();
}

class _SelectCustomerForOrderScreenState
    extends State<SelectCustomerForOrderScreen> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadCustomers() {
    context.read<CustomerCubit>().getAll(
      outletId: widget.outletId,
      search: _searchController.text.isEmpty ? null : _searchController.text,
      isActive: true,
    );
  }

  void _onSearchChanged(String value) {
    setState(() => _isSearching = true);
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        _loadCustomers();
        setState(() => _isSearching = false);
      }
    });
  }

  void _onCustomerSelected(Customer customer) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SelectLaundryServiceForOrderScreen(
          outletId: widget.outletId,
          customer: customer,
        ),
      ),
    );
  }

  void _onAddCustomer() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CreateCustomerScreen(outletId: widget.outletId),
      ),
    );

    if (result == true && mounted) {
      _loadCustomers();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Pilih Pelanggan',
        subtitle: 'Langkah 1 dari 3',
        onBackPressed: () => Navigator.pop(context),
      ),
      floatingActionButton: CustomerFabAdd(
        onPressed: _onAddCustomer,
        label: 'Tambah Pelanggan',
      ),
      body: ContentConstraint(
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(context.space.md),
              decoration: BoxDecoration(
                color: context.colors.background,
                border: Border(
                  bottom: BorderSide(
                    color: context.colors.border.withValues(alpha: 0.5),
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomerSearchBar(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    onSubmitted: (_) => _loadCustomers(),
                    onClear: _loadCustomers,
                    isLoading: _isSearching,
                  ),
                  SizedBox(height: context.space.sm),
                  _buildSearchInfo(context),
                ],
              ),
            ),
            Expanded(
              child: BlocBuilder<CustomerCubit, CustomerState>(
                builder: (context, state) {
                  if (state is CustomerLoading) {
                    return const AppLoadingIndicator();
                  }

                  if (state is CustomerFailure) {
                    return AppErrorState(
                      message: state.failure.message,
                      onRetry: _loadCustomers,
                    );
                  }

                  if (state is CustomersLoaded) {
                    if (state.customers.isEmpty) {
                      return AppEmptyState(
                        icon: Icons.person_search_rounded,
                        title: 'Pelanggan tidak ditemukan',
                        description: _searchController.text.isEmpty
                            ? 'Belum ada pelanggan terdaftar.\nTambahkan pelanggan baru untuk memulai.'
                            : 'Tidak ada hasil untuk "${_searchController.text}".\nCoba kata kunci lain atau tambah pelanggan baru.',
                        action: ElevatedButton.icon(
                          onPressed: _onAddCustomer,
                          icon: const Icon(Icons.add_rounded),
                          label: const Text('Tambah Pelanggan'),
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () async => _loadCustomers(),
                      child: ListView.builder(
                        padding: EdgeInsets.all(context.space.md),
                        itemCount: state.customers.length,
                        itemBuilder: (context, index) {
                          final customer = state.customers[index];
                          return CustomerTileCard(
                            customer: customer,
                            onTap: () => _onCustomerSelected(customer),
                            showDivider: false,
                          );
                        },
                      ),
                    );
                  }

                  return const SizedBox.shrink();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchInfo(BuildContext context) {
    return BlocBuilder<CustomerCubit, CustomerState>(
      builder: (context, state) {
        if (state is CustomersLoaded && state.customers.isNotEmpty) {
          final totalCustomers = state.customers.length;
          final memberCount = state.customers
              .where((c) => c.membershipContractsCount > 0)
              .length;

          return Row(
            children: [
              Icon(
                Icons.info_outline_rounded,
                size: 14,
                color: context.colors.textSecondary,
              ),
              SizedBox(width: context.space.xs),
              Text(
                '$totalCustomers pelanggan ditemukan',
                style: context.typography.bodySmall.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
              if (memberCount > 0) ...[
                SizedBox(width: context.space.sm),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: context.space.sm,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.amber.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '$memberCount Member',
                    style: context.typography.labelSmall.copyWith(
                      color: Colors.amber.shade700,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}
