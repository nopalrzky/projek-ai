import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/topup_cubit.dart';

class ShowTopupScreen extends StatefulWidget {
  final int topupId;
  const ShowTopupScreen({super.key, required this.topupId});

  @override
  State<ShowTopupScreen> createState() => _ShowTopupScreenState();
}

class _ShowTopupScreenState extends State<ShowTopupScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TopupCubit>().getDetail(widget.topupId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Detail Topup',
        onBackPressed: () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/topup');
          }
        },
      ),
      body: BlocBuilder<TopupCubit, TopupState>(
        builder: (context, state) {
          if (state.status == TopupStatus.loading && state.detail == null) {
            return const Center(child: AppLoadingIndicator());
          }

          if (state.detail != null) {
            return _TopupDetailBody(topup: state.detail!);
          }

          if (state.status == TopupStatus.error) {
            return Center(
              child: AppEmptyState(
                title: 'Gagal memuat data',
                description: state.errorMessage ?? 'Terjadi kesalahan',
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _TopupDetailBody extends StatelessWidget {
  final CustomerTopup topup;
  const _TopupDetailBody({required this.topup});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(context.space.lg),
      child: Column(
        children: [
          _TransactionStatusBanner(status: topup.status),
          SizedBox(height: context.space.lg),
          _TransactionInfoSection(topup: topup),
          if (topup.status == 'pending') ...[
            SizedBox(height: context.space.xl),
            AppButton.primary(
              label: 'Lanjut ke Pembayaran',
              isFullWidth: true,
              onPressed: () => context.push('/topup/payment/${topup.id}'),
            ),
          ],
        ],
      ),
    );
  }
}

class _TransactionStatusBanner extends StatelessWidget {
  final String status;
  const _TransactionStatusBanner({required this.status});

  @override
  Widget build(BuildContext context) {
    AppBadgeVariant variant;
    String label;
    IconData icon;

    switch (status) {
      case 'success':
      case 'settlement':
        variant = AppBadgeVariant.success;
        label = 'Topup Berhasil';
        icon = Icons.check_circle_outline;
        break;
      case 'pending':
        variant = AppBadgeVariant.warning;
        label = 'Menunggu Pembayaran';
        icon = Icons.access_time;
        break;
      case 'failed':
      case 'expire':
      case 'cancel':
        variant = AppBadgeVariant.danger;
        label = 'Topup Gagal';
        icon = Icons.error_outline;
        break;
      default:
        variant = AppBadgeVariant.neutral;
        label = status.toUpperCase();
        icon = Icons.help_outline;
    }

    return AppCard.filled(
      child: Column(
        children: [
          Icon(icon, size: 64, color: _getVariantColor(context, variant)),
          SizedBox(height: context.space.md),
          Text(
            label,
            style: context.typography.headlineSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: _getVariantColor(context, variant),
            ),
          ),
        ],
      ),
    );
  }

  Color _getVariantColor(BuildContext context, AppBadgeVariant variant) {
    switch (variant) {
      case AppBadgeVariant.success:
        return context.colors.success;
      case AppBadgeVariant.warning:
        return context.colors.warning;
      case AppBadgeVariant.danger:
        return context.colors.error;
      default:
        return context.colors.textSecondary;
    }
  }
}

class _TransactionInfoSection extends StatelessWidget {
  final CustomerTopup topup;
  const _TransactionInfoSection({required this.topup});

  @override
  Widget build(BuildContext context) {
    return AppCard.outlined(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Informasi Transaksi',
            style: context.typography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.md),
          _TransactionInfoRow(label: 'ID Transaksi', value: '#${topup.id}'),
          _TransactionInfoRow(
            label: 'Nominal',
            value:
                'Rp ${topup.amount.toString().replaceAllMapped(RegExp(r"(\d{1,3})(?=(\d{3})+(?!\d))"), (Match m) => "${m[1]}.")}',
          ),
          _TransactionInfoRow(
            label: 'Metode Pembayaran',
            value: topup.paymentMethod.replaceAll('_', ' ').toUpperCase(),
          ),
          _TransactionInfoRow(
            label: 'Provider',
            value: topup.paymentProvider.toUpperCase(),
          ),
          _TransactionInfoRow(
            label: 'Waktu Transaksi',
            value: topup.createdAt?.toLocal().toString().split('.')[0] ?? '-',
          ),
          if (topup.midtransOrderId != null)
            _TransactionInfoRow(
              label: 'Order ID (Midtrans)',
              value: topup.midtransOrderId!,
            ),
        ],
      ),
    );
  }
}

class _TransactionInfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _TransactionInfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.space.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
          Text(
            value,
            style: context.typography.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
