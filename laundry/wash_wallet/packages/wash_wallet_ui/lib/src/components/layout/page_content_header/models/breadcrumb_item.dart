import 'package:flutter/material.dart';

/// Represents a single item in the Breadcrumb navigation.
class BreadcrumbItem {
  /// The text label to display.
  final String label;

  /// The action to perform when tapped.
  /// If null, this item is considered the current active page and is not clickable.
  final VoidCallback? onTap;

  const BreadcrumbItem({required this.label, this.onTap});
}
