import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class IndexFinancesScreen extends StatelessWidget {
  final int outletId;

  const IndexFinancesScreen({super.key, required this.outletId});

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Dana & Keuangan',
        backgroundColor: context.colors.surface,
        showMenuButton: false,
      ),
      body: SingleChildScrollView(
        child: ContentConstraint(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      context.colors.primary,
                      context.colors.primaryDark,
                    ],
                  ),
                ),
                padding: EdgeInsets.all(context.space.xl),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: EdgeInsets.all(context.space.md),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(
                              context.space.md,
                            ),
                          ),
                          child: Icon(
                            Icons.account_balance_wallet_rounded,
                            color: Colors.white,
                            size: 32,
                          ),
                        ),
                        SizedBox(width: context.space.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Kelola Keuangan',
                                style: context.typography.headlineSmall
                                    .copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              SizedBox(height: context.space.xs),
                              Text(
                                'Pantau dan kelola arus kas outlet',
                                style: context.typography.bodyMedium.copyWith(
                                  color: Colors.white.withValues(alpha: 0.9),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              Padding(
                padding: EdgeInsets.all(context.space.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Menu Keuangan',
                      style: context.typography.headlineMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: context.colors.textPrimary,
                      ),
                    ),
                    SizedBox(height: context.space.md),

                    ResponsiveLayout(
                      compactLayout: Column(
                        children: [
                          _buildMenuCard(
                            context: context,
                            icon: Icons.point_of_sale_rounded,
                            title: 'Setoran Kasir',
                            subtitle: 'Manajemen setoran harian',
                            gradientColors: [
                              context.colors.primary,
                              context.colors.primaryDark,
                            ],
                            onTap: () => _navigateToCashDeposit(context),
                          ),
                          SizedBox(height: context.space.md),
                          _buildMenuCard(
                            context: context,
                            icon: Icons.account_balance_wallet_rounded,
                            title: 'Saldo Petty Cash',
                            subtitle: 'Manajemen kas operasional',
                            gradientColors: [
                              context.colors.success,
                              context.colors.successDark,
                            ],
                            onTap: () => _navigateToPettyCash(context),
                          ),
                          SizedBox(height: context.space.md),
                          _buildMenuCard(
                            context: context,
                            icon: Icons.trending_down_rounded,
                            title: 'Pengeluaran Outlet',
                            subtitle: 'Catatan pengeluaran outlet',
                            gradientColors: [
                              context.colors.warning,
                              context.colors.warningDark,
                            ],
                            onTap: () => _navigateToCashExpense(context),
                          ),
                        ],
                      ),
                      mediumLayout: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: _buildMenuCard(
                              context: context,
                              icon: Icons.point_of_sale_rounded,
                              title: 'Setoran Kasir',
                              subtitle: 'Manajemen setoran harian',
                              gradientColors: [
                                context.colors.primary,
                                context.colors.primaryDark,
                              ],
                              onTap: () => _navigateToCashDeposit(context),
                            ),
                          ),
                          SizedBox(width: context.space.md),
                          Expanded(
                            child: _buildMenuCard(
                              context: context,
                              icon: Icons.account_balance_wallet_rounded,
                              title: 'Saldo Petty Cash',
                              subtitle: 'Manajemen kas operasional',
                              gradientColors: [
                                context.colors.success,
                                context.colors.successDark,
                              ],
                              onTap: () => _navigateToPettyCash(context),
                            ),
                          ),
                          SizedBox(width: context.space.md),
                          Expanded(
                            child: _buildMenuCard(
                              context: context,
                              icon: Icons.trending_down_rounded,
                              title: 'Pengeluaran Outlet',
                              subtitle: 'Catatan pengeluaran outlet',
                              gradientColors: [
                                context.colors.warning,
                                context.colors.warningDark,
                              ],
                              onTap: () => _navigateToCashExpense(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required List<Color> gradientColors,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.space.md),
        boxShadow: [
          BoxShadow(
            color: context.colors.border.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(context.space.md),
          child: Padding(
            padding: EdgeInsets.all(context.space.lg),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: gradientColors,
                    ),
                    borderRadius: BorderRadius.circular(context.space.md),
                    boxShadow: [
                      BoxShadow(
                        color: gradientColors[0].withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 28),
                ),
                SizedBox(width: context.space.md),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: context.typography.headlineSmall.copyWith(
                          fontWeight: FontWeight.bold,
                          color: context.colors.textPrimary,
                        ),
                      ),
                      SizedBox(height: context.space.xs),
                      Text(
                        subtitle,
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),

                Container(
                  padding: EdgeInsets.all(context.space.sm),
                  decoration: BoxDecoration(
                    color: context.colors.surfaceVariant,
                    borderRadius: BorderRadius.circular(context.space.sm),
                  ),
                  child: Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 16,
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _navigateToCashDeposit(BuildContext context) {
    context.go('/deposits');
  }

  void _navigateToPettyCash(BuildContext context) {
    context.go('/petty-cashes');
  }

  void _navigateToCashExpense(BuildContext context) {
    context.go('/expenses');
  }
}
