import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ServiceNonCourierBadgeWidget extends StatelessWidget {
  final String? label;
  const ServiceNonCourierBadgeWidget({super.key, this.label});

  @override
  Widget build(BuildContext context) {
    return AppBadge.warning(
      label: label ?? 'Datang langsung ke outlet',
      icon: Icons.store_outlined,
      size: AppBadgeSize.sm,
      mode: AppBadgeMode.soft,
    );
  }
}
