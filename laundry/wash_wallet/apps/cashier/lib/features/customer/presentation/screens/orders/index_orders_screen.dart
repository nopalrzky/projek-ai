import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../../order/presentation/bloc/order_cubit.dart';
import '../../../../order/presentation/bloc/order_state.dart';
import 'widgets/order_list_item.dart';
import 'widgets/order_search_section.dart';
import 'widgets/order_filter_section.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class IndexOrdersScreen extends StatefulWidget {
  final Customer customer;

  const IndexOrdersScreen({super.key, required this.customer});

  @override
  State<IndexOrdersScreen> createState() => _IndexOrdersScreenState();
}

class _IndexOrdersScreenState extends State<IndexOrdersScreen> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedStatus;
  String? _selectedPaymentStatus;

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
    context.read<OrderCubit>().getAll(
      customerId: widget.customer.id,
      search: _searchController.text,
      status: _selectedStatus,
      paymentStatus: _selectedPaymentStatus,
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Riwayat Order',
        subtitle: widget.customer.name,
        backgroundColor: context.colors.surface,
        onBackPressed: () => Navigator.pop(context),
      ),
      body: Column(
        children: [
          OrderSearchSection(
            controller: _searchController,
            onSearch: _loadData,
            onClear: () {
              _searchController.clear();
              _loadData();
              setState(() {});
            },
          ),
          OrderFilterSection(
            selectedStatus: _selectedStatus,
            selectedPaymentStatus: _selectedPaymentStatus,
            onStatusChanged: (value) {
              setState(() => _selectedStatus = value);
              _loadData();
            },
            onPaymentStatusChanged: (value) {
              setState(() => _selectedPaymentStatus = value);
              _loadData();
            },
          ),
          Expanded(child: _buildOrdersList()),
        ],
      ),
    );
  }

  Widget _buildOrdersList() {
    return BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
        if (state is OrderLoading) {
          return const AppLoadingIndicator();
        }

        if (state is OrderFailure) {
          return AppErrorState(
            message: state.failure.message,
            onRetry: _loadData,
          );
        }

        if (state is OrdersLoaded) {
          if (state.orders.isEmpty) {
            return AppEmptyState(
              title: 'Belum ada order',
              description: 'Pelanggan ini belum pernah melakukan transaksi',
              icon: Icons.receipt_long_rounded,
            );
          }

          return RefreshIndicator(
            onRefresh: () async => _loadData(),
            child: ListView.separated(
              padding: EdgeInsets.all(context.space.md),
              itemCount: state.orders.length,
              separatorBuilder: (_, _) => SizedBox(height: context.space.sm),
              itemBuilder: (context, index) {
                final order = state.orders[index];
                return OrderListItem(
                  order: order,
                  onTap: () => _navigateToOrderDetail(order.id),
                );
              },
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  void _navigateToOrderDetail(int orderId) {}
}
