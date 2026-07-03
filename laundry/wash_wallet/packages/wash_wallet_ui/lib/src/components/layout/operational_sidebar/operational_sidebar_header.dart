import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';

class OperationalSidebarHeader extends StatelessWidget {
  final String appName;
  final String? appRoleLabel;
  final Widget? logoWidget;
  final bool collapsed;

  const OperationalSidebarHeader({
    super.key,
    required this.appName,
    this.appRoleLabel,
    this.logoWidget,
    this.collapsed = false,
  });

  @override
  Widget build(BuildContext context) {
    if (collapsed) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24.0),
        child: Center(
          child:
              logoWidget ??
              Icon(Icons.business, size: 32, color: context.colors.primary),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Row(
        children: [
          if (logoWidget != null) ...[logoWidget!, const SizedBox(width: 16)],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  appName,
                  style: context.typography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (appRoleLabel != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    appRoleLabel!,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
