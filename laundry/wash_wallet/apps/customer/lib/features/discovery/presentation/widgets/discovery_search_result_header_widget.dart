import 'package:flutter/material.dart';

import 'discovery_typo_correction_banner_widget.dart';

class DiscoverySearchResultHeaderWidget extends StatelessWidget {
  final String? correctedQuery;

  const DiscoverySearchResultHeaderWidget({super.key, this.correctedQuery});

  @override
  Widget build(BuildContext context) {
    if (correctedQuery == null || correctedQuery!.trim().isEmpty) {
      return const SizedBox.shrink();
    }

    return DiscoveryTypoCorrectionBannerWidget(
      correctedQuery: correctedQuery!.trim(),
    );
  }
}
