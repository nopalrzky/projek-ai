import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OutletStatusBadgeWidget extends StatelessWidget {
  final String operationalStatus;
  final String operationalStatusLabel;

  const OutletStatusBadgeWidget({
    super.key,
    required this.operationalStatus,
    required this.operationalStatusLabel,
  });

  @override
  Widget build(BuildContext context) {
    switch (operationalStatus) {
      case 'open':
        return AppBadge.success(label: operationalStatusLabel);
      case 'temporary_closed':
        return AppBadge.warning(label: operationalStatusLabel);
      case 'closed':
      case 'closed_today':
      case 'hours_not_set':
      default:
        return AppBadge.neutral(label: operationalStatusLabel);
    }
  }
}
