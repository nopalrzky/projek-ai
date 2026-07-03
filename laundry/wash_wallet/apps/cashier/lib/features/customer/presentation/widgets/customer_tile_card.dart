import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

enum CustomerMenuOption { edit, delete }

class CustomerCard extends StatelessWidget {
  final Customer customer;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback? onTap;

  const CustomerCard({
    super.key,
    required this.customer,
    required this.onEdit,
    required this.onDelete,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.lg),
        side: BorderSide(
          color: context.colors.border.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(context.radius.lg),
        child: Container(
          padding: EdgeInsets.all(context.space.md),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(context.radius.lg),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                context.colors.surface,
                context.colors.surface.withValues(alpha: 0.95),
              ],
            ),
          ),
          child: Row(
            children: [
              _buildAvatar(context),
              SizedBox(width: context.space.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            customer.name,
                            style: context.typography.headlineMedium.copyWith(
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.3,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (!customer.isActive)
                          Container(
                            margin: EdgeInsets.only(left: context.space.xs),
                            padding: EdgeInsets.symmetric(
                              horizontal: context.space.xs,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: context.colors.disabled.withValues(
                                alpha: 0.15,
                              ),
                              borderRadius: BorderRadius.circular(
                                context.radius.sm,
                              ),
                              border: Border.all(
                                color: context.colors.disabled.withValues(
                                  alpha: 0.3,
                                ),
                              ),
                            ),
                            child: Text(
                              'Non-Aktif',
                              style: context.typography.labelSmall.copyWith(
                                color: context.colors.textSecondary,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                      ],
                    ),
                    SizedBox(height: context.space.sm),
                    if (customer.phone != null) ...[
                      _buildInfoRow(
                        context,
                        Icons.phone_rounded,
                        customer.phone!,
                      ),
                    ],
                    if (customer.address != null) ...[
                      SizedBox(height: context.space.xs),
                      _buildInfoRow(
                        context,
                        Icons.location_on_rounded,
                        customer.address!,
                        maxLines: 2,
                      ),
                    ],
                  ],
                ),
              ),
              SizedBox(width: context.space.sm),
              _buildMenuButton(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            context.colors.primary,
            context.colors.primary.withValues(alpha: 0.7),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: context.colors.primary.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: CircleAvatar(
        radius: 28,
        backgroundColor: Colors.transparent,
        child: Text(
          customer.name.isNotEmpty ? customer.name[0].toUpperCase() : '?',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    IconData icon,
    String text, {
    int maxLines = 1,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: context.colors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Icon(icon, size: 14, color: context.colors.primary),
        ),
        SizedBox(width: context.space.xs),
        Expanded(
          child: Text(
            text,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
              height: 1.4,
            ),
            maxLines: maxLines,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildMenuButton(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.background,
        borderRadius: BorderRadius.circular(context.radius.sm),
        border: Border.all(color: context.colors.border.withValues(alpha: 0.3)),
      ),
      child: PopupMenuButton<CustomerMenuOption>(
        icon: Icon(
          Icons.more_vert_rounded,
          color: context.colors.textSecondary,
          size: 20,
        ),
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
        onSelected: (CustomerMenuOption item) {
          switch (item) {
            case CustomerMenuOption.edit:
              onEdit();
              break;
            case CustomerMenuOption.delete:
              onDelete();
              break;
          }
        },
        itemBuilder: (BuildContext context) =>
            <PopupMenuEntry<CustomerMenuOption>>[
              PopupMenuItem<CustomerMenuOption>(
                value: CustomerMenuOption.edit,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: context.colors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.edit_rounded,
                        size: 18,
                        color: context.colors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text('Edit'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem<CustomerMenuOption>(
                value: CustomerMenuOption.delete,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: context.colors.error.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        Icons.delete_rounded,
                        size: 18,
                        color: context.colors.error,
                      ),
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
    );
  }
}
