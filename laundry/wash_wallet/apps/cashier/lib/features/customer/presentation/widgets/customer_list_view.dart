import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import 'customer_tile_card.dart';

class CustomerListView extends StatelessWidget {
  final List<Customer> customers;
  final Function(Customer) onEdit;
  final Function(int) onDelete;
  final Function(Customer)? onTap;
  final VoidCallback onRefresh;

  const CustomerListView({
    super.key,
    required this.customers,
    required this.onEdit,
    required this.onDelete,
    required this.onRefresh,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      color: context.colors.primary,
      child: ListView.separated(
        padding: EdgeInsets.all(context.space.md),
        itemCount: customers.length,
        separatorBuilder: (context, index) =>
            SizedBox(height: context.space.sm),
        itemBuilder: (context, index) {
          final customer = customers[index];
          return CustomerCard(
            customer: customer,
            onEdit: () => onEdit(customer),
            onDelete: () => onDelete(customer.id),
            onTap: onTap != null ? () => onTap!(customer) : null,
          );
        },
      ),
    );
  }
}
