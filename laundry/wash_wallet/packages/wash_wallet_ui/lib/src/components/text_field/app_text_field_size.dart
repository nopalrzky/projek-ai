enum AppTextFieldSize { sm, md, lg }

extension AppTextFieldSizeExtension on AppTextFieldSize {
  double get height {
    switch (this) {
      case AppTextFieldSize.sm:
        return 40.0;
      case AppTextFieldSize.md:
        return 48.0;
      case AppTextFieldSize.lg:
        return 56.0;
    }
  }

  double get contentPadding {
    switch (this) {
      case AppTextFieldSize.sm:
        return 12.0;
      case AppTextFieldSize.md:
        return 16.0;
      case AppTextFieldSize.lg:
        return 20.0;
    }
  }
}
