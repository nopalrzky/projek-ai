import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_color_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_typography_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_spacing_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_radius_extension.dart';

void main() {
  group('OperationalTabletShell', () {
    testWidgets('medium default collapsed tetapi toggle bisa expand', (tester) async {
      tester.view.physicalSize = const Size(800, 1000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

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
          home: OperationalTabletShell(
            appName: 'Test',
            menuSections: [
              SidebarMenuSection(
                items: [
                  SidebarMenuItem(
                    id: 'test',
                    label: 'Test',
                    icon: Icons.home,
                  ),
                ],
              ),
            ],
            body: const Text('Body'),
          ),
        ),
      );

      // By default collapsed (OperationalSidebar uses NavigationRail internally or custom column)
      final sidebarFinder = find.byType(OperationalSidebar);
      expect(sidebarFinder, findsOneWidget);
      OperationalSidebar sidebar = tester.widget(sidebarFinder);
      expect(sidebar.collapsed, isTrue);

      // Tap to expand
      final toggleButton = find.byIcon(Icons.menu);
      expect(toggleButton, findsOneWidget);
      await tester.tap(toggleButton);
      await tester.pumpAndSettle();

      sidebar = tester.widget(sidebarFinder);
      expect(sidebar.collapsed, isFalse);
    });
  });
}
