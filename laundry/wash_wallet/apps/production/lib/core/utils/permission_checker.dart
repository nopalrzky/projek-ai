import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class PermissionChecker {
  static const String productionView = 'production.view';
  static const String courierView = 'courier.view';
  static const String courierManage = 'courier.manage';

  static bool hasProductionAccess(AuthEmployee employee) {
    return employee.hasPermission(productionView);
  }

  static bool hasCourierAccess(AuthEmployee employee) {
    return employee.hasAnyPermission([courierView, courierManage]);
  }

  static Set<int> courierOutletIds(AuthEmployee employee) {
    return employee.accessibleOutlets
        .where(
          (outlet) => outlet.permissions.any(
            (permission) =>
                permission == courierView || permission == courierManage,
          ),
        )
        .map((outlet) => outlet.outletId)
        .toSet();
  }

  static bool hasAnyAppAccess(AuthEmployee employee) {
    return hasProductionAccess(employee) || hasCourierAccess(employee);
  }
}
