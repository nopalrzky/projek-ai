import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class CategoryInfoCard extends StatelessWidget {
  final Category category;

  const CategoryInfoCard({super.key, required this.category});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.xl),
        side: BorderSide(
          color: context.colors.border.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(context.radius.xl),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              context.colors.surface,
              context.colors.surface.withValues(alpha: 0.95),
            ],
          ),
        ),
        padding: EdgeInsets.all(context.space.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
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
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: CircleAvatar(
                    radius: 32,
                    backgroundColor: Colors.transparent,
                    child: Icon(
                      Icons.category_rounded,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                ),
                SizedBox(width: context.space.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        category.name,
                        style: context.typography.headlineLarge.copyWith(
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: context.space.xs),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: context.space.sm,
                          vertical: context.space.xs,
                        ),
                        decoration: BoxDecoration(
                          color: category.isActive
                              ? context.colors.success.withValues(alpha: 0.15)
                              : context.colors.disabled.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(
                            context.radius.sm,
                          ),
                          border: Border.all(
                            color: category.isActive
                                ? context.colors.success.withValues(alpha: 0.3)
                                : context.colors.disabled.withValues(
                                    alpha: 0.3,
                                  ),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              category.isActive
                                  ? Icons.check_circle_rounded
                                  : Icons.cancel_rounded,
                              size: 14,
                              color: category.isActive
                                  ? context.colors.success
                                  : context.colors.disabled,
                            ),
                            SizedBox(width: context.space.xs),
                            Text(
                              category.isActive ? 'Aktif' : 'Non-Aktif',
                              style: context.typography.labelSmall.copyWith(
                                color: category.isActive
                                    ? context.colors.success
                                    : context.colors.disabled,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (category.description != null &&
                category.description!.isNotEmpty) ...[
              SizedBox(height: context.space.lg),
              Container(
                padding: EdgeInsets.all(context.space.md),
                decoration: BoxDecoration(
                  color: context.colors.background.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(context.radius.md),
                  border: Border.all(
                    color: context.colors.border.withValues(alpha: 0.2),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.description_outlined,
                          size: 16,
                          color: context.colors.textSecondary,
                        ),
                        SizedBox(width: context.space.xs),
                        Text(
                          'Deskripsi',
                          style: context.typography.labelMedium.copyWith(
                            color: context.colors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: context.space.sm),
                    Text(
                      category.description!,
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.textPrimary,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            SizedBox(height: context.space.lg),
            Divider(color: context.colors.border.withValues(alpha: 0.3)),
            SizedBox(height: context.space.md),
            Row(
              children: [
                Expanded(
                  child: _buildInfoItem(
                    context,
                    icon: Icons.inventory_2_outlined,
                    label: 'Total Layanan',
                    value: '${category.laundryServicesCount}',
                    color: context.colors.info,
                  ),
                ),
                SizedBox(width: context.space.md),
                if (category.createdAt != null)
                  Expanded(
                    child: _buildInfoItem(
                      context,
                      icon: Icons.calendar_today_outlined,
                      label: 'Dibuat',
                      value: DateFormat(
                        'dd MMM yyyy',
                      ).format(category.createdAt!),
                      color: context.colors.success,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              SizedBox(width: context.space.xs),
              Text(
                label,
                style: context.typography.labelSmall.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.xs),
          Text(
            value,
            style: context.typography.bodyLarge.copyWith(
              fontWeight: FontWeight.w600,
              color: context.colors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
