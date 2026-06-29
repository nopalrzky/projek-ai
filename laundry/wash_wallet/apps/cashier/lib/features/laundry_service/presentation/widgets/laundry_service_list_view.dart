import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

enum LaundryServiceMenuOption { edit, delete }

class LaundryServiceListView extends StatelessWidget {
  final List<LaundryService> services;
  final Function(LaundryService) onEdit;
  final Function(int) onDelete;
  final VoidCallback onRefresh;
  final Function(LaundryService)? onTap;

  const LaundryServiceListView({
    super.key,
    required this.services,
    required this.onEdit,
    required this.onDelete,
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
          80,
        ),
        itemCount: services.length,
        itemBuilder: (context, index) {
          final service = services[index];
          return _buildServiceTile(context, service);
        },
      ),
    );
  }

  Widget _buildServiceTile(BuildContext context, LaundryService service) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return AppListTile(
      key: Key('service-${service.id}'),
      title: service.name,
      subtitle: _buildSubtitle(service, currencyFormat),
      leading: _buildLeading(context, service),
      trailing: _buildTrailing(context, service),
      onTap: onTap != null ? () => onTap!(service) : null,
      showDivider: true,
      margin: EdgeInsets.only(bottom: context.space.sm),
    );
  }

  String _buildSubtitle(LaundryService service, NumberFormat format) {
    final parts = <String>[];

    parts.add(format.format(service.price));

    if (service.category != null) {
      parts.add(service.category!.name);
    }

    if (service.unit != null) {
      parts.add(service.unit!.name ?? '');
    }

    parts.add('${service.durationHours} jam');

    return parts.join(' â€¢ ');
  }

  Widget _buildLeading(BuildContext context, LaundryService service) {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: service.isActive
            ? context.colors.primary.withValues(alpha: 0.1)
            : context.colors.textSecondary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.md),
      ),
      child: Icon(
        Icons.local_laundry_service_outlined,
        color: service.isActive
            ? context.colors.primary
            : context.colors.textSecondary,
        size: 24,
      ),
    );
  }

  Widget _buildTrailing(BuildContext context, LaundryService service) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (!service.isActive)
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
        SizedBox(width: context.space.sm),
        PopupMenuButton<LaundryServiceMenuOption>(
          icon: Icon(Icons.more_vert, color: context.colors.textSecondary),
          onSelected: (option) {
            switch (option) {
              case LaundryServiceMenuOption.edit:
                onEdit(service);
                break;
              case LaundryServiceMenuOption.delete:
                onDelete(service.id);
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: LaundryServiceMenuOption.edit,
              child: Row(
                children: [
                  Icon(Icons.edit_outlined, size: 20),
                  SizedBox(width: 12),
                  Text('Edit'),
                ],
              ),
            ),
            PopupMenuItem(
              value: LaundryServiceMenuOption.delete,
              child: Row(
                children: [
                  Icon(
                    Icons.delete_outline,
                    size: 20,
                    color: context.colors.error,
                  ),
                  const SizedBox(width: 12),
                  Text('Hapus', style: TextStyle(color: context.colors.error)),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
