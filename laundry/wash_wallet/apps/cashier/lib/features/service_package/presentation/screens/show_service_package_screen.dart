import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/service_package_cubit.dart';
import '../bloc/service_package_state.dart';

class ShowServicePackageScreen extends StatefulWidget {
  final int packageId;

  const ShowServicePackageScreen({super.key, required this.packageId});

  @override
  State<ShowServicePackageScreen> createState() =>
      _ShowServicePackageScreenState();
}

class _ShowServicePackageScreenState extends State<ShowServicePackageScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    context.read<ServicePackageCubit>().getById(
      servicePackageId: widget.packageId,
    );
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<ServicePackageCubit, ServicePackageState>(
      listener: (context, state) {
        if (state is ServicePackageFailure) {
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
        if (state is ServicePackageLoading) {
          return const AppLoadingIndicator();
        }

        if (state is ServicePackageFailure) {
          return AppErrorState(message: state.failure.message, onRetry: _loadData);
        }

        if (state is ServicePackageDetailLoaded) {
          final package = state.package;
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
                _buildHeaderCard(context, package),
                SizedBox(height: context.space.lg),

                _buildInfoSection(
                  context,
                  title: 'Informasi Paket',
                  children: [
                    _buildInfoRow(context, 'Nama Paket', package.name),
                    if (package.description != null &&
                        package.description!.isNotEmpty)
                      _buildInfoRow(context, 'Deskripsi', package.description!),
                  ],
                ),
                SizedBox(height: context.space.lg),

                _buildInfoSection(
                  context,
                  title: 'Harga & Validitas',
                  children: [
                    _buildInfoRow(
                      context,
                      'Harga',
                      currencyFormat.format(package.price),
                      icon: Icons.attach_money_outlined,
                      valueColor: context.colors.primary,
                      valueWeight: FontWeight.bold,
                    ),
                    _buildInfoRow(
                      context,
                      'Masa Berlaku',
                      package.validityDays != null
                          ? '${package.validityDays} hari'
                          : '-',
                      icon: Icons.event_available_outlined,
                    ),
                  ],
                ),
                SizedBox(height: context.space.lg),

                _buildInfoSection(
                  context,
                  title: 'Informasi Tambahan',
                  children: [
                    if (package.createdAt != null)
                      _buildInfoRow(
                        context,
                        'Dibuat',
                        _formatDateTime(package.createdAt!),
                        icon: Icons.calendar_today_outlined,
                      ),
                    if (package.updatedAt != null)
                      _buildInfoRow(
                        context,
                        'Terakhir Diubah',
                        _formatDateTime(package.updatedAt!),
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
          title: 'Detail Paket',
          backgroundColor: context.colors.surface,
          onBackPressed: () => Navigator.pop(context),
        ),
        body: content,
      );
    }

    return Column(
      children: [
        PageContentHeader(
          title: 'Detail Paket',
          breadcrumbs: [
            const BreadcrumbItem(label: 'Pengaturan'),
            BreadcrumbItem(label: 'Paket', onTap: () => Navigator.pop(context)),
            const BreadcrumbItem(label: 'Detail Paket'),
          ],
        ),
        Expanded(
          child: ContentConstraint(
            child: content,
          ),
        ),
      ],
    );
  }

  Widget _buildHeaderCard(BuildContext context, ServicePackage package) {
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
              Icons.card_giftcard_rounded,
              size: 48,
              color: Colors.white,
            ),
          ),
          SizedBox(height: context.space.md),
          Text(
            package.name,
            style: context.typography.headlineMedium.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.space.xs),
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: context.space.md,
              vertical: context.space.xs,
            ),
            decoration: BoxDecoration(
              color: package.isActive
                  ? Colors.green.withValues(alpha: 0.2)
                  : Colors.red.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(context.radius.full),
              border: Border.all(
                color: package.isActive ? Colors.green : Colors.red,
                width: 1.5,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  package.isActive ? Icons.check_circle : Icons.cancel,
                  size: 16,
                  color: package.isActive ? Colors.green : Colors.red,
                ),
                SizedBox(width: context.space.xs),
                Text(
                  package.isActive ? 'Aktif' : 'Nonaktif',
                  style: context.typography.bodySmall.copyWith(
                    color: package.isActive ? Colors.green : Colors.red,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
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

  String _formatDateTime(String dateTimeStr) {
    try {
      final dateTime = DateTime.parse(dateTimeStr);
      final format = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');
      return format.format(dateTime);
    } catch (e) {
      return dateTimeStr;
    }
  }
}
