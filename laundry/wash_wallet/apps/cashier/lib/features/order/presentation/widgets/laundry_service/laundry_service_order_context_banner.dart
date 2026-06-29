import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class LaundryServiceOrderContextBanner extends StatelessWidget {
  final Customer customer;
  final OrderContext? orderContext;

  const LaundryServiceOrderContextBanner({
    super.key,
    required this.customer,
    this.orderContext,
  });

  @override
  Widget build(BuildContext context) {
    final hasMembership = orderContext?.membership != null;
    final hasQuotas = orderContext?.quotas.isNotEmpty ?? false;

    if (!hasMembership && !hasQuotas) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: EdgeInsets.all(context.space.md),
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.amber.shade50, Colors.amber.shade100],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.amber.shade300, width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasMembership) _buildMembershipInfo(context),
          if (hasMembership && hasQuotas) SizedBox(height: context.space.sm),
          if (hasQuotas) _buildQuotasInfo(context),
        ],
      ),
    );
  }

  Widget _buildMembershipInfo(BuildContext context) {
    final membership = orderContext!.membership!;
    final dateFormat = DateFormat('dd MMM yyyy', 'id_ID');

    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(context.space.sm),
          decoration: BoxDecoration(
            color: Colors.amber.shade200,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            Icons.workspace_premium_rounded,
            color: Colors.amber.shade900,
            size: 24,
          ),
        ),
        SizedBox(width: context.space.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                membership.membershipPlanName,
                style: context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: Colors.amber.shade900,
                ),
              ),
              SizedBox(height: context.space.xs),
              Text(
                'Diskon ${membership.discountPercentage}% • Berlaku hingga ${membership.expiredAt != null ? dateFormat.format(DateTime.parse(membership.expiredAt!)) : "-"}',
                style: context.typography.bodySmall.copyWith(
                  color: Colors.amber.shade800,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuotasInfo(BuildContext context) {
    final quotas = orderContext!.quotas;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.local_offer_rounded,
              color: Colors.amber.shade700,
              size: 16,
            ),
            SizedBox(width: context.space.xs),
            Text(
              'Paket Berlangganan Aktif',
              style: context.typography.labelMedium.copyWith(
                fontWeight: FontWeight.w600,
                color: Colors.amber.shade900,
              ),
            ),
          ],
        ),
        SizedBox(height: context.space.sm),
        ...quotas.map(
          (quota) => Padding(
            padding: EdgeInsets.only(bottom: context.space.xs),
            child: Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: Colors.amber.shade700,
                    shape: BoxShape.circle,
                  ),
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: Text(
                    '${quota.laundryServiceName}: ${quota.remainingQuota} ${quota.unit} tersisa',
                    style: context.typography.bodySmall.copyWith(
                      color: Colors.amber.shade800,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
