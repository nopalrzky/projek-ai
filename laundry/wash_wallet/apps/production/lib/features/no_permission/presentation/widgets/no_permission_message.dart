import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class NoPermissionMessage extends StatelessWidget {
  final String permissionContext;

  const NoPermissionMessage({super.key, required this.permissionContext});

  @override
  Widget build(BuildContext context) {
    final content = _NoPermissionContent.fromContext(permissionContext);

    return Column(
      children: [
        Text(
          content.title,
          textAlign: TextAlign.center,
          style: context.typography.headlineMedium.copyWith(
            color: context.colors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: context.space.sm),
        Text(
          content.message,
          textAlign: TextAlign.center,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
      ],
    );
  }
}

class _NoPermissionContent {
  final String title;
  final String message;

  const _NoPermissionContent({required this.title, required this.message});

  factory _NoPermissionContent.fromContext(String context) {
    return switch (context) {
      'production' => const _NoPermissionContent(
        title: 'Tab Tidak Tersedia',
        message:
            'Anda tidak memiliki izin untuk membuka tab Produksi. Silakan hubungi owner outlet Anda untuk meminta akses.',
      ),
      'courier' => const _NoPermissionContent(
        title: 'Tab Tidak Tersedia',
        message:
            'Anda tidak memiliki izin untuk membuka tab Kurir. Silakan hubungi owner outlet Anda untuk meminta akses.',
      ),
      _ => const _NoPermissionContent(
        title: 'Akses Ditolak',
        message:
            'Anda tidak memiliki izin untuk mengakses aplikasi produksi. Silakan hubungi owner outlet Anda untuk meminta akses.',
      ),
    };
  }
}
