import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ProfileStatusCardWidget extends StatelessWidget {
  final CustomerAccount customer;
  final VoidCallback onDismiss;

  const ProfileStatusCardWidget({
    super.key,
    required this.customer,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final messages = _buildMessages(customer);
    if (messages.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: AppCard.outlined(
        backgroundColor: context.colors.warningSurface,
        borderColor: context.colors.warning,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.info_outline_rounded, color: context.colors.warning),
            SizedBox(width: context.space.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Profil belum lengkap',
                    style: context.typography.labelMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: context.colors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.space.xs),
                  ...messages.map(
                    (message) => Padding(
                      padding: EdgeInsets.only(bottom: context.space.xs),
                      child: Text(
                        '- $message',
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            AppButton.icon(
              icon: Icon(
                Icons.close_rounded,
                color: context.colors.textSecondary,
              ),
              onPressed: onDismiss,
              tooltip: 'Tutup',
            ),
          ],
        ),
      ),
    );
  }

  List<String> _buildMessages(CustomerAccount customer) {
    final messages = <String>[];
    if (!customer.isActive) {
      messages.add('Akun tidak aktif, hubungi admin');
    }
    if (!customer.isVerified) {
      messages.add('Akun belum terverifikasi');
    }
    if (customer.email == null || customer.email!.trim().isEmpty) {
      messages.add('Tambahkan email untuk melengkapi profil');
    }
    if (customer.dateOfBirth == null || customer.dateOfBirth!.trim().isEmpty) {
      messages.add('Tanggal lahir belum diisi');
    }
    if (customer.gender == null || customer.gender!.trim().isEmpty) {
      messages.add('Gender belum diisi');
    }
    return messages;
  }
}
