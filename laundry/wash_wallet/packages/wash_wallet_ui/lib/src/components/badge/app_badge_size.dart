enum AppBadgeSize { sm, md, lg }

extension AppBadgeSizeExtension on AppBadgeSize {
  double get height {
    switch (this) {
      case AppBadgeSize.sm:
        return 20.0;
      case AppBadgeSize.md:
        return 24.0;
      case AppBadgeSize.lg:
        return 28.0;
    }
  }

  String get horizontalPaddingKey {
    switch (this) {
      case AppBadgeSize.sm:
        return 'sm'; // 8px
      case AppBadgeSize.md:
        return 'md'; // 12px
      case AppBadgeSize.lg:
        return 'md'; // 12px
    }
  }

  double get iconSize {
    switch (this) {
      case AppBadgeSize.sm:
        return 12.0;
      case AppBadgeSize.md:
        return 14.0;
      case AppBadgeSize.lg:
        return 16.0;
    }
  }

  double get iconGap {
    switch (this) {
      case AppBadgeSize.sm:
        return 4.0;
      case AppBadgeSize.md:
        return 4.0;
      case AppBadgeSize.lg:
        return 6.0;
    }
  }
}
