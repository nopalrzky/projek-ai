import 'package:flutter/material.dart';

enum AppEmptyStateSize {
  sm,
  md,
  lg;

  double get maxWidth {
    return switch (this) {
      AppEmptyStateSize.sm => 200.0,
      AppEmptyStateSize.md => 280.0,
      AppEmptyStateSize.lg => 360.0,
    };
  }

  double get iconSize {
    return switch (this) {
      AppEmptyStateSize.sm => 40.0,
      AppEmptyStateSize.md => 64.0,
      AppEmptyStateSize.lg => 96.0,
    };
  }
}

enum AppEmptyStateVariant {
  generic,
  search,
  order,
  customer,
  error;

  IconData get defaultIcon {
    return switch (this) {
      AppEmptyStateVariant.generic => Icons.inbox_outlined,
      AppEmptyStateVariant.search => Icons.search_off_rounded,
      AppEmptyStateVariant.order => Icons.receipt_long_outlined,
      AppEmptyStateVariant.customer => Icons.people_outline_rounded,
      AppEmptyStateVariant.error => Icons.error_outline_rounded,
    };
  }
}
