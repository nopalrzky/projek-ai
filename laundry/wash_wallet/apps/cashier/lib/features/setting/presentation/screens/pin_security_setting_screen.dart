import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_cubit.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_state.dart';

class PinSecuritySettingScreen extends StatelessWidget {
  const PinSecuritySettingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Keamanan PIN')),
      body: BlocBuilder<AuthCubit, AuthState>(
        builder: (context, state) {
          bool hasPin = false;
          if (state is Authenticated) {
            hasPin = state.employee.hasPin;
          } else if (state is AuthenticatedStale) {
            hasPin = state.employee.hasPin;
          }

          return ContentConstraint(
            child: ListView(
              padding: const EdgeInsets.all(24.0),
              children: [
                Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: context.colors.surfaceVariant,
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.security, color: context.colors.primary),
                          const SizedBox(width: 12),
                          Text(
                            'Informasi PIN Kasir',
                            style: context.typography.titleMedium.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'PIN Anda digunakan untuk login cepat antar kasir dan verifikasi ulang sesi setelah aplikasi tidak aktif selama 4 jam.',
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                if (hasPin)
                  Container(
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(context.radius.md),
                      border: Border.all(color: Colors.green),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.green),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'PIN Kasir sudah aktif',
                            style: context.typography.titleMedium.copyWith(
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          color: context.colors.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(context.radius.md),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.warning_amber, color: context.colors.error),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Anda belum mengatur PIN',
                                style: context.typography.titleMedium.copyWith(
                                  color: context.colors.error,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => context.push('/setup-pin'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: context.colors.primary,
                          foregroundColor: context.colors.onPrimary,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(context.radius.md),
                          ),
                        ),
                        child: const Text('Buat PIN Sekarang'),
                      ),
                    ],
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
