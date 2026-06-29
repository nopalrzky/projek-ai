import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class CustomerTileCard extends StatelessWidget {
  final Customer customer;
  final VoidCallback onTap;
  final bool showDivider;

  const CustomerTileCard({
    super.key,
    required this.customer,
    required this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final hasActiveMember = customer.membershipContractsCount > 0;
    final hasActiveSubscription = customer.customerSubscriptionsCount > 0;

    return Container(
      margin: EdgeInsets.only(bottom: context.space.sm),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasActiveMember
              ? Colors.amber.withValues(alpha: 0.3)
              : context.colors.border.withValues(alpha: 0.5),
          width: hasActiveMember ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: hasActiveMember
                ? Colors.amber.withValues(alpha: 0.08)
                : context.colors.textTertiary.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Row(
              children: [
                _buildAvatar(context, hasActiveMember),
                SizedBox(width: context.space.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildName(context),
                      if (customer.phone != null) ...[
                        SizedBox(height: context.space.xs),
                        _buildPhone(context),
                      ],
                      if (hasActiveMember || hasActiveSubscription) ...[
                        SizedBox(height: context.space.sm),
                        _buildBadges(
                          context,
                          hasActiveMember,
                          hasActiveSubscription,
                        ),
                      ],
                    ],
                  ),
                ),
                SizedBox(width: context.space.sm),
                _buildTrailingIcon(context, hasActiveMember),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(BuildContext context, bool hasActiveMember) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: hasActiveMember
              ? [Colors.amber.shade300, Colors.amber.shade600]
              : [
                  context.colors.primary.withValues(alpha: 0.7),
                  context.colors.primary,
                ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: hasActiveMember
                ? Colors.amber.withValues(alpha: 0.3)
                : context.colors.primary.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Icon(Icons.person_rounded, color: Colors.white, size: 28),
          if (hasActiveMember)
            Positioned(
              top: 4,
              right: 4,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.stars_rounded,
                  size: 12,
                  color: Colors.amber.shade700,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildName(BuildContext context) {
    return Text(
      customer.name,
      style: context.typography.headlineMedium.copyWith(
        fontWeight: FontWeight.w600,
        color: context.colors.textPrimary,
      ),
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildPhone(BuildContext context) {
    return Row(
      children: [
        Icon(
          Icons.phone_rounded,
          size: 14,
          color: context.colors.textSecondary,
        ),
        SizedBox(width: context.space.xs),
        Text(
          customer.phone!,
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildBadges(
    BuildContext context,
    bool hasActiveMember,
    bool hasActiveSubscription,
  ) {
    return Wrap(
      spacing: context.space.sm,
      runSpacing: context.space.xs,
      children: [
        if (hasActiveMember) _buildMemberBadge(context),
        if (hasActiveSubscription) _buildSubscriptionBadge(context),
      ],
    );
  }

  Widget _buildMemberBadge(BuildContext context) {
    const planName = 'Member';

    return Container(
      padding: EdgeInsets.symmetric(horizontal: context.space.sm, vertical: 4),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.amber.shade100, Colors.amber.shade200],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.amber.shade300, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.workspace_premium_rounded,
            size: 14,
            color: Colors.amber.shade900,
          ),
          SizedBox(width: context.space.xs),
          Text(
            planName,
            style: context.typography.labelSmall.copyWith(
              color: Colors.amber.shade900,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionBadge(BuildContext context) {
    final subscriptionCount = customer.customerSubscriptionsCount;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: context.space.sm, vertical: 4),
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: context.colors.primary.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.local_offer_rounded,
            size: 14,
            color: context.colors.primary,
          ),
          SizedBox(width: context.space.xs),
          Text(
            '$subscriptionCount Paket Aktif',
            style: context.typography.labelSmall.copyWith(
              color: context.colors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrailingIcon(BuildContext context, bool hasActiveMember) {
    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: hasActiveMember
            ? Colors.amber.withValues(alpha: 0.1)
            : context.colors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(
        Icons.arrow_forward_ios_rounded,
        size: 16,
        color: hasActiveMember ? Colors.amber.shade700 : context.colors.primary,
      ),
    );
  }
}
