class ApiEndpoints {
  final String _prefix;

  const ApiEndpoints(this._prefix);

  factory ApiEndpoints.cashier() => const ApiEndpoints('/mobile/cashier');
  factory ApiEndpoints.production() => const ApiEndpoints('/mobile/production');
  factory ApiEndpoints.customer() => const ApiEndpoints('/mobile/customer');

  String get login => '$_prefix/auth/login';
  String get logout => '$_prefix/auth/logout';
  String get me => '$_prefix/auth/me';
  String get updateFcmToken => '$_prefix/auth/fcm-token';
  String get validateToken => '$_prefix/auth/validate';
  String get cashierPinReset => '$_prefix/auth/pin/reset';

  String get dashboard => '$_prefix/dashboard';
  String get customerHomeDashboard => '$_prefix/dashboard/home';

  String get customerAddresses => '$_prefix/addresses';
  String customerAddress(int addressId) => '$_prefix/addresses/$addressId';

  String get outlets => '$_prefix/outlets';
  String get nearbyOutlets => '$_prefix/outlets/nearby';
  String outlet(int outletId) => '$_prefix/outlets/$outletId';
  String outletReviews(int outletId) => '$_prefix/outlets/$outletId/reviews';
  String outletReviewSummary(int outletId) =>
      '$_prefix/outlets/$outletId/review-summary';

  String get orderReviews => '$_prefix/order-reviews';
  String orderReview(int id) => '$_prefix/order-reviews/$id';
  String orderReviewSummary(int outletId) =>
      '$_prefix/order-reviews/summary/$outletId';

  String get categories => '$_prefix/categories';
  String category(int categoryId) => '$_prefix/categories/$categoryId';

  String get courierSchedules => '$_prefix/courier-schedules';
  String courierCalculateFee(int outletId) =>
      '$_prefix/courier-settings/$outletId/calculate-fee';
  String courierSettingSummary(int outletId) =>
      '$_prefix/courier-settings/$outletId';

  String get membershipContracts => '$_prefix/membership-contracts';
  String membershipContract(int membershipContractId) =>
      '$_prefix/membership-contracts/$membershipContractId';

  String get membershipPlans => '$_prefix/membership-plans';
  String membershipPlan(int membershipPlanId) =>
      '$_prefix/membership-plans/$membershipPlanId';

  String get customers => '$_prefix/customers';
  String customer(int customerId) => '$_prefix/customers/$customerId';

  String get customerSubscriptions => '$_prefix/customer-subscriptions';
  String customerSubscription(int customerSubscriptionId) =>
      '$_prefix/customer-subscriptions/$customerSubscriptionId';

  String get deposits => '$_prefix/deposits';
  String deposit(int depositId) => '$_prefix/deposits/$depositId';

  String get servicePackages => '$_prefix/service-packages';
  String servicePackage(int servicePackageId) =>
      '$_prefix/service-packages/$servicePackageId';

  String get laundryServices => '$_prefix/laundry-services';

  String get employees => '$_prefix/employees';
  String get orders => '$_prefix/orders';
  String get ordersNewCount => '$_prefix/orders/new-count';

  String order(int orderId) => '$_prefix/orders/$orderId';
  String orderCancel(int orderId) => '$_prefix/orders/$orderId/cancel';
  String orderPay(int orderId) => '$_prefix/orders/$orderId/pay';
  String orderPaymentStatus(int orderId) =>
      '$_prefix/orders/$orderId/payment-status';
  String orderScheduleDelivery(int orderId) =>
      '$_prefix/orders/$orderId/schedule-delivery';
  String orderComplete(int orderId) => '$_prefix/orders/$orderId/complete';

  String get orderItems => '$_prefix/order-items';
  String orderItem(int orderItemId) => '$_prefix/order-items/$orderItemId';

  String orderItemStart(int orderItemId) =>
      '$_prefix/order-items/$orderItemId/start';

  String orderItemComplete(int orderItemId) =>
      '$_prefix/order-items/$orderItemId/complete';

  String orderItemProcessStart(int processId) =>
      '$_prefix/order-item-processes/$processId/start';

  String orderItemProcessComplete(int processId) =>
      '$_prefix/order-item-processes/$processId/complete';

  String get units => '$_prefix/units';

  String get accounts => '$_prefix/accounts';

  String get expenses => '$_prefix/expenses';

  String get pettyCashes => '$_prefix/petty-cashes';
  String pettyCash(int id) => '$_prefix/petty-cashes/$id';
  String expense(int expenseId) => '$_prefix/expenses/$expenseId';

  String waNotificationPreview(int orderId) =>
      '$_prefix/orders/$orderId/wa-notification-preview';

  String waNotificationSend(int orderId) =>
      '$_prefix/orders/$orderId/send-wa-notification';

  String orderPrintInfo(int orderId) => '/orders/$orderId/print/info';

  String orderPrintReceipt(int orderId) => '/orders/$orderId/print/receipt';

  String orderPrintLabel(int orderId) => '/orders/$orderId/print/label';

  String get customerTopups => '$_prefix/topups';
  String customerTopup(int id) => '$_prefix/topups/$id';
}
