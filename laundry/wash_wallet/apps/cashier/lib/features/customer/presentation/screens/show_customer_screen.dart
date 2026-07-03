import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/customer_cubit.dart';
import '../bloc/customer_state.dart';

import '../widgets/customer_info_card.dart';
import '../widgets/customer_menu_item.dart';
import 'orders/index_orders_screen.dart';
import 'membership_contract/index_membership_contract_screen.dart';
import 'customer_subscription/index_customer_subscription_screen.dart';

class ShowCustomerScreen extends StatefulWidget {
  final int customerId;
  final bool isEmbedded;
  final VoidCallback? onClose;

  const ShowCustomerScreen({
    super.key,
    required this.customerId,
    this.isEmbedded = false,
    this.onClose,
  });

  @override
  State<ShowCustomerScreen> createState() => _ShowCustomerScreenState();
}

class _ShowCustomerScreenState extends State<ShowCustomerScreen> {
  Customer? _embeddedCustomer;
  bool _embeddedLoading = false;
  String? _embeddedError;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void didUpdateWidget(covariant ShowCustomerScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.customerId != widget.customerId) {
      _loadData();
    }
  }

  Future<void> _loadData() async {
    if (widget.isEmbedded) {
      setState(() {
        _embeddedLoading = true;
        _embeddedError = null;
      });
      final customer = await context
          .read<CustomerCubit>()
          .fetchCustomerSilently(widget.customerId);
      if (!mounted) return;
      setState(() {
        _embeddedCustomer = customer;
        _embeddedLoading = false;
        _embeddedError = customer == null ? 'Gagal memuat detail pelanggan' : null;
      });
      return;
    }

    context.read<CustomerCubit>().getById(widget.customerId);
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
              'Detail Pelanggan',
              style: context.typography.titleMedium,
            ),
          ),
          if (widget.onClose != null)
            IconButton(
              onPressed: widget.onClose,
              icon: const Icon(Icons.close_rounded),
              tooltip: 'Tutup detail',
            ),
        ],
      ),
    );
  }

  Widget _buildEmbeddedContent() {
    if (_embeddedLoading) {
      return const AppLoadingIndicator();
    }

    if (_embeddedError != null) {
      return AppErrorState(message: _embeddedError!, onRetry: _loadData);
    }

    final customer = _embeddedCustomer;
    if (customer == null) return const SizedBox.shrink();

    return _buildContent(customer);
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocBuilder<CustomerCubit, CustomerState>(
      builder: (context, state) {
        if (state is CustomerLoading) {
          return const AppLoadingIndicator();
        }

        if (state is CustomerFailure) {
          return AppErrorState(
            message: state.failure.message,
            onRetry: _loadData,
          );
        }

        if (state is CustomerDetailLoaded) {
          return _buildContent(state.customer);
        }

        return const SizedBox.shrink();
      },
    );

    if (widget.isEmbedded) {
      return Column(
        children: [
          _buildEmbeddedHeader(),
          Expanded(child: _buildEmbeddedContent()),
        ],
      );
    }

    return isCompact
        ? AppLayout(
            header: AppHeader(
              title: 'Detail Pelanggan',
              backgroundColor: context.colors.surface,
              onBackPressed: () => Navigator.pop(context),
            ),
            body: content,
          )
        : Column(
            children: [
              PageContentHeader(
                title: 'Detail Pelanggan',
                breadcrumbs: [
                  const BreadcrumbItem(label: 'Pelanggan'),
                  BreadcrumbItem(
                    label: 'Daftar Pelanggan',
                    onTap: () => Navigator.pop(context),
                  ),
                  const BreadcrumbItem(label: 'Detail Pelanggan'),
                ],
              ),
              Expanded(child: ContentConstraint(child: content)),
            ],
          );
  }

  Widget _buildContent(Customer customer) {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomerInfoCard(customer: customer),
            SizedBox(height: context.space.md),
            _buildMenuSection(customer),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuSection(Customer customer) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.lg),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          CustomerMenuItem(
            icon: Icons.receipt_long_rounded,
            title: 'Riwayat Order',
            subtitle: '${customer.ordersCount} transaksi',
            iconColor: context.colors.primary,
            onTap: () => _navigateToOrders(customer),
          ),
          Divider(height: 1, color: context.colors.border),
          CustomerMenuItem(
            icon: Icons.card_membership_rounded,
            title: 'Membership',
            subtitle: '${customer.membershipContractsCount} kontrak',
            iconColor: context.colors.warning,
            onTap: () => _navigateToMemberships(customer),
          ),
          Divider(height: 1, color: context.colors.border),
          CustomerMenuItem(
            icon: Icons.account_balance_wallet_rounded,
            title: 'Deposit',
            subtitle: '${customer.customerSubscriptionsCount} deposit',
            iconColor: context.colors.success,
            onTap: () => _navigateToDeposits(customer),
          ),
        ],
      ),
    );
  }

  void _navigateToOrders(Customer customer) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => IndexOrdersScreen(customer: customer)),
    );
  }

  Future<void> _navigateToMemberships(Customer customer) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => IndexMembershipsScreen(customer: customer),
      ),
    );

    if (result == true && mounted) {
      _loadData();
    }
  }

  void _navigateToDeposits(Customer customer) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => IndexCustomerSubscriptionScreen(customer: customer),
      ),
    );
  }
}
