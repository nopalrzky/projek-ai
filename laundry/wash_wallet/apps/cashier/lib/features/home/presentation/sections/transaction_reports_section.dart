import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_cashier/features/home/presentation/widgets/transaction_report_header.dart';
import 'package:wash_wallet_cashier/features/home/presentation/widgets/transaction_summary_card.dart';

/// Transaction reports section
///
/// Displays:
/// - Cash balance summary
/// - Orders statistics (in production, not picked up, picked up)
/// - Setor (deposit) button
class TransactionReportsSection extends StatelessWidget {
  final double cashBalance;
  final int ordersInProduction;
  final int ordersNotPickedUp;
  final int ordersPickedUp;
  final VoidCallback onSetorTap;
  final VoidCallback? onProductionTap;
  final VoidCallback? onNotPickedUpTap;
  final VoidCallback? onPickedUpTap;

  const TransactionReportsSection({
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const TransactionReportHeader(),
        SizedBox(height: context.space.lg),
        ResponsiveLayout(
          compactLayout: TransactionSummaryCard(
            cashBalance: cashBalance,
            ordersInProduction: ordersInProduction,
            ordersNotPickedUp: ordersNotPickedUp,
            ordersPickedUp: ordersPickedUp,
            onSetorTap: onSetorTap,
            onProductionTap: onProductionTap,
            onNotPickedUpTap: onNotPickedUpTap,
            onPickedUpTap: onPickedUpTap,
          ),
          mediumLayout: _buildGrid(context),
        ),
      ],
    );
  }

  Widget _buildGrid(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: context.space.md),
      child: ResponsiveGrid(
        childAspectRatio: 1.5,
        children: [
          AppCard.elevated(
            child: Padding(
              padding: EdgeInsets.all(context.space.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Kas di Outlet',
                        style: context.typography.labelLarge.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                      AppButton.outline(
                        label: 'Setor',
                        onPressed: onSetorTap,
                        size: AppButtonSize.sm,
                      ),
                    ],
                  ),
                  Text(
                    currencyFormat.format(cashBalance),
                    style: context.typography.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          _buildOrderStatCard(
            context,
            icon: Icons.hourglass_empty,
            label: 'Produksi',
            count: ordersInProduction,
            onTap: onProductionTap,
            color: context.colors.primary,
          ),
          _buildOrderStatCard(
            context,
            icon: Icons.pending_actions,
            label: 'Belum Diambil',
            count: ordersNotPickedUp,
            onTap: onNotPickedUpTap,
            color: context.colors.warning,
          ),
          _buildOrderStatCard(
            context,
            icon: Icons.check_circle_outline,
            label: 'Sudah Diambil',
            count: ordersPickedUp,
            onTap: onPickedUpTap,
            color: context.colors.success,
          ),
        ],
      ),
    );
  }

  Widget _buildOrderStatCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required int count,
    required Color color,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(context.radius.lg),
      child: AppCard.elevated(
        child: Padding(
          padding: EdgeInsets.all(context.space.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: EdgeInsets.all(context.space.sm),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    count.toString(),
                    style: context.typography.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.textPrimary,
                    ),
                  ),
                  Text(
                    label,
                    style: context.typography.bodyMedium.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
