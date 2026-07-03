import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_cubit.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_state.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class IndexSettingScreen extends StatelessWidget {
  const IndexSettingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;

    return AppLayout(
      userName: authState is Authenticated ? authState.employee.name : null,
      onLogout: () => context.read<AuthCubit>().logout(),
      header: const AppHeader(
        title: 'Pengaturan',
        type: AppHeaderType.standard,
        showMenuButton: false,
      ),
      body: ContentConstraint(
        child: ListView(
          padding: EdgeInsets.all(context.space.md),
          children: [
            _buildSettingItem(
              context,
              icon: Icons.print_outlined,
              title: 'Printer',
              subtitle: 'Kelola koneksi printer dan preferensi cetak',
              onTap: () => context.push('/settings/printer'),
            ),
            SizedBox(height: context.space.sm),
            _buildSettingItem(
              context,
              icon: Icons.person_outlined,
              title: 'Profil',
              subtitle: 'Atur profil akun dan preferensi lainnya',
              onTap: () => context.push('/profile'),
            ),
            SizedBox(height: context.space.sm),
            _buildSettingItem(
              context,
              icon: Icons.lock_outline,
              title: authState is Authenticated && authState.employee.hasPin
                  ? 'Atur Ulang PIN'
                  : 'Setting PIN',
              subtitle: authState is Authenticated && authState.employee.hasPin
                  ? 'Ganti PIN login cepat Anda'
                  : 'Buat PIN untuk login lebih cepat',
              onTap: () {
                if (authState is Authenticated && authState.employee.hasPin) {
                  context.push('/settings/pin-reset-verify');
                } else {
                  context.push('/settings/pin-setup');
                }
              },
            ),
            SizedBox(height: context.space.sm),
            _buildSettingItem(
              context,
              icon: Icons.store_outlined,
              title: 'Setup Outlet',
              subtitle:
                  'Kelola kategori, layanan, paket, membership, dan pelanggan',
              onTap: () => context.push('/settings/setup-outlet'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        side: BorderSide(color: context.colors.outlineVariant),
      ),
      child: ListTile(
        leading: Container(
          padding: EdgeInsets.all(context.space.xs),
          decoration: BoxDecoration(
            color: context.colors.primary.withAlpha(20),
            borderRadius: BorderRadius.circular(context.radius.sm),
          ),
          child: Icon(icon, color: context.colors.primary),
        ),
        title: Text(title, style: context.typography.titleMedium),
        subtitle: Text(subtitle, style: context.typography.bodySmall),
        trailing: Icon(
          Icons.chevron_right,
          color: context.colors.onSurfaceVariant,
        ),
        onTap: onTap,
      ),
    );
  }
}
