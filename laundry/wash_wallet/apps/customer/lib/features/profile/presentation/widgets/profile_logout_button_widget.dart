import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_state.dart';

class ProfileLogoutButtonWidget extends StatelessWidget {
  const ProfileLogoutButtonWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        context.space.lg,
        context.space.lg,
        context.space.lg,
        context.space.sm,
      ),
      child: BlocBuilder<CustomerAuthCubit, CustomerAuthState>(
        builder: (context, state) {
          final isLoading = state is CustomerAuthLoading;

          return AppButton.danger(
            label: 'Keluar',
            icon: const Icon(Icons.logout_rounded),
            isFullWidth: true,
            isLoading: isLoading,
            onPressed: isLoading ? null : () => _showLogoutDialog(context),
          );
        },
      ),
    );
  }

  Future<void> _showLogoutDialog(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: context.colors.surface,
          title: Text(
            'Keluar dari Akun?',
            style: context.typography.titleMedium.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          content: Text(
            'Kamu akan keluar dari aplikasi.',
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
          actions: [
            AppButton.ghost(
              label: 'Batal',
              onPressed: () => Navigator.of(dialogContext).pop(false),
            ),
            AppButton.danger(
              label: 'Keluar',
              onPressed: () => Navigator.of(dialogContext).pop(true),
            ),
          ],
        );
      },
    );

    if (confirmed == true && context.mounted) {
      context.read<CustomerAuthCubit>().logout();
    }
  }
}
