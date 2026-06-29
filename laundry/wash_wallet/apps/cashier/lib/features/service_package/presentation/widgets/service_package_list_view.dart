import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class ServicePackageListView extends StatelessWidget {
  final List<ServicePackage> packages;
  final VoidCallback onRefresh;
  final Function(ServicePackage)? onTap;

  const ServicePackageListView({
    super.key,
    required this.packages,
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
        itemCount: packages.length,
        itemBuilder: (context, index) {
          final package = packages[index];
          return _buildPackageTile(context, package);
        },
      ),
    );
  }

  Widget _buildPackageTile(BuildContext context, ServicePackage package) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return AppListTile(
      key: Key('package-${package.id}'),
      title: package.name,
      subtitle: _buildSubtitle(package, currencyFormat),
      leading: _buildLeading(context, package),
      trailing: _buildTrailing(context, package),
      onTap: onTap != null ? () => onTap!(package) : null,
      showDivider: true,
      margin: EdgeInsets.only(bottom: context.space.sm),
    );
  }

  String _buildSubtitle(ServicePackage package, NumberFormat format) {
    final parts = <String>[];

    parts.add(format.format(package.price));

    final validityDesc = package.validityDays != null
        ? '${package.validityDays} hari'
        : 'Unlimited';
    parts.add('Berlaku: $validityDesc');

    return parts.join(' â€¢ ');
  }

  Widget _buildLeading(BuildContext context, ServicePackage package) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: package.isActive
            ? context.colors.primary.withValues(alpha: 0.1)
            : context.colors.textSecondary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.md),
      ),
      child: Icon(
        Icons.card_giftcard_outlined,
        color: package.isActive
            ? context.colors.primary
            : context.colors.textSecondary,
        size: 24,
      ),
    );
  }

  Widget _buildTrailing(BuildContext context, ServicePackage package) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (!package.isActive)
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
