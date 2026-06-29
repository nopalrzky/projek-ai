import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../membership_contract/presentation/bloc/membership_contract_cubit.dart';
import '../../../../membership_contract/presentation/bloc/membership_contract_state.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'create_membership_contract.dart';
import 'widgets/membership_contract_list_item.dart';
import 'widgets/membership_contract_search_section.dart';
import 'widgets/membership_contract_filter_section.dart';

class IndexMembershipsScreen extends StatefulWidget {
  final Customer customer;

  const IndexMembershipsScreen({super.key, required this.customer});

  @override
  State<IndexMembershipsScreen> createState() => _IndexMembershipsScreenState();
}

class _IndexMembershipsScreenState extends State<IndexMembershipsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedStatus;

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
    context.read<MembershipContractCubit>().getAll(
      customerId: widget.customer.id,
      search: _searchController.text,
      status: _selectedStatus,
      refresh: true,
    );
  }

  Future<void> _navigateToCreateMembership() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            CreateMembershipContractScreen(customer: widget.customer),
      ),
    );

    if (result == true && mounted) {
      _loadData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Membership',
        subtitle: widget.customer.name,
        backgroundColor: context.colors.surface,
        onBackPressed: () => Navigator.pop(context, true),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _navigateToCreateMembership,
        backgroundColor: context.colors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Tambah Membership'),
      ),
      body: Column(
        children: [
          MembershipContractSearchSection(
            controller: _searchController,
            onSearch: _loadData,
            onClear: () {
              _searchController.clear();
              _loadData();
              setState(() {});
            },
          ),
          MembershipContractFilterSection(
            selectedStatus: _selectedStatus,
            onStatusChanged: (value) {
              setState(() => _selectedStatus = value);
              _loadData();
            },
          ),
          Expanded(child: _buildMembershipsList()),
        ],
      ),
    );
  }

  Widget _buildMembershipsList() {
    return BlocBuilder<MembershipContractCubit, MembershipContractState>(
      builder: (context, state) {
        if (state is MembershipContractLoading) {
          return const AppLoadingIndicator();
        }

        if (state is MembershipContractFailure) {
          return AppErrorState(
            message: state.failure.message,
            onRetry: _loadData,
          );
        }

        if (state is MembershipContractsLoaded) {
          if (state.contracts.isEmpty) {
            return AppEmptyState(
              title: 'Belum ada membership',
              description: 'Pelanggan ini belum memiliki membership',
              icon: Icons.card_membership_rounded,
            );
          }

          return RefreshIndicator(
            onRefresh: () async => _loadData(),
            child: ListView.separated(
              padding: EdgeInsets.all(context.space.md),
              itemCount: state.contracts.length,
              separatorBuilder: (_, _) => SizedBox(height: context.space.sm),
              itemBuilder: (context, index) {
                final contract = state.contracts[index];
                return MembershipContractListItem(
                  contract: contract,
                  onTap: () => _navigateToMembershipDetail(contract.id),
                );
              },
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  void _navigateToMembershipDetail(int contractId) {}
}
