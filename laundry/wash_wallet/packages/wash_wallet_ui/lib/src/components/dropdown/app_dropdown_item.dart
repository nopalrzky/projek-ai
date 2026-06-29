import 'package:flutter/material.dart';

class AppDropdownItem<T> {
  final T value;
  final String label;
  final String? subtitle;
  final Widget? leading;

  const AppDropdownItem({
    required this.value,
    required this.label,
    this.subtitle,
    this.leading,
  });
}
