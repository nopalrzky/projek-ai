import 'package:flutter/material.dart';

class CashierNotificationPanel extends StatelessWidget {
  const CashierNotificationPanel({
    super.key,
    required this.newOrderBanner,
  });

  final Widget? newOrderBanner;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasNotification = newOrderBanner != null;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: hasNotification 
            ? theme.colorScheme.errorContainer.withValues(alpha: 0.2)
            : theme.colorScheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasNotification
              ? theme.colorScheme.error.withValues(alpha: 0.3)
              : theme.colorScheme.outlineVariant,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                hasNotification ? Icons.notifications_active_rounded : Icons.notifications_none_rounded,
                color: hasNotification ? theme.colorScheme.error : theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 8),
              Text(
                'Notifikasi',
                style: theme.textTheme.titleSmall?.copyWith(
                  color: hasNotification ? theme.colorScheme.error : theme.colorScheme.onSurfaceVariant,
                  fontWeight: hasNotification ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (hasNotification)
            newOrderBanner!
          else
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.check_circle_outline_rounded,
                      size: 32,
                      color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tidak ada notifikasi baru',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
