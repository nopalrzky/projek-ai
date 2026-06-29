import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class LaundryServiceTileCard extends StatelessWidget {
  final LaundryService service;
  final double quantity;
  final bool isInCart;
  final VoidCallback onTap;

  const LaundryServiceTileCard({
    super.key,
    required this.service,
    required this.quantity,
    required this.isInCart,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      margin: EdgeInsets.only(bottom: context.space.sm),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isInCart
              ? context.colors.primary.withValues(alpha: 0.3)
              : context.colors.border.withValues(alpha: 0.5),
          width: isInCart ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isInCart
                ? context.colors.primary.withValues(alpha: 0.08)
                : context.colors.textTertiary.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Row(
              children: [
                _buildIcon(context),
                SizedBox(width: context.space.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        service.name,
                        style: context.typography.headlineMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: context.colors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: context.space.xs),
                      Row(
                        children: [
                          Text(
                            currencyFormat.format(service.price),
                            style: context.typography.bodyMedium.copyWith(
                              color: context.colors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            ' / ${service.unit?.symbol ?? 'unit'}',
                            style: context.typography.bodySmall.copyWith(
                              color: context.colors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                SizedBox(width: context.space.sm),
                _buildTrailing(context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildIcon(BuildContext context) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isInCart
              ? [
                  context.colors.primary.withValues(alpha: 0.7),
                  context.colors.primary,
                ]
              : [context.colors.background, context.colors.background],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isInCart ? Colors.transparent : context.colors.border,
        ),
      ),
      child: Icon(
        Icons.local_laundry_service_rounded,
        color: isInCart ? Colors.white : context.colors.textSecondary,
        size: 28,
      ),
    );
  }

  Widget _buildTrailing(BuildContext context) {
    if (isInCart) {
      final displayQuantity = quantity % 1 == 0
          ? quantity.toInt().toString()
          : quantity.toStringAsFixed(1);

      return Container(
        padding: EdgeInsets.symmetric(
          horizontal: context.space.md,
          vertical: context.space.sm,
        ),
        decoration: BoxDecoration(
          color: context.colors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: context.colors.primary, width: 1.5),
        ),
        child: Text(
          '${displayQuantity}x',
          style: context.typography.labelLarge.copyWith(
            color: context.colors.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }

    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(Icons.add_rounded, color: context.colors.primary, size: 20),
    );
  }
}
