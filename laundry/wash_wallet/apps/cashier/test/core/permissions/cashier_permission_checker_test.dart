import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_cashier/core/permissions/cashier_permission_checker.dart';
import 'package:wash_wallet_cashier/core/permissions/cashier_permissions.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

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

  test('hasAnyCashierAccess false ketika permission kosong', () {
    expect(
      CashierPermissionChecker.hasAnyCashierAccess(employeeWith([])),
      isFalse,
    );
  });

  test('hasAnyCashierAccess true untuk laundry_service.view', () {
    expect(
      CashierPermissionChecker.hasAnyCashierAccess(
        employeeWith([CashierPermissions.laundryServiceView]),
      ),
      isTrue,
    );
  });

  test('hasAnyCashierAccess false untuk permission non cashier', () {
    expect(
      CashierPermissionChecker.hasAnyCashierAccess(
        employeeWith(['production.view']),
      ),
      isFalse,
    );
  });

  test('hasOrderSectionAccess true untuk order.create', () {
    expect(
      CashierPermissionChecker.hasOrderSectionAccess(
        employeeWith([CashierPermissions.orderCreate]),
      ),
      isTrue,
    );
  });

  test('hasFinanceSectionAccess true untuk expense.create', () {
    expect(
      CashierPermissionChecker.hasFinanceSectionAccess(
        employeeWith([CashierPermissions.expenseCreate]),
      ),
      isTrue,
    );
  });
}
