import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/wa_notification_cubit.dart';
import '../bloc/wa_notification_state.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

Future<void> showWaNotificationModal(
  BuildContext context, {
  required int orderId,
}) async {
  final cubit = context.read<WaNotificationCubit>();
  cubit.getPreview(orderId);

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => BlocProvider.value(
      value: cubit,
      child: _WaNotificationSheet(orderId: orderId),
    ),
  );

  cubit.reset();
}

class _WaNotificationSheet extends StatefulWidget {
  final int orderId;

  const _WaNotificationSheet({required this.orderId});

  @override
  State<_WaNotificationSheet> createState() => _WaNotificationSheetState();
}

class _WaNotificationSheetState extends State<_WaNotificationSheet> {
  late final String _clientRequestId;

  @override
  void initState() {
    super.initState();
    _clientRequestId =
        'wa_${DateTime.now().millisecondsSinceEpoch}_${widget.orderId}';
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<WaNotificationCubit, WaNotificationState>(
      listener: (context, state) {
        if (state is WaNotificationSent) {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.green,
            ),
          );
        } else if (state is WaNotificationError && state.preview == null) {
        } else if (state is WaNotificationError && state.preview != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.failure.message),
              backgroundColor: Colors.red,
            ),
          );
        }
      },
      builder: (context, state) {
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          builder: (_, scrollController) {
            return Container(
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
              ),
              child: Column(
                children: [
                  _buildHandle(context),
                  _buildHeader(context),
                  Expanded(child: _buildBody(context, state, scrollController)),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildHandle(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: context.space.sm),
      child: Container(
        width: 40,
        height: 4,
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.md,
        vertical: context.space.sm,
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(context.space.xs),
            decoration: BoxDecoration(
              color: Colors.green.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.chat_rounded,
              color: Colors.green,
              size: 22,
            ),
          ),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Text(
              'Kirim Notifikasi WhatsApp',
              style: context.typography.headlineMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.close),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    WaNotificationState state,
    ScrollController scrollController,
  ) {
    if (state is WaNotificationPreviewLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state is WaNotificationError && state.preview == null) {
      return _buildErrorState(context, state.failure.message);
    }

    final WaNotificationPreview? preview = switch (state) {
      WaNotificationPreviewLoaded s => s.preview,
      WaNotificationSending s => s.preview,
      WaNotificationError s => s.preview,
      _ => null,
    };

    if (preview == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final isSending = state is WaNotificationSending;

    return ListView(
      controller: scrollController,
      padding: EdgeInsets.all(context.space.md),
      children: [
        _buildRecipientCard(context, preview),
        SizedBox(height: context.space.md),
        _buildCoinCard(context, preview),
        SizedBox(height: context.space.md),
        _buildMessagePreview(context, preview),
        SizedBox(height: context.space.xl),
        _buildActions(context, preview, isSending),
        SizedBox(height: context.space.md),
      ],
    );
  }

  Widget _buildErrorState(BuildContext context, String message) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(context.space.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red[400]),
            SizedBox(height: context.space.md),
            Text(
              message,
              textAlign: TextAlign.center,
              style: context.typography.bodyMedium,
            ),
            SizedBox(height: context.space.lg),
            ElevatedButton.icon(
              onPressed: () => context.read<WaNotificationCubit>().getPreview(
                widget.orderId,
              ),
              icon: const Icon(Icons.refresh),
              label: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecipientCard(
    BuildContext context,
    WaNotificationPreview preview,
  ) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Penerima',
            style: context.typography.bodySmall.copyWith(
              color: Colors.grey[600],
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.space.xs),
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: Colors.blue.withValues(alpha: 0.1),
                child: const Icon(Icons.person, color: Colors.blue, size: 18),
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      preview.customerName,
                      style: context.typography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (preview.hasPhone && preview.customerPhone != null)
                      Text(
                        preview.customerPhone!,
                        style: context.typography.bodySmall.copyWith(
                          color: Colors.grey[600],
                        ),
                      )
                    else
                      Text(
                        'Tidak ada nomor telepon',
                        style: context.typography.bodySmall.copyWith(
                          color: Colors.red[400],
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

  Widget _buildCoinCard(BuildContext context, WaNotificationPreview preview) {
    final hasEnough = preview.hasPhone && preview.hasEnoughCoin;
    final statusColor = hasEnough ? Colors.green : Colors.orange;
    final statusBg = hasEnough
        ? Colors.green.withValues(alpha: 0.08)
        : Colors.orange.withValues(alpha: 0.08);

    String infoText;
    if (!preview.hasPhone) {
      infoText = 'Pelanggan tidak memiliki nomor telepon terdaftar.';
    } else if (!preview.hasEnoughCoin) {
      infoText =
          'Coin tidak mencukupi. Butuh ${preview.coinPrice} coin, saldo saat ini ${preview.activeCoinBalance} coin.';
    } else {
      infoText =
          'Biaya: ${preview.coinPrice} coin dari saldo ${preview.coinSourceLabel} (sisa: ${preview.activeCoinBalance - preview.coinPrice} coin)';
    }

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: statusBg,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: statusColor.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.monetization_on_outlined,
                color: statusColor,
                size: 18,
              ),
              SizedBox(width: context.space.xs),
              Text(
                'Informasi Coin',
                style: context.typography.bodySmall.copyWith(
                  color: statusColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.sm),
          _buildCoinRow(
            context,
            'Biaya pengiriman',
            '${preview.coinPrice} coin',
          ),
          SizedBox(height: context.space.xs),
          _buildCoinRow(
            context,
            'Sumber saldo',
            preview.coinSource != null ? preview.coinSourceLabel : '-',
          ),
          SizedBox(height: context.space.xs),
          _buildCoinRow(
            context,
            'Saldo outlet',
            '${preview.outletCoinBalance} coin',
          ),
          SizedBox(height: context.space.xs),
          _buildCoinRow(
            context,
            'Saldo owner',
            '${preview.ownerCoinBalance} coin',
          ),
          SizedBox(height: context.space.sm),
          Container(
            padding: EdgeInsets.all(context.space.sm),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(context.radius.sm),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  hasEnough ? Icons.check_circle_outline : Icons.warning_amber,
                  color: statusColor,
                  size: 16,
                ),
                SizedBox(width: context.space.xs),
                Expanded(
                  child: Text(
                    infoText,
                    style: context.typography.bodySmall.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoinRow(BuildContext context, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: context.typography.bodySmall.copyWith(color: Colors.grey[700]),
        ),
        Text(
          value,
          style: context.typography.bodySmall.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildMessagePreview(
    BuildContext context,
    WaNotificationPreview preview,
  ) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pratinjau Pesan',
            style: context.typography.bodySmall.copyWith(
              color: Colors.grey[600],
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.space.sm),
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(context.space.sm),
            decoration: BoxDecoration(
              color: const Color(0xFFDCF8C6),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              preview.messagePreview,
              style: context.typography.bodySmall.copyWith(
                color: Colors.black87,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(
    BuildContext context,
    WaNotificationPreview preview,
    bool isSending,
  ) {
    final canSend = preview.hasPhone && preview.hasEnoughCoin;

    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: canSend && !isSending
                ? () => context.read<WaNotificationCubit>().sendNotification(
                    widget.orderId,
                    preview,
                    clientRequestId: _clientRequestId,
                  )
                : null,
            icon: isSending
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.send),
            label: Text(isSending ? 'Mengirim...' : 'Kirim'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: context.space.md),
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
              disabledBackgroundColor: Colors.grey[300],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
            ),
          ),
        ),
        SizedBox(height: context.space.sm),
        SizedBox(
          width: double.infinity,
          child: TextButton(
            onPressed: isSending ? null : () => Navigator.of(context).pop(),
            style: TextButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: context.space.md),
            ),
            child: const Text('Lewati'),
          ),
        ),
      ],
    );
  }
}
