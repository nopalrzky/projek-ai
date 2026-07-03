class CashierPermissions {
  const CashierPermissions._();

  static const cashierDashboardView = 'cashier_dashboard.view';

  static const orderView = 'order.view';
  static const orderCreate = 'order.create';
  static const orderUpdate = 'order.update';
  static const orderDelete = 'order.delete';
  static const orderAccept = 'order.accept';
  static const orderReject = 'order.reject';
  static const orderStart = 'order.start';
  static const orderComplete = 'order.complete';
  static const orderWeigh = 'order.weigh';
  static const orderPaymentManage = 'order.payment.manage';
  static const orderPrint = 'order.print';
  static const orderWaNotificationPreview = 'order.wa_notification.preview';
  static const orderWaNotificationSend = 'order.wa_notification.send';

  static const customerView = 'customer.view';
  static const customerCreate = 'customer.create';
  static const customerUpdate = 'customer.update';
  static const customerDelete = 'customer.delete';
  static const customerSubscriptionView = 'customer_subscription.view';
  static const customerSubscriptionCreate = 'customer_subscription.create';
  static const customerSubscriptionUpdate = 'customer_subscription.update';
  static const customerSubscriptionDelete = 'customer_subscription.delete';
  static const membershipPlanView = 'membership_plan.view';
  static const membershipContractView = 'membership_contract.view';
  static const membershipContractCreate = 'membership_contract.create';

  static const categoryView = 'category.view';
  static const categoryCreate = 'category.create';
  static const categoryUpdate = 'category.update';
  static const categoryDelete = 'category.delete';

  static const laundryServiceView = 'laundry_service.view';
  static const laundryServiceCreate = 'laundry_service.create';
  static const laundryServiceUpdate = 'laundry_service.update';
  static const laundryServiceDelete = 'laundry_service.delete';

  static const servicePackageView = 'service_package.view';
  static const unitView = 'unit.view';
  static const accountView = 'account.view';
  static const depositView = 'deposit.view';
  static const depositCreate = 'deposit.create';
  static const depositUpdate = 'deposit.update';
  static const pettyCashView = 'petty_cash.view';
  static const pettyCashCreate = 'petty_cash.create';
  static const pettyCashUpdate = 'petty_cash.update';
  static const expenseView = 'expense.view';
  static const expenseCreate = 'expense.create';
  static const expenseUpdate = 'expense.update';
  static const expenseDelete = 'expense.delete';

  static const orderPermissions = <String>[
    cashierDashboardView,
    orderView,
    orderCreate,
    orderUpdate,
    orderDelete,
    orderAccept,
    orderReject,
    orderStart,
    orderComplete,
    orderWeigh,
    orderPaymentManage,
    orderPrint,
    orderWaNotificationPreview,
    orderWaNotificationSend,
  ];

  static const customerPermissions = <String>[
    customerView,
    customerCreate,
    customerUpdate,
    customerDelete,
    customerSubscriptionView,
    customerSubscriptionCreate,
    customerSubscriptionUpdate,
    customerSubscriptionDelete,
    membershipPlanView,
    membershipContractView,
    membershipContractCreate,
  ];

  static const categoryPermissions = <String>[
    categoryView,
    categoryCreate,
    categoryUpdate,
    categoryDelete,
  ];

  static const laundryServicePermissions = <String>[
    laundryServiceView,
    laundryServiceCreate,
    laundryServiceUpdate,
    laundryServiceDelete,
  ];

  static const serviceSetupPermissions = <String>[servicePackageView, unitView];

  static const financePermissions = <String>[
    accountView,
    depositView,
    depositCreate,
    depositUpdate,
    pettyCashView,
    pettyCashCreate,
    pettyCashUpdate,
    expenseView,
    expenseCreate,
    expenseUpdate,
    expenseDelete,
  ];

  static const operationalPermissions = <String>[
    ...orderPermissions,
    ...customerPermissions,
    ...categoryPermissions,
    ...laundryServicePermissions,
    ...serviceSetupPermissions,
    ...financePermissions,
  ];
}
