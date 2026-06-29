import 'package:flutter/material.dart';

import 'discovery_header_icon_button_widget.dart';

class DiscoveryBackButtonWidget extends StatelessWidget {
  final VoidCallback onTap;

  const DiscoveryBackButtonWidget({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return DiscoveryHeaderIconButtonWidget(
      tooltip: 'Kembali',
      icon: Icons.arrow_back_rounded,
      onTap: onTap,
    );
  }
}
