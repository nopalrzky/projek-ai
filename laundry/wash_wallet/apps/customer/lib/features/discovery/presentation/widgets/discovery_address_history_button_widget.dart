import 'package:flutter/material.dart';

import 'discovery_header_icon_button_widget.dart';

class DiscoveryAddressHistoryButtonWidget extends StatelessWidget {
  final VoidCallback onTap;

  const DiscoveryAddressHistoryButtonWidget({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return DiscoveryHeaderIconButtonWidget(
      tooltip: 'Alamat terakhir',
      icon: Icons.history_rounded,
      onTap: onTap,
    );
  }
}
