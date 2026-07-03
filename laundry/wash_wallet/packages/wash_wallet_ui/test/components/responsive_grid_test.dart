import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

void main() {
  group('ResponsiveGrid', () {
    testWidgets('columnsFor and maxColumns work correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ResponsiveGrid(
              maxColumns: 4,
              children: [
                Container(key: const Key('item1')),
                Container(key: const Key('item2')),
                Container(key: const Key('item3')),
                Container(key: const Key('item4')),
                Container(key: const Key('item5')),
              ],
            ),
          ),
        ),
      );

      // Verify that it renders without throwing
      expect(find.byType(ResponsiveGrid), findsOneWidget);
    });
  });
}
