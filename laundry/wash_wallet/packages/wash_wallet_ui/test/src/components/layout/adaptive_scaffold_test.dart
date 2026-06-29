import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_ui/src/components/layout/adaptive_scaffold.dart';
import 'package:wash_wallet_ui/src/components/layout/app_bottom_bar/app_bottom_bar.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_color_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_typography_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_spacing_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_radius_extension.dart';

// Helper untuk membungkus widget dengan ukuran tertentu
Widget buildSubject({
  required double width,
  required double height,
}) {
  return MaterialApp(
    theme: ThemeData(
      extensions: [
        AppColorExtension.light(),
        AppTypographyExtension.light(),
        AppSpacingExtension.light(),
        AppRadiusExtension.light(),
      ],
    ),
    home: MediaQuery(
      data: MediaQueryData(size: Size(width, height)),
      child: AdaptiveScaffold(
        currentIndex: 0,
        onDestinationSelected: (_) {},
        destinations: const [
          AdaptiveDestination(label: 'Home', icon: Icons.home),
          AdaptiveDestination(label: 'Dana', icon: Icons.account_balance_wallet),
          AdaptiveDestination(label: 'Transaksi', icon: Icons.receipt_long),
          AdaptiveDestination(label: 'Setting', icon: Icons.settings),
        ],
        body: const SizedBox.expand(),
      ),
    ),
  );
}

void main() {
  group('AdaptiveScaffold', () {
    testWidgets('compact (< 600): renders AppBottomBar, no NavigationRail', (tester) async {
      await tester.pumpWidget(buildSubject(width: 599, height: 800));
      expect(find.byType(NavigationRail), findsNothing);
      expect(find.byType(AppBottomBar), findsOneWidget);
    });

    testWidgets('medium (600): renders NavigationRail, extended == false, does not crash', (tester) async {
      await tester.pumpWidget(buildSubject(width: 600, height: 800));
      final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
      expect(rail.extended, isFalse);
      expect(rail.labelType, NavigationRailLabelType.all);
    });

    testWidgets('expanded (840): renders NavigationRail, extended == false, does not crash', (tester) async {
      await tester.pumpWidget(buildSubject(width: 840, height: 800));
      final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
      expect(rail.extended, isFalse);
      expect(rail.labelType, NavigationRailLabelType.all);
    });

    testWidgets('large (1200): renders NavigationRail, extended == true, labelType null/none, does not crash', (tester) async {
      await tester.pumpWidget(buildSubject(width: 1200, height: 800));
      final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
      expect(rail.extended, isTrue);
      final isLabelTypeValid = rail.labelType == null ||
          rail.labelType == NavigationRailLabelType.none;
      expect(isLabelTypeValid, isTrue,
          reason: 'labelType must be null or none when extended == true');
    });

    testWidgets('large (1440): renders NavigationRail, extended == true, does not crash', (tester) async {
      await tester.pumpWidget(buildSubject(width: 1440, height: 900));
      final rail = tester.widget<NavigationRail>(find.byType(NavigationRail));
      expect(rail.extended, isTrue);
    });
  });
}
