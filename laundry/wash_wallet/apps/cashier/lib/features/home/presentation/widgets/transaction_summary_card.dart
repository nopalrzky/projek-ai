import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:intl/intl.dart';

class TransactionSummaryCard extends StatelessWidget {
  final double cashBalance;
  final int ordersInProduction;
  final int ordersNotPickedUp;
  final int ordersPickedUp;
  final VoidCallback onSetorTap;
  final VoidCallback? onProductionTap;
  final VoidCallback? onNotPickedUpTap;
  final VoidCallback? onPickedUpTap;

  const TransactionSummaryCard({
    super.key,
    required this.cashBalance,
    required this.ordersInProduction,
    required this.ordersNotPickedUp,
    required this.ordersPickedUp,
    required this.onSetorTap,
    this.onProductionTap,
    this.onNotPickedUpTap,
    this.onPickedUpTap,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      margin: EdgeInsets.symmetric(horizontal: context.space.md),
      padding: EdgeInsets.all(context.space.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            context.colors.primary,
            context.colors.primary.withValues(alpha: 0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(context.radius.lg),
        boxShadow: [
          BoxShadow(
            color: context.colors.primary.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Kas di Outlet',
                style: context.typography.labelLarge.copyWith(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontWeight: FontWeight.w600,
                ),
              ),
              ElevatedButton.icon(
                onPressed: onSetorTap,
                icon: const Icon(Icons.upload, size: 18),
                label: const Text('Setor'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: context.colors.primary,
                  padding: EdgeInsets.symmetric(
                    horizontal: context.space.md,
                    vertical: context.space.sm,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(context.radius.full),
                  ),
                ),
              ),
            ],
          ),

          SizedBox(height: context.space.lg),

          // Cash Balance Amount
          Text(
            currencyFormat.format(cashBalance),
            style: context.typography.headlineLarge.copyWith(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),

          SizedBox(height: context.space.lg),

          // Divider
          Divider(color: Colors.white.withValues(alpha: 0.3), height: 1),

          SizedBox(height: context.space.md),

          // Order Stats
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: onProductionTap,
                  child: _buildOrderStat(
                    context,
                    icon: Icons.hourglass_empty,
                    label: 'Produksi',
                    count: ordersInProduction,
                  ),
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withValues(alpha: 0.3),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: onNotPickedUpTap,
                  child: _buildOrderStat(
                    context,
                    icon: Icons.pending_actions,
                    label: 'Belum Diambil',
                    count: ordersNotPickedUp,
                  ),
                ),
              ),
              Container(
                width: 1,
                height: 40,
                color: Colors.white.withValues(alpha: 0.3),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: onPickedUpTap,
                  child: _buildOrderStat(
                    context,
                    icon: Icons.check_circle_outline,
                    label: 'Sudah Diambil',
                    count: ordersPickedUp,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOrderStat(
    BuildContext context, {
    required IconData icon,
    required String label,
    required int count,
  }) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        SizedBox(height: context.space.xs),
        Text(
          count.toString(),
          style: context.typography.headlineLarge.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        SizedBox(height: context.space.xs),
        Text(
          label,
          style: context.typography.bodySmall.copyWith(
            color: Colors.white.withValues(alpha: 0.8),
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}

