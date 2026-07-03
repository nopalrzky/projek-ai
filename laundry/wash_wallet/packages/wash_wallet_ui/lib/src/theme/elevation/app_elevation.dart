import 'package:flutter/material.dart';

class AppElevation {
  AppElevation._();

  static const List<BoxShadow> none = [];

  static final List<BoxShadow> xs = [
    BoxShadow(
      color: Color(0xFF0F1211).withValues(alpha: 0.04),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  static final List<BoxShadow> sm = [
    BoxShadow(
      color: Color(0xFF0F1211).withValues(alpha: 0.06),
      blurRadius: 6,
      offset: Offset(0, 2),
    ),
  ];

  static final List<BoxShadow> md = [
    BoxShadow(
      color: Color(0xFF0F1211).withValues(alpha: 0.08),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
  ];

  static final List<BoxShadow> lg = [
    BoxShadow(
      color: Color(0xFF0F1211).withValues(alpha: 0.12),
      blurRadius: 20,
      offset: Offset(0, 8),
    ),
  ];
}
