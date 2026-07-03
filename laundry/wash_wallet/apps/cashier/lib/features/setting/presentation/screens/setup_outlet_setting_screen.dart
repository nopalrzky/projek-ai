import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class SetupOutletSettingScreen extends StatelessWidget {
  const SetupOutletSettingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Setup Outlet',
        type: AppHeaderType.standard,
        onBackPressed: () => context.pop(),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(context.space.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero section
            Container(
              padding: EdgeInsets.all(context.space.lg),
              decoration: BoxDecoration(
                color: context.colors.primary,
                borderRadius: BorderRadius.circular(context.radius.lg),
                boxShadow: [
                  BoxShadow(
                    color: context.colors.primary.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Setup Center',
                          style: context.typography.headlineSmall.copyWith(
                            color: context.colors.onPrimary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: context.space.xs),
                        Text(
                          'Kelola seluruh data master outlet Anda di satu tempat.',
                          style: context.typography.bodyMedium.copyWith(
                            color: context.colors.onPrimary.withValues(
                              alpha: 0.9,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.store_mall_directory_rounded,
                    size: 48,
                    color: context.colors.onPrimary.withValues(alpha: 0.5),
                  ),
                ],
              ),
            ),
            SizedBox(height: context.space.xl),
            Text(
              'Layanan & Menu',
              style: context.typography.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: context.space.md),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: context.space.md,
              crossAxisSpacing: context.space.md,
              childAspectRatio: 1.1,
              children: [
                _buildGridItem(
                  context,
                  icon: Icons.category_rounded,
                  title: 'Kategori',
                  subtitle: 'Pengelompokan menu',
                  onTap: () =>
                      context.push('/settings/setup-outlet/categories'),
                ),
                _buildGridItem(
                  context,
                  icon: Icons.local_laundry_service_rounded,
                  title: 'Layanan',
                  subtitle: 'Harga satuan',
                  onTap: () =>
                      context.push('/settings/setup-outlet/laundry-services'),
                ),
                _buildGridItem(
                  context,
                  icon: Icons.inventory_2_rounded,
                  title: 'Paket Layanan',
                  subtitle: 'Lihat paket dari owner',
                  isReadOnly: true,
                  onTap: () =>
                      context.push('/settings/setup-outlet/service-packages'),
                ),
              ],
            ),
            SizedBox(height: context.space.xl),
            Text(
              'Pelanggan & Loyalti',
              style: context.typography.titleMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: context.space.md),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: context.space.md,
              crossAxisSpacing: context.space.md,
              childAspectRatio: 1.1,
              children: [
                _buildGridItem(
                  context,
                  icon: Icons.people_alt_rounded,
                  title: 'Pelanggan',
                  subtitle: 'Database kontak',
                  onTap: () => context.push('/settings/setup-outlet/customers'),
                ),
                _buildGridItem(
                  context,
                  icon: Icons.card_membership_rounded,
                  title: 'Membership',
                  subtitle: 'Lihat plan dari owner',
                  isReadOnly: true,
                  onTap: () =>
                      context.push('/settings/setup-outlet/membership-plans'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGridItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isReadOnly = false,
  }) {
    return Material(
      color: context.colors.surface,
      borderRadius: BorderRadius.circular(context.radius.lg),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.all(context.space.md),
          decoration: BoxDecoration(
            border: Border.all(color: context.colors.outlineVariant),
            borderRadius: BorderRadius.circular(context.radius.lg),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: EdgeInsets.all(context.space.sm),
                    decoration: BoxDecoration(
                      color: context.colors.primaryContainer,
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                    child: Icon(icon, color: context.colors.primary),
                  ),
                  if (isReadOnly)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.secondaryContainer,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Read-only',
                        style: context.typography.labelSmall.copyWith(
                          color: Theme.of(
                            context,
                          ).colorScheme.onSecondaryContainer,
                          fontSize: 10,
                        ),
                      ),
                    ),
                ],
              ),
              const Spacer(),
              Text(
                title,
                style: context.typography.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: context.space.xs),
              Text(
                subtitle,
                style: context.typography.bodySmall.copyWith(
                  color: context.colors.onSurfaceVariant,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
