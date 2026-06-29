import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderCustomerCard extends StatelessWidget {
  final Customer customer;

  const OrderCustomerCard({super.key, required this.customer});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.outline.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Row(
            children: [
              Icon(Icons.person, color: context.colors.primary, size: 20),
              SizedBox(width: context.space.sm),
              Text(
                'Customer Information',
                style: context.typography.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),

          // Customer Name
          _buildInfoRow(context, 'Name', customer.name, Icons.person_outline),
          SizedBox(height: context.space.sm),

          // Customer Phone
          _buildInfoRow(
            context,
            'Phone',
            customer.phone ?? 'N/A',
            Icons.phone_outlined,
          ),
          SizedBox(height: context.space.sm),

          if (customer.email?.isNotEmpty == true) ...[
            _buildInfoRow(
              context,
              'Email',
              customer.email!,
              Icons.email_outlined,
            ),
            SizedBox(height: context.space.sm),
          ],

          if (customer.customerSubscriptionsCount > 0 ||
              customer.membershipContractsCount > 0) ...[
            SizedBox(height: context.space.xs),
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: context.space.sm,
                vertical: context.space.xs,
              ),
              decoration: BoxDecoration(
                color: Colors.purple.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(context.radius.sm),
                border: Border.all(color: Colors.purple),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.workspace_premium, size: 14, color: Colors.purple),
                  SizedBox(width: context.space.xs),
                  Text(
                    'Member',
                    style: context.typography.bodySmall.copyWith(
                      color: Colors.purple,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        SizedBox(width: context.space.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: context.typography.bodySmall.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              Text(
                value,
                style: context.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
