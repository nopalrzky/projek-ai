import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryHeaderIconButtonWidget extends StatelessWidget {
  final String tooltip;
  final IconData icon;
  final VoidCallback onTap;

  const DiscoveryHeaderIconButtonWidget({
    super.key,
    required this.tooltip,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: context.colors.neutralMuted.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(context.radius.full),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(context.radius.full),
          child: SizedBox(
            width: 40,
            height: 40,
            child: Icon(icon, color: context.colors.textPrimary, size: 22),
          ),
        ),
      ),
    );
  }
}
