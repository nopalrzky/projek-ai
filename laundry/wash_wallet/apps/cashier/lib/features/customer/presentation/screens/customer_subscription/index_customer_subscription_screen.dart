import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../customer_subscription/presentation/bloc/customer_subscription_cubit.dart';
import '../../../../customer_subscription/presentation/bloc/customer_subscription_state.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'create_customer_subscription_screen.dart';
import 'widgets/customer_subscription_list_item.dart';
import 'widgets/customer_subscription_search_section.dart';
import 'widgets/customer_subscription_filter_section.dart';

class IndexCustomerSubscriptionScreen extends StatefulWidget {
  final Customer customer;

  const IndexCustomerSubscriptionScreen({super.key, required this.customer});

  @override
  State<IndexCustomerSubscriptionScreen> createState() =>
      _IndexCustomerSubscriptionScreenState();
}

class _IndexCustomerSubscriptionScreenState
    extends State<IndexCustomerSubscriptionScreen> {
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
    context
        .read<CustomerSubscriptionCubit>()
        .loadCustomerSubscriptionsByCustomerId(
          customerId: widget.customer.id,
          search: _searchController.text,
          status: _selectedStatus,
        );
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Deposit',
        subtitle: widget.customer.name,
        backgroundColor: context.colors.surface,
        onBackPressed: () => Navigator.pop(context),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _navigateToCreateSubscription,
        backgroundColor: context.colors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Tambah Deposit'),
      ),
      body: Column(
        children: [
          CustomerSubscriptionSearchSection(
            controller: _searchController,
            onSearch: _loadData,
            onClear: () {
              _searchController.clear();
              _loadData();
              setState(() {});
            },
          ),
          CustomerSubscriptionFilterSection(
            selectedStatus: _selectedStatus,
            onStatusChanged: (value) {
              setState(() => _selectedStatus = value);
              _loadData();
            },
          ),
          Expanded(child: _buildSubscriptionsList()),
        ],
      ),
    );
  }

  Future<void> _navigateToCreateSubscription() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            CreateCustomerSubscriptionScreen(customer: widget.customer),
      ),
    );

    if (result == true && mounted) {
      _loadData();
    }
  }

  Widget _buildSubscriptionsList() {
    return BlocBuilder<CustomerSubscriptionCubit, CustomerSubscriptionState>(
      builder: (context, state) {
        if (state is CustomerSubscriptionLoading) {
          return const AppLoadingIndicator();
        }

        if (state is CustomerSubscriptionFailure) {
          return AppErrorState(
            message: state.failure.message,
            onRetry: _loadData,
          );
        }

        if (state is CustomerSubscriptionsLoaded) {
          if (state.subscriptions.isEmpty) {
            return AppEmptyState(
              title: 'Belum ada deposit',
              description: 'Pelanggan ini belum memiliki deposit',
              icon: Icons.account_balance_wallet_rounded,
            );
          }

          return RefreshIndicator(
            onRefresh: () async => _loadData(),
            child: ListView.separated(
              padding: EdgeInsets.all(context.space.md),
              itemCount: state.subscriptions.length,
              separatorBuilder: (_, _) => SizedBox(height: context.space.sm),
              itemBuilder: (context, index) {
                final subscription = state.subscriptions[index];
                return CustomerSubscriptionListItem(
                  subscription: subscription,
                  onTap: () => _navigateToSubscriptionDetail(subscription.id),
                );
              },
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  void _navigateToSubscriptionDetail(int subscriptionId) {
    // TODO: Implement navigation to subscription detail
  }
}
