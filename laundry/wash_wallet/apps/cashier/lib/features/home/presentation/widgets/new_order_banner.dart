import 'package:flutter/material.dart';
import 'package:wash_wallet_cashier/core/services/notification_service.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class NewOrderBanner extends StatelessWidget {
  final NewOrderPayload payload;
  final VoidCallback onTap;
  final VoidCallback onClose;

  const NewOrderBanner({
    super.key,
    required this.payload,
    required this.onTap,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Material(
          elevation: 8,
          color: context.colors.primary,
          borderRadius: BorderRadius.circular(context.radius.md),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(context.radius.md),
            child: Padding(
              padding: EdgeInsets.all(context.space.md),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(context.radius.sm),
                    ),
                    child: const Icon(
                      Icons.receipt_long_rounded,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(width: context.space.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Pesanan baru masuk',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: context.space.xs),
                        Text(
                          '${payload.orderNumber} - ${payload.customerName}',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.88),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: onClose,
                    icon: const Icon(Icons.close_rounded, color: Colors.white),
                    tooltip: 'Tutup',
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
