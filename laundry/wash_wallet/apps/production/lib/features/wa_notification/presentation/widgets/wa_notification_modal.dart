import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/wa_notification_cubit.dart';
import '../bloc/wa_notification_state.dart';
import 'wa_notification_coin_card.dart';
import 'wa_notification_message_card.dart';
import 'wa_notification_preview_error.dart';
import 'wa_notification_recipient_card.dart';

Future<void> showWaNotificationModal(
  BuildContext context, {
  required int orderId,
}) async {
  final cubit = context.read<WaNotificationCubit>();
  cubit.getPreview(orderId);

  await AppBottomSheet.show<void>(
    context,
    title: 'Kirim Notifikasi WhatsApp',
    subtitle: 'Beritahu customer bahwa kurir sedang menuju alamat pickup.',
    child: BlocProvider.value(
      value: cubit,
      child: _WaNotificationSheet(orderId: orderId),
    ),
  );

  cubit.reset();
}

class _WaNotificationSheet extends StatelessWidget {
  final int orderId;

  const _WaNotificationSheet({required this.orderId});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<WaNotificationCubit, WaNotificationState>(
      listener: _handleStateChange,
      builder: (context, state) {
        if (state is WaNotificationPreviewLoading) {
          return const Center(child: AppLoadingIndicator());
        }

        if (state is WaNotificationError && state.preview == null) {
          return WaNotificationPreviewError(
            message: state.failure.message,
            orderId: orderId,
          );
        }

        final preview = _previewFromState(state);
        if (preview == null) {
          return const Center(child: AppLoadingIndicator());
        }

        return _PreviewContent(
          orderId: orderId,
          preview: preview,
          isSending: state is WaNotificationSending,
        );
      },
    );
  }

  void _handleStateChange(BuildContext context, WaNotificationState state) {
    if (state is WaNotificationSent) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(state.message)));
    }

    if (state is WaNotificationError && state.preview != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(state.failure.message)));
    }
  }

  WaNotificationPreview? _previewFromState(WaNotificationState state) {
    return switch (state) {
      WaNotificationPreviewLoaded s => s.preview,
      WaNotificationSending s => s.preview,
      WaNotificationError s => s.preview,
      _ => null,
    };
  }
}

class _PreviewContent extends StatelessWidget {
  final int orderId;
  final WaNotificationPreview preview;
  final bool isSending;

  const _PreviewContent({
    required this.orderId,
    required this.preview,
    required this.isSending,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        WaNotificationRecipientCard(preview: preview),
        SizedBox(height: context.space.md),
        WaNotificationCoinCard(preview: preview),
        SizedBox(height: context.space.md),
        WaNotificationMessageCard(preview: preview),
        SizedBox(height: context.space.xl),
        AppButton.primary(
          label: isSending ? 'Mengirim...' : 'Kirim Notif WA',
          isFullWidth: true,
          isLoading: isSending,
          icon: const Icon(Icons.send_rounded),
          onPressed: preview.hasPhone && preview.hasEnoughCoin && !isSending
              ? () => context.read<WaNotificationCubit>().sendNotification(
                  orderId,
                  preview,
                )
              : null,
        ),
        SizedBox(height: context.space.md),
        AppButton.secondary(
          label: 'Tutup',
          isFullWidth: true,
          onPressed: isSending ? null : () => Navigator.of(context).pop(),
        ),
      ],
    );
  }
}
