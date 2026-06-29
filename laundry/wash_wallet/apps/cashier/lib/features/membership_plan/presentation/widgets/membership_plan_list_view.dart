import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class MembershipPlanListView extends StatelessWidget {
  final List<MembershipPlan> plans;
  final VoidCallback onRefresh;
  final Function(MembershipPlan)? onTap;

  const MembershipPlanListView({
    super.key,
    required this.plans,
    required this.onRefresh,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      child: ListView.builder(
        padding: EdgeInsets.fromLTRB(
          context.space.md,
          context.space.sm,
          context.space.md,
          context.space.lg,
        ),
        itemCount: plans.length,
        itemBuilder: (context, index) {
          final plan = plans[index];
          return _buildPlanTile(context, plan);
        },
      ),
    );
  }

  Widget _buildPlanTile(BuildContext context, MembershipPlan plan) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return AppListTile(
      key: Key('plan-${plan.id}'),
      title: plan.name,
      subtitle: _buildSubtitle(plan, currencyFormat),
      leading: _buildLeading(context, plan),
      trailing: _buildTrailing(context, plan),
      onTap: onTap != null ? () => onTap!(plan) : null,
      showDivider: true,
      margin: EdgeInsets.only(bottom: context.space.sm),
    );
  }

  String _buildSubtitle(MembershipPlan plan, NumberFormat format) {
    final parts = <String>[];

    parts.add(format.format(plan.price));
    parts.add('${plan.durationDays} hari');
    parts.add('Diskon ${plan.discountPercentage}%');

    return parts.join(' â€¢ ');
  }

  Widget _buildLeading(BuildContext context, MembershipPlan plan) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: plan.isActive
            ? context.colors.primary.withValues(alpha: 0.1)
            : context.colors.textSecondary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.md),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(
            Icons.card_membership_outlined,
            color: plan.isActive
                ? context.colors.primary
                : context.colors.textSecondary,
            size: 24,
          ),
          Positioned(
            bottom: 2,
            right: 2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
              decoration: BoxDecoration(
                color: plan.isActive
                    ? context.colors.primary
                    : context.colors.textSecondary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${plan.level}',
                style: context.typography.bodySmall.copyWith(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrailing(BuildContext context, MembershipPlan plan) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (!plan.isActive)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: context.colors.error.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(context.radius.sm),
            ),
            child: Text(
              'Nonaktif',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.error,
                fontWeight: FontWeight.w600,
                fontSize: 11,
              ),
            ),
          ),
        SizedBox(width: context.space.xs),
        Icon(
          Icons.chevron_right,
          color: context.colors.textSecondary,
          size: 20,
        ),
      ],
    );
  }
}
