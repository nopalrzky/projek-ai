import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

enum LaundryServiceMenuOption { edit, delete }

class LaundryServiceCard extends StatelessWidget {
  final LaundryService service;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback? onTap;

  const LaundryServiceCard({
    super.key,
    required this.service,
    required this.onEdit,
    required this.onDelete,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Card(
      margin: EdgeInsets.only(bottom: context.space.md),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        side: BorderSide(color: context.colors.border.withValues(alpha: 0.5)),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(context.radius.md),
        child: Padding(
          padding: EdgeInsets.all(context.space.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon Container
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: context.colors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
                child: Icon(
                  Icons.local_laundry_service_outlined,
                  color: context.colors.primary,
                  size: 24,
                ),
              ),
              SizedBox(width: context.space.md),

              // Info Section
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            service.name,
                            style: context.typography.headlineMedium.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (!service.isActive)
                          Container(
                            margin: EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: context.colors.disabled.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Non-Aktif',
                              style: context.typography.labelSmall.copyWith(
                                color: context.colors.textSecondary,
                                fontSize: 10,
                              ),
                            ),
                          ),
                      ],
                    ),
                    SizedBox(height: 4),

                    // Category Badge & Duration
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: [
                        if (service.category != null)
                          _buildChip(
                            context,
                            service.category!.name,
                            Icons.category_outlined,
                          ),
                        _buildChip(
                          context,
                          '${service.durationHours} Jam',
                          Icons.timer_outlined,
                        ),
                      ],
                    ),
                    SizedBox(height: 8),

                    // Price & Unit
                    Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: currencyFormat.format(service.price),
                            style: context.typography.headlineMedium.copyWith(
                              color: context.colors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (service.unit != null)
                            TextSpan(
                              text: ' / ${service.unit!.symbol}',
                              style: context.typography.bodyMedium.copyWith(
                                color: context.colors.textSecondary,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Menu Option
              PopupMenuButton<LaundryServiceMenuOption>(
                icon: Icon(
                  Icons.more_vert,
                  color: context.colors.textSecondary,
                ),
                onSelected: (LaundryServiceMenuOption item) {
                  switch (item) {
                    case LaundryServiceMenuOption.edit:
                      onEdit();
                      break;
                    case LaundryServiceMenuOption.delete:
                      onDelete();
                      break;
                  }
                },
                itemBuilder: (BuildContext context) =>
                    <PopupMenuEntry<LaundryServiceMenuOption>>[
                      const PopupMenuItem<LaundryServiceMenuOption>(
                        value: LaundryServiceMenuOption.edit,
                        child: Row(
                          children: [
                            Icon(Icons.edit_outlined, size: 20),
                            SizedBox(width: 12),
                            Text('Edit'),
                          ],
                        ),
                      ),
                      PopupMenuItem<LaundryServiceMenuOption>(
                        value: LaundryServiceMenuOption.delete,
                        child: Row(
                          children: [
                            Icon(
                              Icons.delete_outline,
                              size: 20,
                              color: context.colors.error,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Hapus',
                              style: TextStyle(color: context.colors.error),
                            ),
                          ],
                        ),
                      ),
                    ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChip(BuildContext context, String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: context.colors.background,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: context.colors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: context.colors.textSecondary),
          const SizedBox(width: 4),
          Text(
            label,
            style: context.typography.bodySmall.copyWith(
              color: context.colors.textSecondary,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}
