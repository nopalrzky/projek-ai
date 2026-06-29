import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/customer_address.dart';

class CustomerAddressCard extends StatelessWidget {
  final CustomerAddress address;
  final VoidCallback? onMorePressed;

  const CustomerAddressCard({
    super.key,
    required this.address,
    this.onMorePressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(
          color: address.isPrimary 
              ? context.colors.primary.withValues(alpha: 0.5) 
              : context.colors.border,
          width: address.isPrimary ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: context.colors.textPrimary.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {}, // For selection logic later
        borderRadius: BorderRadius.circular(context.radius.lg),
        child: Padding(
          padding: EdgeInsets.all(context.space.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(context.space.xs),
                    decoration: BoxDecoration(
                      color: address.isPrimary 
                          ? context.colors.primarySurface 
                          : context.colors.background,
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                    child: Icon(
                      address.label.toLowerCase().contains('rumah') 
                          ? Icons.home_outlined 
                          : address.label.toLowerCase().contains('kantor')
                              ? Icons.business_outlined
                              : Icons.location_on_outlined,
                      size: 18,
                      color: address.isPrimary 
                          ? context.colors.primary 
                          : context.colors.textSecondary,
                    ),
                  ),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Text(
                      address.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: context.typography.bodyLarge.copyWith(
                        color: context.colors.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  if (address.isPrimary) ...[
                    const AppBadge.success(label: 'Utama'),
                    SizedBox(width: context.space.xs),
                  ],
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: onMorePressed,
                      borderRadius: BorderRadius.circular(context.radius.full),
                      child: Padding(
                        padding: EdgeInsets.all(context.space.xs),
                        child: Icon(
                          Icons.more_horiz_rounded,
                          color: context.colors.textSecondary,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: context.space.md),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.person_outline_rounded,
                    size: 16,
                    color: context.colors.textSecondary,
                  ),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Text(
                      '${address.recipientName} · ${address.recipientPhone}',
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: context.space.xs),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.map_outlined,
                    size: 16,
                    color: context.colors.textSecondary,
                  ),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Text(
                      address.street,
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
              if (address.notes != null && address.notes!.isNotEmpty) ...[
                SizedBox(height: context.space.sm),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: context.space.sm,
                    vertical: context.space.xs,
                  ),
                  decoration: BoxDecoration(
                    color: context.colors.background,
                    borderRadius: BorderRadius.circular(context.radius.sm),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.sticky_note_2_outlined,
                        size: 14,
                        color: context.colors.textSecondary,
                      ),
                      SizedBox(width: context.space.xs),
                      Flexible(
                        child: Text(
                          address.notes!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: context.typography.labelSmall.copyWith(
                            color: context.colors.textSecondary,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
