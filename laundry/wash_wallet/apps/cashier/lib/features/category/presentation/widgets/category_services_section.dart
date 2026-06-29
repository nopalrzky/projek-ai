import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'category_service_card.dart';

class CategoryServicesSection extends StatelessWidget {
  final List<LaundryService> services;

  const CategoryServicesSection({super.key, required this.services});

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
                  padding: EdgeInsets.all(context.space.sm),
                  decoration: BoxDecoration(
                    color: context.colors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                  child: Icon(
                    Icons.inventory_2_outlined,
                    color: context.colors.primary,
                    size: 24,
                  ),
                ),
                SizedBox(width: context.space.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Daftar Layanan',
                        style: context.typography.headlineMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${services.length} layanan tersedia',
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: context.space.lg),
            if (services.isEmpty)
              Center(
                child: Padding(
                  padding: EdgeInsets.all(context.space.xxl),
                  child: Column(
                    children: [
                      Icon(
                        Icons.inventory_2_outlined,
                        size: 64,
                        color: context.colors.textTertiary,
                      ),
                      SizedBox(height: context.space.md),
                      Text(
                        'Belum ada layanan',
                        style: context.typography.bodyLarge.copyWith(
                          color: context.colors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: context.space.xs),
                      Text(
                        'Kategori ini belum memiliki layanan',
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textTertiary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: services.length,
                separatorBuilder: (context, index) =>
                    SizedBox(height: context.space.sm),
                itemBuilder: (context, index) {
                  return CategoryServiceCard(service: services[index]);
                },
              ),
          ],
        ),
      ),
    );
  }
}
