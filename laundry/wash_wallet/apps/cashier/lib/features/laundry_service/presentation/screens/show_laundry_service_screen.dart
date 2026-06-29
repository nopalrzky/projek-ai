import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../bloc/laundry_service_cubit.dart';
import '../bloc/laundry_service_state.dart';
import 'edit_laundry_service_screen.dart';

class ShowLaundryServiceScreen extends StatefulWidget {
  final int serviceId;

  const ShowLaundryServiceScreen({super.key, required this.serviceId});

  @override
  State<ShowLaundryServiceScreen> createState() =>
      _ShowLaundryServiceScreenState();
}

class _ShowLaundryServiceScreenState extends State<ShowLaundryServiceScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    context.read<LaundryServiceCubit>().getById(widget.serviceId);
  }

  @override
  Widget build(BuildContext context) {
    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<LaundryServiceCubit, LaundryServiceState>(
      listener: (context, state) {
        if (state is LaundryServiceActionSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.white),
                  SizedBox(width: context.space.sm),
                  Text(state.message),
                ],
              ),
              backgroundColor: context.colors.success,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
            ),
          );
          _loadData();
        }
        if (state is LaundryServiceFailure) {
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
        if (state is LaundryServiceLoading) {
          return const AppLoadingIndicator();
        }

        if (state is LaundryServiceFailure) {
          return AppErrorState(message: state.failure.message, onRetry: _loadData);
        }

        if (state is LaundryServiceDetailLoaded) {
          final service = state.service;
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
                _buildHeaderCard(context, service),
                SizedBox(height: context.space.lg),

                _buildInfoSection(
                  context,
                  title: 'Informasi Dasar',
                  children: [
                    _buildInfoRow(context, 'Nama Layanan', service.name),
                    if (service.description != null &&
                        service.description!.isNotEmpty)
                      _buildInfoRow(context, 'Deskripsi', service.description!),
                    _buildInfoRow(context, 'Slug', service.slug),
                  ],
                ),
                SizedBox(height: context.space.lg),

                _buildInfoSection(
                  context,
                  title: 'Kategori & Satuan',
                  children: [
                    _buildInfoRow(
                      context,
                      'Kategori',
                      service.category?.name ?? 'N/A',
                      icon: Icons.category_outlined,
                    ),
                    _buildInfoRow(
                      context,
                      'Satuan',
                      service.unit?.name ?? 'N/A',
                      icon: Icons.straighten_outlined,
                    ),
                  ],
                ),
                SizedBox(height: context.space.lg),

                // Price & Duration
                _buildInfoSection(
                  context,
                  title: 'Harga & Durasi',
                  children: [
                    _buildInfoRow(
                      context,
                      'Harga',
                      currencyFormat.format(service.price),
                      icon: Icons.attach_money_outlined,
                      valueColor: context.colors.primary,
                      valueWeight: FontWeight.bold,
                    ),
                    _buildInfoRow(
                      context,
                      'Durasi Pengerjaan',
                      '${service.durationHours} jam',
                      icon: Icons.access_time_outlined,
                    ),
                    _buildInfoRow(
                      context,
                      'Minimal Kuantitas',
                      '${service.minQuantity}',
                      icon: Icons.inventory_2_outlined,
                    ),
                  ],
                ),
                SizedBox(height: context.space.lg),

                // Timestamps
                _buildInfoSection(
                  context,
                  title: 'Informasi Tambahan',
                  children: [
                    if (service.createdAt != null)
                      _buildInfoRow(
                        context,
                        'Dibuat',
                        _formatDateTime(service.createdAt!),
                        icon: Icons.calendar_today_outlined,
                      ),
                    if (service.updatedAt != null)
                      _buildInfoRow(
                        context,
                        'Terakhir Diubah',
                        _formatDateTime(service.updatedAt!),
                        icon: Icons.update_outlined,
                      ),
                    if (service.deletedAt != null)
                      _buildInfoRow(
                        context,
                        'Dihapus',
                        _formatDateTime(service.deletedAt!),
                        icon: Icons.delete_outline,
                        valueColor: context.colors.error,
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

    List<Widget> buildActions(LaundryServiceState state) {
      if (state is LaundryServiceDetailLoaded) {
        final service = state.service;
        return [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => _navigateToEdit(service),
            tooltip: 'Edit Layanan',
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) {
              if (value == 'delete') {
                _handleDelete(service.id);
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete_outline, color: context.colors.error),
                    SizedBox(width: context.space.sm),
                    Text(
                      'Hapus',
                      style: TextStyle(color: context.colors.error),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ];
      }
      return [];
    }

    if (isCompact) {
      return BlocBuilder<LaundryServiceCubit, LaundryServiceState>(
        builder: (context, state) {
          return AppLayout(
            header: AppHeader(
              title: 'Detail Layanan',
              onBackPressed: () => Navigator.pop(context),
              actions: buildActions(state),
            ),
            body: content,
          );
        }
      );
    }

    return BlocBuilder<LaundryServiceCubit, LaundryServiceState>(
      builder: (context, state) {
        return Column(
          children: [
            PageContentHeader(
              title: 'Detail Layanan',
              breadcrumbs: [
                const BreadcrumbItem(label: 'Pengaturan'),
                BreadcrumbItem(label: 'Layanan', onTap: () => Navigator.pop(context)),
                const BreadcrumbItem(label: 'Detail Layanan'),
              ],
              actions: buildActions(state),
            ),
            Expanded(
              child: ContentConstraint(
                child: content,
              ),
            ),
          ],
        );
      }
    );
  }

  Widget _buildHeaderCard(BuildContext context, LaundryService service) {
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
              Icons.local_laundry_service_rounded,
              size: 48,
              color: Colors.white,
            ),
          ),
          SizedBox(height: context.space.md),
          Text(
            service.name,
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
              color: service.isActive
                  ? Colors.green.withValues(alpha: 0.2)
                  : Colors.red.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(context.radius.full),
              border: Border.all(
                color: service.isActive ? Colors.green : Colors.red,
                width: 1.5,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  service.isActive ? Icons.check_circle : Icons.cancel,
                  size: 16,
                  color: service.isActive ? Colors.green : Colors.red,
                ),
                SizedBox(width: context.space.xs),
                Text(
                  service.isActive ? 'Aktif' : 'Nonaktif',
                  style: context.typography.bodySmall.copyWith(
                    color: service.isActive ? Colors.green : Colors.red,
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

  void _navigateToEdit(LaundryService service) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => EditLaundryServiceScreen(service: service),
      ),
    ).then((_) => _loadData());
  }

  void _handleDelete(int id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(context.radius.lg),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: context.colors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.delete_rounded, color: context.colors.error),
            ),
            SizedBox(width: context.space.sm),
            const Text('Hapus Layanan'),
          ],
        ),
        content: const Text(
          'Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<LaundryServiceCubit>().destroy(id);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: context.colors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }
}
