import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_color_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_typography_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_spacing_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_radius_extension.dart';

void main() {
  group('OperationalTopHeader', () {
    testWidgets('renders search and actions properly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData(
            extensions: [
              AppColorExtension.light(),
              AppTypographyExtension.light(),
              AppSpacingExtension.light(),
              AppRadiusExtension.light(),
            ],
          ),
          home: Scaffold(
            body: OperationalTopHeader(
              searchHint: 'Search',
              showClock: true,
              showNotification: true,
              extraActions: [
                TopHeaderAction(
                  icon: Icons.menu,
                  onTap: () {},
                  tooltip: 'Menu',
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(OperationalTopHeader), findsOneWidget);
      expect(find.text('Search'), findsOneWidget);
      expect(find.byIcon(Icons.menu), findsOneWidget);
    });
  });
}
