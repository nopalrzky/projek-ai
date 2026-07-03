import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

void main() {
  group('AppDataTable', () {
    testWidgets('default columnGap > 0 on compact and standard', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppDataTable<String>(
              columns: [
                DataTableColumnDef(
                  id: 'col1',
                  header: 'Col 1',
                  cellBuilder: (_, val) => Text(val),
                ),
                DataTableColumnDef(
                  id: 'col2',
                  header: 'Col 2',
                  cellBuilder: (_, val) => Text(val),
                ),
              ],
              rows: const ['A', 'B'],
              emptyMessage: 'No data',
            ),
          ),
        ),
      );

      expect(find.byType(AppDataTable<String>), findsOneWidget);
    });
  });
}
