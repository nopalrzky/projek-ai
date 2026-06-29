enum AppDividerThickness { thin, regular, thick }

extension AppDividerThicknessExtension on AppDividerThickness {
  double get value {
    switch (this) {
      case AppDividerThickness.thin:
        return 0.5;
      case AppDividerThickness.regular:
        return 1.0;
      case AppDividerThickness.thick:
        return 2.0;
    }
  }
}
