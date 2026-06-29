import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ProfileSummaryCardWidget extends StatelessWidget {
  final CustomerAccount customer;
  final VoidCallback? onEditTap;

  const ProfileSummaryCardWidget({
    super.key,
    required this.customer,
    this.onEditTap,
  });

  @override
  Widget build(BuildContext context) {
    final email = customer.email?.trim();

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: AppCard.elevated(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _ProfileAvatar(customer: customer),
            SizedBox(width: context.space.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    customer.name,
                    style: context.typography.titleMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: context.colors.textPrimary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    customer.phone,
                    style: context.typography.bodyMedium.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.space.sm),
                  customer.isVerified
                      ? const AppBadge.success(
                          label: 'Terverifikasi',
                          icon: Icons.verified_outlined,
                          size: AppBadgeSize.sm,
                        )
                      : const AppBadge.warning(
                          label: 'Belum Terverifikasi',
                          icon: Icons.info_outline_rounded,
                          size: AppBadgeSize.sm,
                        ),
                  SizedBox(height: context.space.sm),
                  Text(
                    email == null || email.isEmpty
                        ? 'Email belum ditambahkan'
                        : email,
                    style: context.typography.bodySmall.copyWith(
                      color: email == null || email.isEmpty
                          ? context.colors.textTertiary
                          : context.colors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (onEditTap != null) ...[
              SizedBox(width: context.space.sm),
              AppButton.icon(
                icon: Icon(
                  Icons.edit_outlined,
                  color: context.colors.textSecondary,
                ),
                onPressed: onEditTap,
                tooltip: 'Edit Profil',
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProfileAvatar extends StatelessWidget {
  final CustomerAccount customer;

  const _ProfileAvatar({required this.customer});

  @override
  Widget build(BuildContext context) {
    final avatar = customer.avatar?.trim();
    final dimension = context.space.xxl + context.space.xl;

    if (avatar != null && avatar.isNotEmpty) {
      return ClipOval(
        child: Image.network(
          avatar,
          width: dimension,
          height: dimension,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return _InitialAvatar(
              initials: _initials(customer.name),
              dimension: dimension,
            );
          },
        ),
      );
    }

    return _InitialAvatar(
      initials: _initials(customer.name),
      dimension: dimension,
    );
  }

  String _initials(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .take(2)
        .toList();

    if (parts.isEmpty) return '?';

    return parts.map((part) => part[0].toUpperCase()).join();
  }
}

class _InitialAvatar extends StatelessWidget {
  final String initials;
  final double dimension;

  const _InitialAvatar({required this.initials, required this.dimension});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: dimension,
      height: dimension,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: context.colors.primary,
        shape: BoxShape.circle,
      ),
      child: Text(
        initials,
        style: context.typography.titleMedium.copyWith(
          color: context.colors.onPrimary,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
