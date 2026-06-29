import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class PettyCashCard extends StatelessWidget {
  final PettyCash pettyCash;
  final VoidCallback onTap;

  const PettyCashCard({
    super.key,
    required this.pettyCash,
    required this.onTap,
  });

  String _displayAmount() {
    if (pettyCash.formattedAmount != null &&
        pettyCash.formattedAmount!.isNotEmpty) {
      return pettyCash.formattedAmount!;
    }

    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(pettyCash.amount);
  }

  String _displayTime() {
    if (pettyCash.createdAtHuman != null &&
        pettyCash.createdAtHuman!.isNotEmpty) {
      return pettyCash.createdAtHuman!;
    }
    if (pettyCash.requestDateFormatted != null &&
        pettyCash.requestDateFormatted!.isNotEmpty) {
      return pettyCash.requestDateFormatted!;
    }
    return '-';
  }

  String? _cashierName() {
    final cashier = pettyCash.cashier;
    if (cashier == null) return null;
    final name = cashier['name'];
    return name is String && name.isNotEmpty ? name : null;
  }

  String _statusLabel() {
    if (pettyCash.statusLabel != null && pettyCash.statusLabel!.isNotEmpty) {
      return pettyCash.statusLabel!;
    }

    switch (pettyCash.status.toLowerCase()) {
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Menunggu';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(
          color: context.colors.border.withValues(alpha: 0.1),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: context.colors.border.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(context.radius.md),
          child: Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _buildStatusBadge(context),
                    const Spacer(),
                    Text(
                      _displayTime(),
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: context.space.sm),

                Text(
                  pettyCash.code ?? '-',
                  style: context.typography.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                ),

                SizedBox(height: context.space.xs),

                Text(
                  _displayAmount(),
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.primary,
                  ),
                ),

                if (_cashierName() != null) ...[
                  SizedBox(height: context.space.sm),
                  Row(
                    children: [
                      Icon(
                        Icons.person_outline_rounded,
                        size: 16,
                        color: context.colors.textSecondary,
                      ),
                      SizedBox(width: context.space.xs),
                      Text(
                        _cashierName()!,
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],

                if (pettyCash.description != null &&
                    pettyCash.description!.isNotEmpty) ...[
                  SizedBox(height: context.space.xs),
                  Text(
                    pettyCash.description!,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    IconData icon;
    final status = pettyCash.status.toLowerCase();

    if (status == 'approved') {
      backgroundColor = context.colors.success.withValues(alpha: 0.1);
      textColor = context.colors.success;
      icon = Icons.check_circle_rounded;
    } else if (status == 'rejected') {
      backgroundColor = context.colors.error.withValues(alpha: 0.1);
      textColor = context.colors.error;
      icon = Icons.cancel_rounded;
    } else {
      backgroundColor = context.colors.warning.withValues(alpha: 0.1);
      textColor = context.colors.warning;
      icon = Icons.pending_rounded;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.sm,
        vertical: context.space.xs,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(context.radius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: textColor),
          SizedBox(width: context.space.xs),
          Text(
            _statusLabel(),
            style: context.typography.bodySmall.copyWith(
              color: textColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
