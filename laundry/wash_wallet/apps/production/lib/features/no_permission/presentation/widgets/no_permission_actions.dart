import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/utils/permission_checker.dart';
import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

class NoPermissionActions extends StatelessWidget {
  final String permissionContext;

  const NoPermissionActions({super.key, required this.permissionContext});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is Authenticated && !_hasAccess(state)) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Akses belum tersedia. Hubungi owner outlet Anda.'),
            ),
          );
        }
      },
      builder: (context, state) {
        final isLoading = state is AuthLoading;

        return Column(
          children: [
            AppButton.primary(
              label: 'Cek Ulang Akses',
              isFullWidth: true,
              isLoading: isLoading,
              onPressed: isLoading
                  ? null
                  : () => context.read<AuthCubit>().refreshMe(),
            ),
            SizedBox(height: context.space.md),
            AppButton.secondary(
              label: 'Keluar',
              isFullWidth: true,
              onPressed: isLoading
                  ? null
                  : () => context.read<AuthCubit>().logout(),
            ),
          ],
        );
      },
    );
  }

  bool _hasAccess(Authenticated state) {
    final employee = state.employee;

    return switch (permissionContext) {
      'production' => PermissionChecker.hasProductionAccess(employee),
      'courier' => PermissionChecker.hasCourierAccess(employee),
      _ => PermissionChecker.hasAnyAppAccess(employee),
    };
  }
}
