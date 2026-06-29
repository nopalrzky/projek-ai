import 'package:flutter/material.dart';
import 'app_drawer_header.dart';
import 'app_drawer_footer.dart';
import 'app_drawer_menu_section.dart';
import 'styles/app_drawer_style.dart';
import 'variants/app_drawer_variant.dart';

class AppDrawer extends StatelessWidget {
  final AppDrawerHeader? header;
  final List<AppDrawerMenuSection> sections;
  final AppDrawerFooter? footer;
  final AppDrawerVariant variant;
  final double? width;
  final Color? backgroundColor;

  const AppDrawer({
    super.key,
    this.header,
    required this.sections,
    this.footer,
    this.variant = AppDrawerVariant.standard,
    this.width,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final style = AppDrawerStyle(variant: variant, context: context);

    return Drawer(
      width: width ?? style.width,
      backgroundColor: backgroundColor ?? style.backgroundColor,
      child: SafeArea(
        child: Column(
          children: [
            if (header != null) header!,
            Expanded(
              child: ListView(
                padding: style.contentPadding,
                children: sections,
              ),
            ),
            if (footer != null) footer!,
          ],
        ),
      ),
    );
  }
}
