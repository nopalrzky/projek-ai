import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderActionButtons extends StatelessWidget {
  final VoidCallback onPrintReceipt;
  final VoidCallback onSendWaNotification;
  final VoidCallback? onCompleteOrder;
  final VoidCallback? onAcceptOrder;
  final VoidCallback? onRejectOrder;
  final VoidCallback? onWeighOrder;
  final VoidCallback? onStartOrder;
  final VoidCallback? onBack;
  final bool isProcessing;
  final bool showCompleteButton;
  final bool showAcceptRejectButtons;
  final bool showWeighButton;
  final bool showStartButton;
  final bool showPrintButton;
  final bool showWaButton;
  final String? completeButtonHint;

  const OrderActionButtons({
    super.key,
    required this.onPrintReceipt,
    required this.onSendWaNotification,
    this.onCompleteOrder,
    this.onAcceptOrder,
    this.onRejectOrder,
    this.onWeighOrder,
    this.onStartOrder,
    required this.onBack,
    this.isProcessing = false,
    this.showCompleteButton = false,
    this.showAcceptRejectButtons = false,
    this.showWeighButton = false,
    this.showStartButton = false,
    this.showPrintButton = true,
    this.showWaButton = true,
    this.completeButtonHint,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (showAcceptRejectButtons) ...[
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: isProcessing ? null : onAcceptOrder,
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('Terima'),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: context.space.md),
                    backgroundColor: context.colors.success,
                    foregroundColor: context.colors.onPrimary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                ),
              ),
              SizedBox(width: context.space.md),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: isProcessing ? null : onRejectOrder,
                  icon: const Icon(Icons.cancel_outlined),
                  label: const Text('Tolak'),
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: context.space.md),
                    backgroundColor: context.colors.error,
                    foregroundColor: context.colors.onPrimary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(context.radius.md),
                    ),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
        ],

        if (showWeighButton) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: isProcessing ? null : onWeighOrder,
              icon: const Icon(Icons.scale_outlined),
              label: const Text('Timbang Pesanan'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: context.space.md),
                backgroundColor: context.colors.secondary,
                foregroundColor: context.colors.onSecondary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
              ),
            ),
          ),
          SizedBox(height: context.space.md),
        ],

        if (showStartButton) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: isProcessing ? null : onStartOrder,
              icon: const Icon(Icons.play_circle_outline),
              label: const Text('Mulai Proses'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: context.space.md),
                backgroundColor: context.colors.primary,
                foregroundColor: context.colors.onPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
              ),
            ),
          ),
          SizedBox(height: context.space.md),
        ],

        if (showCompleteButton) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: isProcessing ? null : onCompleteOrder,
              icon: isProcessing
                  ? SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          context.colors.onPrimary,
                        ),
                      ),
                    )
                  : const Icon(Icons.check_circle_outline),
              label: Text(isProcessing ? 'Memproses...' : 'Selesaikan Pesanan'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: context.space.md),
                backgroundColor: context.colors.success,
                foregroundColor: context.colors.onPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
              ),
            ),
          ),
          if (completeButtonHint != null)
            Padding(
              padding: EdgeInsets.only(top: context.space.xs),
              child: Text(
                completeButtonHint!,
                style: context.typography.caption.copyWith(
                  color: context.colors.error,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          SizedBox(height: context.space.md),
        ],

        if (showPrintButton) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: isProcessing ? null : onPrintReceipt,
              icon: isProcessing
                  ? SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          context.colors.onPrimary,
                        ),
                      ),
                    )
                  : const Icon(Icons.print),
              label: Text(
                isProcessing ? 'Memproses...' : 'Cetak Struk / Label',
              ),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: context.space.md),
                backgroundColor: context.colors.primary,
                foregroundColor: context.colors.onPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
              ),
            ),
          ),
          SizedBox(height: context.space.md),
        ],

        if (showWaButton) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: isProcessing ? null : onSendWaNotification,
              icon: const Icon(Icons.chat_rounded),
              label: const Text('Kirim Notifikasi WhatsApp'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: context.space.md),
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
              ),
            ),
          ),
          SizedBox(height: context.space.md),
        ],

        if (onBack != null) ...[
          // Back Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: isProcessing ? null : onBack,
              icon: const Icon(Icons.arrow_back),
              label: const Text('Kembali'),
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: context.space.md),
                side: BorderSide(color: context.colors.primary),
                foregroundColor: context.colors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
