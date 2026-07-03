import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_cashier/core/navigation/cashier_navigation_config.dart';
import 'package:wash_wallet_cashier/core/permissions/cashier_permissions.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

void main() {
  AuthEmployee employeeWith(List<String> permissions) {
    return AuthEmployee(
      id: 1,
      name: 'Test',
      username: 'test',
      outletId: 1,
      accessibleOutlets: const [],
      allPermissions: permissions,
      hasPin: true,
    );
  }

  List<String> labelsFor(List<SidebarMenuSection> sections) {
    return sections
        .expand((section) => section.items)
        .map((item) => item.label)
        .toList();
  }

  test('menu transaksi tidak muncul tanpa permission order', () {
    final sections = CashierNavigationConfig.buildSections(
      employeeWith([CashierPermissions.laundryServiceView]),
    );

    expect(labelsFor(sections), isNot(contains('Transaksi')));
  });

  test('menu layanan laundry muncul dengan laundry_service.view', () {
    final sections = CashierNavigationConfig.buildSections(
      employeeWith([CashierPermissions.laundryServiceView]),
    );

    expect(labelsFor(sections), contains('Layanan Laundry'));
  });

  test('menu keuangan tidak muncul tanpa permission finance', () {
    final sections = CashierNavigationConfig.buildSections(
      employeeWith([CashierPermissions.orderView]),
    );

    expect(labelsFor(sections), isNot(contains('Setoran')));
    expect(labelsFor(sections), isNot(contains('Petty Cash')));
    expect(labelsFor(sections), isNot(contains('Pengeluaran Outlet')));
  });

  test(
    'menu kategori muncul dengan category.create walau tanpa category.view',
    () {
      final sections = CashierNavigationConfig.buildSections(
        employeeWith([CashierPermissions.categoryCreate]),
      );

      expect(labelsFor(sections), contains('Kategori'));
    },
  );
}
