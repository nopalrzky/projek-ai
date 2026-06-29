import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ProfileMenuSectionWidget extends StatelessWidget {
  const ProfileMenuSectionWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final activeItems = [
      _ProfileMenuItem(
        label: 'Edit Profil',
        icon: Icons.edit_outlined,
        route: '/profile/edit',
      ),
      _ProfileMenuItem(
        label: 'Alamat Saya',
        icon: Icons.location_on_outlined,
        route: '/customer-addresses',
      ),
      _ProfileMenuItem(
        label: 'Riwayat Pesanan',
        icon: Icons.receipt_long_outlined,
        route: '/orders',
      ),
      _ProfileMenuItem(
        label: 'Promo',
        icon: Icons.local_offer_outlined,
        route: '/promos',
      ),
      _ProfileMenuItem(
        label: 'Saldo Deposit',
        icon: Icons.account_balance_wallet_outlined,
        route: '/topup',
      ),
    ];

    final disabledItems = [
      _ProfileMenuItem(label: 'Keamanan Akun', icon: Icons.lock_outlined),
      _ProfileMenuItem(label: 'Notifikasi', icon: Icons.notifications_outlined),
      _ProfileMenuItem(label: 'Bantuan', icon: Icons.help_outline_rounded),
      _ProfileMenuItem(label: 'Tentang Aplikasi', icon: Icons.info_outline),
    ];

    final items = [...activeItems, ...disabledItems];

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Menu Akun',
            style: context.typography.titleMedium.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.space.sm),
          AppCard(
            child: Column(
              children: [
                for (var index = 0; index < items.length; index++)
                  _ProfileMenuTile(
                    item: items[index],
                    showDivider: index != items.length - 1,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileMenuItem {
  final String label;
  final IconData icon;
  final String? route;

  const _ProfileMenuItem({required this.label, required this.icon, this.route});
}

class _ProfileMenuTile extends StatelessWidget {
  final _ProfileMenuItem item;
  final bool showDivider;

  const _ProfileMenuTile({required this.item, required this.showDivider});

  @override
  Widget build(BuildContext context) {
    final isDisabled = item.route == null;

    return AppListTile.compact(
      title: isDisabled ? '${item.label} - Segera hadir' : item.label,
      leading: Icon(
        item.icon,
        color: isDisabled
            ? context.colors.textDisabled
            : context.colors.primary,
      ),
      trailing: Icon(
        Icons.chevron_right_rounded,
        color: isDisabled
            ? context.colors.textDisabled
            : context.colors.textTertiary,
      ),
      isDisabled: false,
      showDivider: showDivider,
      onTap: () {
        final route = item.route;
        if (route == null) {
          AppSnackbar.info(context, message: 'Segera hadir');
          return;
        }
        context.push(route);
      },
    );
  }
}
