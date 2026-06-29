enum AppCardSize { sm, md, lg }

extension AppCardSizeExtension on AppCardSize {
  String get paddingKey {
    switch (this) {
      case AppCardSize.sm:
        return 'md'; // 12px
      case AppCardSize.md:
        return 'lg'; // 16px
      case AppCardSize.lg:
        return 'xl'; // 24px
    }
  }
}
