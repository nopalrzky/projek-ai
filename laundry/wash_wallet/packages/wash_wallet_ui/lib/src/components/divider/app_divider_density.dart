enum AppDividerDensity { tight, normal, loose }

extension AppDividerDensityExtension on AppDividerDensity {
  String get spacingKey {
    switch (this) {
      case AppDividerDensity.tight:
        return 'sm';
      case AppDividerDensity.normal:
        return 'md';
      case AppDividerDensity.loose:
        return 'lg';
    }
  }
}
