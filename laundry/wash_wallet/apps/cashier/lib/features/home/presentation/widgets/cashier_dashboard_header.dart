import 'package:flutter/material.dart';

class CashierDashboardHeader extends StatelessWidget {
  const CashierDashboardHeader({
    super.key,
    required this.screenTitle,
    required this.outletName,
    required this.employeeName,
    this.notificationCount = 0,
    this.onRefreshTap,
    this.onSwitchEmployeeTap,
    this.onNotificationTap,
    this.statusChips = const [],
  });

  final String screenTitle;
  final String outletName;
  final String employeeName;
  final int notificationCount;
  final VoidCallback? onRefreshTap;
  final VoidCallback? onSwitchEmployeeTap;
  final VoidCallback? onNotificationTap;
  final List<Widget> statusChips;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          bottom: BorderSide(color: theme.colorScheme.outlineVariant, width: 1),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                screenTitle,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                outletName,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),

          const SizedBox(width: 24),

          if (statusChips.isNotEmpty) ...[
            ...statusChips.map(
              (chip) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: chip,
              ),
            ),
          ],

          const Spacer(),

          if (onRefreshTap != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              onPressed: onRefreshTap,
              tooltip: 'Refresh',
            ),

          if (onSwitchEmployeeTap != null) ...[
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.switch_account_rounded),
              onPressed: onSwitchEmployeeTap,
              tooltip: 'Ganti Akun Kasir',
            ),
          ],

          if (onNotificationTap != null) ...[
            const SizedBox(width: 8),
            Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: onNotificationTap,
                  tooltip: 'Notifikasi',
                ),
                if (notificationCount > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.error,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        notificationCount > 99
                            ? '99+'
                            : notificationCount.toString(),
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onError,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
