import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/bloc/auth_cubit.dart';
import '../../../auth/presentation/bloc/auth_state.dart';
import '../../../../core/permissions/cashier_permission_checker.dart';
import '../widgets/cashier_no_permission_action_button.dart';

class CashierNoPermissionScreen extends StatefulWidget {
  final String featureContext;
  final bool isAppLevel;

  const CashierNoPermissionScreen({
    super.key,
    required this.featureContext,
    this.isAppLevel = false,
  });

  @override
  State<CashierNoPermissionScreen> createState() =>
      _CashierNoPermissionScreenState();
}

class _CashierNoPermissionScreenState extends State<CashierNoPermissionScreen> {
  bool _checkingAccess = false;

  Future<void> _refreshAccess() async {
    if (_checkingAccess) return;

    setState(() {
      _checkingAccess = true;
    });

    await context.read<AuthCubit>().refreshMe();

    if (!mounted) return;

    setState(() {
      _checkingAccess = false;
    });

    final authState = context.read<AuthCubit>().state;
    if (authState is Authenticated &&
        CashierPermissionChecker.hasAnyCashierAccess(authState.employee)) {
      context.go('/home');
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Akses belum tersedia. Silakan hubungi owner outlet Anda.',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final message = widget.isAppLevel
        ? 'Anda tidak memiliki izin untuk mengakses aplikasi kasir. Silakan hubungi owner outlet Anda untuk meminta akses.'
        : 'Anda tidak memiliki izin untuk membuka ${widget.featureContext}. Silakan hubungi owner outlet Anda untuk meminta akses.';

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.lock_outline, size: 72, color: Colors.red),
                  const SizedBox(height: 16),
                  const Text(
                    'Akses Ditolak',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    message,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 15, height: 1.5),
                  ),
                  const SizedBox(height: 24),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    children: [
                      if (!widget.isAppLevel)
                        CashierNoPermissionActionButton(
                          label: 'Kembali',
                          icon: Icons.arrow_back,
                          onPressed: () => context.pop(),
                        ),
                      CashierNoPermissionActionButton(
                        label: _checkingAccess
                            ? 'Memeriksa...'
                            : 'Cek Ulang Akses',
                        icon: Icons.refresh,
                        isPrimary: true,
                        onPressed: _checkingAccess ? null : _refreshAccess,
                      ),
                      CashierNoPermissionActionButton(
                        label: 'Keluar',
                        icon: Icons.logout,
                        onPressed: () => context.read<AuthCubit>().logout(),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
