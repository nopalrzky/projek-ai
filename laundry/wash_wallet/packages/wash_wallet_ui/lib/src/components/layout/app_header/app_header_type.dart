enum AppHeaderType {
  standard,
  compact,
  large,
  transparent;

  double get height {
    switch (this) {
      case AppHeaderType.standard:
        return 64.0;
      case AppHeaderType.compact:
        return 56.0;
      case AppHeaderType.large:
        return 96.0;
      case AppHeaderType.transparent:
        return 64.0;
    }
  }

  bool get supportsSubtitle {
    switch (this) {
      case AppHeaderType.standard:
      case AppHeaderType.large:
        return true;
      case AppHeaderType.compact:
      case AppHeaderType.transparent:
        return false;
    }
  }
}
