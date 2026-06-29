enum AppButtonSize { sm, md, lg, xl }

extension AppButtonSizeExtension on AppButtonSize {
  double get height {
    switch (this) {
      case AppButtonSize.sm:
        return 36.0;
      case AppButtonSize.md:
        return 44.0;
      case AppButtonSize.lg:
        return 52.0;
      case AppButtonSize.xl:
        return 60.0;
    }
  }

  double get minWidth {
    switch (this) {
      case AppButtonSize.sm:
        return 80.0;
      case AppButtonSize.md:
        return 100.0;
      case AppButtonSize.lg:
        return 120.0;
      case AppButtonSize.xl:
        return 140.0;
    }
  }
}
