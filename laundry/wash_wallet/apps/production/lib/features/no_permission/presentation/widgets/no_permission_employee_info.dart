import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';

class NoPermissionEmployeeInfo extends StatelessWidget {
  const NoPermissionEmployeeInfo({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthCubit, AuthState>(
      builder: (context, state) {
        if (state is! Authenticated) {
          return const SizedBox.shrink();
        }

        final employee = state.employee;
        final outletName = _outletName(employee);

        return AppCard(
          padding: context.space.insetsAll.lg,
          child: Column(
            children: [
              _InfoRow(label: 'Employee', value: employee.name),
              SizedBox(height: context.space.sm),
              _InfoRow(label: 'Outlet', value: outletName),
            ],
          ),
        );
      },
    );
  }

  String _outletName(AuthEmployee employee) {
    for (final outlet in employee.accessibleOutlets) {
      if (outlet.outletId == employee.outletId) {
        return outlet.outletName;
      }
    }

    if (employee.accessibleOutlets.isNotEmpty) {
      return employee.accessibleOutlets.first.outletName;
    }

    return 'Outlet utama';
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: context.typography.bodySmall.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ),
        SizedBox(width: context.space.md),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
