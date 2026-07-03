import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/membership_plan_cubit.dart';
import '../bloc/membership_plan_state.dart';

class ShowMembershipPlanScreen extends StatefulWidget {
  final int planId;

  const ShowMembershipPlanScreen({super.key, required this.planId});

  @override
  State<ShowMembershipPlanScreen> createState() =>
      _ShowMembershipPlanScreenState();
}

class _ShowMembershipPlanScreenState extends State<ShowMembershipPlanScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    context.read<MembershipPlanCubit>().getById(widget.planId);
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<MembershipPlanCubit, MembershipPlanState>(
      listener: (context, state) {
        if (state is MembershipPlanFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.error_rounded, color: Colors.white),
                  SizedBox(width: context.space.sm),
                  Expanded(child: Text(state.failure.message)),
                ],
              ),
              backgroundColor: context.colors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
            ),
          );
        }
      },
      builder: (context, state) {
        if (state is MembershipPlanLoading) {
          return const AppLoadingIndicator();
        }

        if (state is MembershipPlanFailure) {
          return AppErrorState(
            message: state.failure.message,
            onRetry: _loadData,
          );
        }

        if (state is MembershipPlanLoaded) {
          final plan = state.plan;
          final currencyFormat = NumberFormat.currency(
            locale: 'id_ID',
            symbol: 'Rp ',
            decimalDigits: 0,
          );

          return SingleChildScrollView(
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeaderCard(context, plan),
                SizedBox(height: context.space.lg),

                _buildInfoSection(
                  context,
                  title: 'Informasi Membership',
                  children: [
                    _buildInfoRow(context, 'Nama Plan', plan.name),
                    if (plan.description != null &&
                        plan.description!.isNotEmpty)
                      _buildInfoRow(context, 'Deskripsi', plan.description!),
                    _buildInfoRow(
                      context,
                      'Level',
                      'Level ${plan.level}',
                      icon: Icons.bar_chart_outlined,
                    ),
                  ],
                ),
                SizedBox(height: context.space.lg),

                _buildInfoSection(
                  context,
                  title: 'Harga & Benefit',
                  children: [
                    _buildInfoRow(
                      context,
                      'Harga',
                      currencyFormat.format(plan.price),
                      icon: Icons.attach_money_outlined,
                      valueColor: context.colors.primary,
                      valueWeight: FontWeight.bold,
                    ),
                    _buildInfoRow(
                      context,
                      'Masa Berlaku',
                      '${plan.durationDays} hari',
                      icon: Icons.event_available_outlined,
                    ),
                    _buildInfoRow(
                      context,
                      'Diskon',
                      '${plan.discountPercentage}%',
                      icon: Icons.discount_outlined,
                      valueColor: context.colors.success,
                      valueWeight: FontWeight.bold,
                    ),
                  ],
                ),
                SizedBox(height: context.space.lg),

                _buildInfoSection(
                  context,
                  title: 'Informasi Tambahan',
                  children: [
                    if (plan.createdAt != null)
                      _buildInfoRow(
                        context,
                        'Dibuat',
                        _formatDateTime(plan.createdAt!),
                        icon: Icons.calendar_today_outlined,
                      ),
                    if (plan.updatedAt != null)
                      _buildInfoRow(
                        context,
                        'Terakhir Diubah',
                        _formatDateTime(plan.updatedAt!),
                        icon: Icons.update_outlined,
                      ),
                  ],
                ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Detail Membership',
          backgroundColor: context.colors.surface,
          onBackPressed: () => Navigator.pop(context),
        ),
        body: content,
      );
    }

    return Column(
      children: [
        PageContentHeader(
          title: 'Detail Membership',
          breadcrumbs: [
            const BreadcrumbItem(label: 'Pengaturan'),
            BreadcrumbItem(
              label: 'Membership',
              onTap: () => Navigator.pop(context),
            ),
            const BreadcrumbItem(label: 'Detail Membership'),
          ],
        ),
        Expanded(child: ContentConstraint(child: content)),
      ],
    );
  }

  Widget _buildHeaderCard(BuildContext context, MembershipPlan plan) {
    return Container(
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
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(context.space.md),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.card_membership_rounded,
              size: 48,
              color: Colors.white,
            ),
          ),
          SizedBox(height: context.space.md),
          Text(
            plan.name,
            style: context.typography.headlineMedium.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.space.xs),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.md,
                  vertical: context.space.xs,
                ),
                decoration: BoxDecoration(
                  color: plan.isActive
                      ? Colors.green.withValues(alpha: 0.2)
                      : Colors.red.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(context.radius.full),
                  border: Border.all(
                    color: plan.isActive ? Colors.green : Colors.red,
                    width: 1.5,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      plan.isActive ? Icons.check_circle : Icons.cancel,
                      size: 16,
                      color: plan.isActive ? Colors.green : Colors.red,
                    ),
                    SizedBox(width: context.space.xs),
                    Text(
                      plan.isActive ? 'Aktif' : 'Nonaktif',
                      style: context.typography.bodySmall.copyWith(
                        color: plan.isActive ? Colors.green : Colors.red,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(width: context.space.sm),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.md,
                  vertical: context.space.xs,
                ),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(context.radius.full),
                  border: Border.all(color: Colors.amber, width: 1.5),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.star, size: 16, color: Colors.amber),
                    SizedBox(width: context.space.xs),
                    Text(
                      'Level ${plan.level}',
                      style: context.typography.bodySmall.copyWith(
                        color: Colors.amber,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(
    BuildContext context, {
    required String title,
    required List<Widget> children,
  }) {
    return Container(
      padding: EdgeInsets.all(context.space.lg),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(color: context.colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: context.typography.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.primary,
            ),
          ),
          SizedBox(height: context.space.md),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    String label,
    String value, {
    IconData? icon,
    Color? valueColor,
    FontWeight? valueWeight,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.space.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 20, color: context.colors.textSecondary),
            SizedBox(width: context.space.sm),
          ],
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
          ),
          SizedBox(width: context.space.sm),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: context.typography.bodyMedium.copyWith(
                fontWeight: valueWeight ?? FontWeight.w600,
                color: valueColor ?? context.colors.textPrimary,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(String? dateTimeStr) {
    if (dateTimeStr == null) return '-';
    try {
      final dateTime = DateTime.parse(dateTimeStr);
      final format = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');
      return format.format(dateTime);
    } catch (e) {
      return dateTimeStr;
    }
  }
}
