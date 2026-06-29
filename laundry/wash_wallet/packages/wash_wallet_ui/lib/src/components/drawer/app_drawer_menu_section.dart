import 'package:flutter/material.dart';
import 'app_drawer_menu_item.dart';
import 'styles/app_drawer_style.dart';
import 'variants/app_drawer_variant.dart';
import '../divider/app_divider.dart';

class AppDrawerMenuSection extends StatelessWidget {
  final String? title;
  final List<AppDrawerMenuItem> items;
  final bool showDivider;
  final AppDrawerVariant variant;

  const AppDrawerMenuSection({
    super.key,
    this.title,
    required this.items,
    this.showDivider = false,
    this.variant = AppDrawerVariant.standard,
  });

  @override
  Widget build(BuildContext context) {
    final style = AppDrawerStyle(variant: variant, context: context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (showDivider) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: AppDivider.soft(),
          ),
          const SizedBox(height: 8.0),
        ],
        if (title != null && variant == AppDrawerVariant.standard)
          Padding(
            padding: style.sectionPadding,
            child: Text(title!.toUpperCase(), style: style.sectionTitleStyle),
          ),
        ...items,
      ],
    );
  }
}
