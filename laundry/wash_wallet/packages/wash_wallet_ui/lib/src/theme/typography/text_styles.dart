import 'package:flutter/material.dart';
import 'app_fonts.dart';

class TextStyles {
  TextStyles._();

  static TextStyle base({
    required double fontSize,
    required FontWeight fontWeight,
    double height = 1.4,
    double letterSpacing = 0,
    Color? color,
  }) {
    return TextStyle(
      fontFamily: AppFonts.fontFamily,
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: height,
      letterSpacing: letterSpacing,
      color: color,
    );
  }
}
