import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_cubit.dart';

class AccessDeniedScreen extends StatelessWidget {
  const AccessDeniedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.block, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            const Text(
              'Akses Ditolak',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('Akun Anda tidak memiliki izin untuk mengakses aplikasi kasir.'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.read<AuthCubit>().logout(),
              child: const Text('Keluar'),
            ),
          ],
        ),
      ),
    );
  }
}
