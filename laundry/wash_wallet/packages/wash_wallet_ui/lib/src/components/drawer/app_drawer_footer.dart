import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'styles/app_drawer_style.dart';
import 'variants/app_drawer_variant.dart';
import '../divider/app_divider.dart';
import '../button/app_button.dart';

class AppDrawerFooter extends StatelessWidget {
  final String? version;
  final VoidCallback? onLogout;
  final VoidCallback? onHelp;
  final AppDrawerVariant variant;

  const AppDrawerFooter({
    super.key,
    this.version,
    this.onLogout,
    this.onHelp,
    this.variant = AppDrawerVariant.standard,
  });

  @override
  Widget build(BuildContext context) {
    final style = AppDrawerStyle(variant: variant, context: context);

    if (variant == AppDrawerVariant.compact) {
      return _buildCompactFooter(context, style);
    }

    return _buildStandardFooter(context, style);
  }

  Widget _buildStandardFooter(BuildContext context, AppDrawerStyle style) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: AppDivider.soft(),
        ),
        const SizedBox(height: 8.0),
        if (onLogout != null)
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16.0,
              vertical: 8.0,
            ),
            child: AppButton.outline(
              label: 'Keluar',
              icon: const Icon(Icons.logout, size: 18.0),
              onPressed: onLogout,
              isFullWidth: true,
            ),
          ),
        if (version != null)
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'v$version',
              style: style.footerTextStyle,
              textAlign: TextAlign.center,
            ),
          ),
      ],
    );
  }

  Widget _buildCompactFooter(BuildContext context, AppDrawerStyle style) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (onLogout != null)
          IconButton(
            icon: Icon(Icons.logout, color: context.colors.error),
            onPressed: onLogout,
            tooltip: 'Keluar',
          ),
        if (version != null)
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              version!,
              style: style.footerTextStyle.copyWith(fontSize: 10.0),
              textAlign: TextAlign.center,
            ),
          ),
      ],
    );
  }
}
