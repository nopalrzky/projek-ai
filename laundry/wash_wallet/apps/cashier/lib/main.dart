import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:wash_wallet_cashier/features/account/presentation/bloc/account_cubit.dart';
import 'package:wash_wallet_cashier/features/account/presentation/providers/account_providers.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'core/router/app_router.dart';
import 'core/navigation/push_notification_coordinator.dart';
import 'core/services/notification_service.dart';
import 'core/services/app_lifecycle_observer.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/auth/presentation/bloc/auth_cubit.dart';
import 'features/auth/presentation/bloc/auth_state.dart';
import 'features/deposit/presentation/bloc/deposit_cubit.dart';
import 'features/deposit/presentation/providers/deposit_provider.dart';
import 'features/expense/presentation/bloc/expense_cubit.dart';
import 'features/expense/presentation/providers/expense_provider.dart';
import 'features/petty_cash/presentation/bloc/petty_cash_cubit.dart';
import 'features/petty_cash/presentation/providers/petty_cash_provider.dart';
import 'features/home/presentation/providers/home_provider.dart';
import 'features/home/presentation/bloc/home_cubit.dart';
import 'features/category/presentation/providers/category_provider.dart';
import 'features/category/presentation/bloc/category_cubit.dart';
import 'features/customer/presentation/providers/customer_provider.dart';
import 'features/customer/presentation/bloc/customer_cubit.dart';
import 'features/employee/presentation/providers/employee_provider.dart';
import 'features/employee/presentation/bloc/employee_cubit.dart';
import 'features/laundry_service/presentation/providers/laundry_service_provider.dart';
import 'features/laundry_service/presentation/bloc/laundry_service_cubit.dart';
import 'features/membership_contract/presentation/providers/membership_contract_provider.dart';
import 'features/membership_contract/presentation/bloc/membership_contract_cubit.dart';
import 'features/membership_plan/presentation/providers/membership_plan_provider.dart';
import 'features/membership_plan/presentation/bloc/membership_plan_cubit.dart';
import 'features/customer_subscription/presentation/providers/customer_subscriptions_provider.dart';
import 'features/customer_subscription/presentation/bloc/customer_subscription_cubit.dart';
import 'features/service_package/presentation/providers/service_package_provider.dart';
import 'features/service_package/presentation/bloc/service_package_cubit.dart';
import 'features/order/presentation/providers/order_provider.dart';
import 'features/order/presentation/bloc/order_cubit.dart';
import 'features/print/presentation/providers/print_provider.dart';
import 'features/print/presentation/bloc/print_cubit.dart';
import 'features/wa_notification/presentation/providers/wa_notification_provider.dart';
import 'features/wa_notification/presentation/bloc/wa_notification_cubit.dart';
import 'features/unit/presentation/providers/unit_provider.dart';
import 'features/unit/presentation/bloc/unit_cubit.dart';
import 'features/setting/presentation/bloc/printer_setting_cubit.dart';
import 'features/setting/presentation/providers/printer_setting_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(
      cashierFirebaseMessagingBackgroundHandler,
    );
    PushNotificationCoordinator.instance.initialize();
    await PushNotificationCoordinator.instance.checkInitialMessage();
  } catch (_) {}

  await Hive.initFlutter();
  await initializeDateFormatting('id_ID', null);

  final dependencies = await _initializeDependencies();

  runApp(MainApp(dependencies: dependencies));
}

Future<AppDependencies> _initializeDependencies() async {
  final storage = SecureStorageProvider.create();
  final tokenStorage = SecureTokenStorage(storage);
  final sharedPreferences = await SharedPreferences.getInstance();

  final endpoints = ApiEndpoints.cashier();

  final onboardingService = OnboardingService(sharedPreferences);

  final dioConfig = DioConfig(
    baseUrl: const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://10.0.2.2:8000/api',
    ),
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 60),
    sendTimeout: const Duration(seconds: 30),
  );

  final dioProvider = DioProvider(
    config: dioConfig,
    interceptors: [AuthInterceptor(tokenStorage), LoggingInterceptor()],
  );
  final dio = dioProvider.getDio();
  await NotificationService.instance.initialize(dio: dio, endpoints: endpoints);

  final authCubit = await AuthProvider.createAuthCubitWithDependencies(
    dio,
    endpoints,
    notificationService: NotificationService.instance,
    storage: storage,
  );
  final accountCubit = AccountProvider.createCubit(dio, endpoints);
  final categoryCubit = CategoryProvider.createCubit(dio, endpoints);
  final customerCubit = CustomerProvider.createCubit(dio, endpoints);
  final depositCubit = DepositProvider.createCubit(dio, endpoints);
  final pettyCashCubit = PettyCashProvider.createCubit(dio, endpoints);
  final employeeCubit = EmployeeProvider.createCubit(dio, endpoints);
  final expenseCubit = ExpenseProvider.createCubit(dio, endpoints);
  final homeCubit = HomeProvider.createCubit(dio, endpoints);
  final laundryServiceCubit = LaundryServiceProvider.createCubit(
    dio,
    endpoints,
  );
  final membershipContractCubit = MembershipContractProvider.createCubit(
    dio,
    endpoints,
  );
  final membershipPlanCubit = MembershipPlanProvider.createCubit(
    dio,
    endpoints,
  );
  final customerSubscriptionCubit = CustomerSubscriptionProvider.createCubit(
    dio,
    endpoints,
  );
  final servicePackageCubit = ServicePackageProvider.createCubit(
    dio,
    endpoints,
  );
  final orderCubit = OrderProvider.createCubit(
    dio,
    endpoints,
    sharedPreferences,
  );
  final waNotificationCubit = WaNotificationProvider.createCubit(
    dio,
    endpoints,
  );
  final printCubit = PrintProvider.createCubit(dio, endpoints);
  final unitCubit = UnitProvider.createCubit(dio, endpoints);
  final printerService = ThermalPrinterService();
  final printerSettingCubit = PrinterSettingProvider.createCubit(
    printerService,
    sharedPreferences,
  );

  final appRouter = AppRouter(
    authCubit: authCubit,
    navigatorKey: PushNotificationCoordinator.instance.navigatorKey,
  );

  return AppDependencies(
    dio: dio,
    onboardingService: onboardingService,
    accountCubit: accountCubit,
    authCubit: authCubit,
    categoryCubit: categoryCubit,
    customerCubit: customerCubit,
    depositCubit: depositCubit,
    pettyCashCubit: pettyCashCubit,
    employeeCubit: employeeCubit,
    expenseCubit: expenseCubit,
    laundryServiceCubit: laundryServiceCubit,
    membershipContractCubit: membershipContractCubit,
    membershipPlanCubit: membershipPlanCubit,
    customerSubscriptionCubit: customerSubscriptionCubit,
    servicePackageCubit: servicePackageCubit,
    homeCubit: homeCubit,
    orderCubit: orderCubit,
    waNotificationCubit: waNotificationCubit,
    printCubit: printCubit,
    unitCubit: unitCubit,
    printerSettingCubit: printerSettingCubit,
    printerService: printerService,
    appRouter: appRouter,
  );
}

class AppDependencies {
  final Dio dio;
  final OnboardingService onboardingService;
  final AccountCubit accountCubit;
  final AuthCubit authCubit;
  final CategoryCubit categoryCubit;
  final CustomerCubit customerCubit;
  final DepositCubit depositCubit;
  final PettyCashCubit pettyCashCubit;
  final EmployeeCubit employeeCubit;
  final ExpenseCubit expenseCubit;
  final HomeCubit homeCubit;
  final MembershipContractCubit membershipContractCubit;
  final MembershipPlanCubit membershipPlanCubit;
  final CustomerSubscriptionCubit customerSubscriptionCubit;
  final ServicePackageCubit servicePackageCubit;
  final LaundryServiceCubit laundryServiceCubit;
  final OrderCubit orderCubit;
  final WaNotificationCubit waNotificationCubit;
  final PrintCubit printCubit;
  final UnitCubit unitCubit;
  final PrinterSettingCubit printerSettingCubit;
  final ThermalPrinterService printerService;
  final AppRouter appRouter;

  AppDependencies({
    required this.dio,
    required this.onboardingService,
    required this.accountCubit,
    required this.authCubit,
    required this.categoryCubit,
    required this.customerCubit,
    required this.customerSubscriptionCubit,
    required this.depositCubit,
    required this.pettyCashCubit,
    required this.employeeCubit,
    required this.expenseCubit,
    required this.membershipContractCubit,
    required this.membershipPlanCubit,
    required this.servicePackageCubit,
    required this.homeCubit,
    required this.laundryServiceCubit,
    required this.orderCubit,
    required this.waNotificationCubit,
    required this.printCubit,
    required this.unitCubit,
    required this.printerSettingCubit,
    required this.printerService,
    required this.appRouter,
  });
}

class MainApp extends StatefulWidget {
  final AppDependencies dependencies;

  const MainApp({super.key, required this.dependencies});

  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> with WidgetsBindingObserver {
  late final AppLifecycleObserver _lifecycleObserver;

  @override
  void initState() {
    super.initState();
    _lifecycleObserver = AppLifecycleObserver(
      authCubit: widget.dependencies.authCubit,
    );
    WidgetsBinding.instance.addObserver(_lifecycleObserver);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(_lifecycleObserver);
    widget.dependencies.accountCubit.close();
    widget.dependencies.authCubit.close();
    widget.dependencies.categoryCubit.close();
    widget.dependencies.customerCubit.close();
    widget.dependencies.depositCubit.close();
    widget.dependencies.pettyCashCubit.close();
    widget.dependencies.employeeCubit.close();
    widget.dependencies.expenseCubit.close();
    widget.dependencies.homeCubit.close();
    widget.dependencies.membershipContractCubit.close();
    widget.dependencies.membershipPlanCubit.close();
    widget.dependencies.customerSubscriptionCubit.close();
    widget.dependencies.servicePackageCubit.close();
    widget.dependencies.laundryServiceCubit.close();
    widget.dependencies.orderCubit.close();
    widget.dependencies.waNotificationCubit.close();
    widget.dependencies.printCubit.close();
    widget.dependencies.unitCubit.close();
    widget.dependencies.printerSettingCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

    return RepositoryProvider<ThermalPrinterService>.value(
      value: widget.dependencies.printerService,
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AccountCubit>.value(value: widget.dependencies.accountCubit),
          BlocProvider<AuthCubit>.value(value: widget.dependencies.authCubit),
          BlocProvider<CategoryCubit>.value(value: widget.dependencies.categoryCubit),
          BlocProvider<CustomerCubit>.value(value: widget.dependencies.customerCubit),
          BlocProvider<DepositCubit>.value(value: widget.dependencies.depositCubit),
          BlocProvider<PettyCashCubit>.value(
            value: widget.dependencies.pettyCashCubit,
          ),
          BlocProvider<EmployeeCubit>.value(value: widget.dependencies.employeeCubit),
          BlocProvider<ExpenseCubit>.value(value: widget.dependencies.expenseCubit),
          BlocProvider<HomeCubit>.value(value: widget.dependencies.homeCubit),
          BlocProvider<LaundryServiceCubit>.value(
            value: widget.dependencies.laundryServiceCubit,
          ),
          BlocProvider<MembershipContractCubit>.value(
            value: widget.dependencies.membershipContractCubit,
          ),
          BlocProvider<MembershipPlanCubit>.value(
            value: widget.dependencies.membershipPlanCubit,
          ),
          BlocProvider<CustomerSubscriptionCubit>.value(
            value: widget.dependencies.customerSubscriptionCubit,
          ),
          BlocProvider<ServicePackageCubit>.value(
            value: widget.dependencies.servicePackageCubit,
          ),
          BlocProvider<OrderCubit>.value(value: widget.dependencies.orderCubit),
          BlocProvider<WaNotificationCubit>.value(
            value: widget.dependencies.waNotificationCubit,
          ),
          BlocProvider<PrintCubit>.value(value: widget.dependencies.printCubit),
          BlocProvider<UnitCubit>.value(value: widget.dependencies.unitCubit),
          BlocProvider<PrinterSettingCubit>.value(
            value: widget.dependencies.printerSettingCubit,
          ),
        ],
        child: BlocListener<AuthCubit, AuthState>(
          listener: (context, state) {
            if (state is Authenticated) {
              PushNotificationCoordinator.instance.onAuthReady(
                outletId: state.employee.outletId,
              );
            } else if (state is Unauthenticated) {
              PushNotificationCoordinator.instance.onLogout();
            }
          },
          child: MaterialApp.router(
            title: 'WashWallet Cashier',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            themeMode: ThemeMode.system,
            routerConfig: widget.dependencies.appRouter.router,
            scaffoldMessengerKey: scaffoldMessengerKey,
          ),
        ),
      ),
    );
  }
}
