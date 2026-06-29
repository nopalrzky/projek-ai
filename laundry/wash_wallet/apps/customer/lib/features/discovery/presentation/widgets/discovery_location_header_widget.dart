import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'discovery_address_history_button_widget.dart';
import 'discovery_address_selector_widget.dart';
import 'discovery_back_button_widget.dart';

class DiscoveryLocationHeaderWidget extends StatelessWidget {
  final VoidCallback onBack;
  final VoidCallback onAddressTap;
  final VoidCallback onHistoryTap;

  const DiscoveryLocationHeaderWidget({
    super.key,
    required this.onBack,
    required this.onAddressTap,
    required this.onHistoryTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        DiscoveryBackButtonWidget(onTap: onBack),
        SizedBox(width: context.space.sm),
        Expanded(child: DiscoveryAddressSelectorWidget(onTap: onAddressTap)),
        SizedBox(width: context.space.sm),
        DiscoveryAddressHistoryButtonWidget(onTap: onHistoryTap),
      ],
    );
  }
}
