import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import 'cashier_permissions.dart';

class CashierPermissionChecker {
  const CashierPermissionChecker._();

  static bool hasAnyCashierAccess(AuthEmployee employee) {
    return employee.hasAnyPermission(CashierPermissions.operationalPermissions);
  }

  static bool hasOrderSectionAccess(AuthEmployee employee) {
    return employee.hasAnyPermission(CashierPermissions.orderPermissions);
  }

  static bool hasCustomerSectionAccess(AuthEmployee employee) {
    return employee.hasAnyPermission(CashierPermissions.customerPermissions);
  }

  static bool hasCategorySectionAccess(AuthEmployee employee) {
    return employee.hasAnyPermission(CashierPermissions.categoryPermissions);
  }

  static bool hasLaundryServiceSectionAccess(AuthEmployee employee) {
    return employee.hasAnyPermission(
      CashierPermissions.laundryServicePermissions,
    );
  }

  static bool hasFinanceSectionAccess(AuthEmployee employee) {
    return employee.hasAnyPermission(CashierPermissions.financePermissions);
  }

  static bool canViewFinances(AuthEmployee employee) {
    return hasFinanceSectionAccess(employee);
  }
}
