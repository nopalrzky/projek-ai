import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'core/navigation/production_push_notification_coordinator.dart';
import 'core/router/app_router.dart';
import 'core/services/production_notification_service.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/auth/presentation/bloc/auth_cubit.dart';
import 'features/auth/presentation/bloc/auth_state.dart';
import 'features/home/presentation/providers/home_provider.dart';
import 'features/home/presentation/bloc/home_cubit.dart';
import 'features/order/presentation/providers/order_provider.dart';
import 'features/order/presentation/bloc/order_cubit.dart';
import 'features/order_item/presentation/providers/order_item_provider.dart';
import 'features/order_item/presentation/bloc/order_item_cubit.dart';
import 'features/order_item_process/presentation/providers/order_item_process_provider.dart';
import 'features/order_item_process/presentation/bloc/order_item_process_cubit.dart';
import 'features/print/presentation/providers/print_provider.dart';
import 'features/print/presentation/bloc/print_cubit.dart';
import 'features/wa_notification/presentation/bloc/wa_notification_cubit.dart';
import 'features/wa_notification/presentation/providers/wa_notification_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Hive.initFlutter();
  await initializeDateFormatting('id_ID', null);
  FirebaseMessaging.onBackgroundMessage(
    productionFirebaseMessagingBackgroundHandler,
  );
  try {
    await Firebase.initializeApp();
  } catch (_) {}
  ProductionPushNotificationCoordinator.instance.initialize();

  final dependencies = await _initializeDependencies();

  runApp(MainApp(dependencies: dependencies));
}

Future<AppDependencies> _initializeDependencies() async {
  final storage = SecureStorageProvider.create();
  final tokenStorage = SecureTokenStorage(storage);
  final sharedPreferences = await SharedPreferences.getInstance();

  final endpoints = ApiEndpoints.production();

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
  await ProductionNotificationService.instance.initialize(
    dio: dio,
    endpoints: endpoints,
  );

  final authCubit = await AuthProvider.createAuthCubitWithDependencies(
    dio,
    endpoints,
  );
  final homeCubit = HomeProvider.createCubit(dio, endpoints);
  final orderCubit = OrderProvider.createCubit(dio, endpoints);
  final orderItemCubit = OrderItemProvider.createCubit(dio, endpoints);
  final orderItemProcessCubit = OrderItemProcessProvider.createCubit(
    dio,
    endpoints,
  );
  final printCubit = PrintProvider.createCubit(dio, endpoints);
  final waNotificationCubit = WaNotificationProvider.createCubit(
    dio,
    endpoints,
  );
  final printerService = ThermalPrinterService();
  printerService.setSelectedPrinterAddress(
    sharedPreferences.getString('default_printer_mac'),
  );

  final appRouter = AppRouter(authCubit: authCubit);
  ProductionPushNotificationCoordinator.instance.attachRouter(appRouter.router);

  return AppDependencies(
    dio: dio,
    onboardingService: onboardingService,
    authCubit: authCubit,
    homeCubit: homeCubit,
    orderCubit: orderCubit,
    orderItemCubit: orderItemCubit,
    orderItemProcessCubit: orderItemProcessCubit,
    printCubit: printCubit,
    waNotificationCubit: waNotificationCubit,
    printerService: printerService,
    appRouter: appRouter,
  );
}

class AppDependencies {
  final Dio dio;
  final OnboardingService onboardingService;
  final AuthCubit authCubit;
  final HomeCubit homeCubit;
  final OrderCubit orderCubit;
  final OrderItemCubit orderItemCubit;
  final OrderItemProcessCubit orderItemProcessCubit;
  final PrintCubit printCubit;
  final WaNotificationCubit waNotificationCubit;
  final ThermalPrinterService printerService;
  final AppRouter appRouter;

  AppDependencies({
    required this.dio,
    required this.onboardingService,
    required this.authCubit,
    required this.homeCubit,
    required this.orderCubit,
    required this.orderItemCubit,
    required this.orderItemProcessCubit,
    required this.printCubit,
    required this.waNotificationCubit,
    required this.printerService,
    required this.appRouter,
  });
}

class MainApp extends StatelessWidget {
  final AppDependencies dependencies;

  const MainApp({super.key, required this.dependencies});

  @override
  Widget build(BuildContext context) {
    final scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

    return RepositoryProvider<ThermalPrinterService>.value(
      value: dependencies.printerService,
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthCubit>.value(value: dependencies.authCubit),
          BlocProvider<HomeCubit>.value(value: dependencies.homeCubit),
          BlocProvider<OrderCubit>.value(value: dependencies.orderCubit),
          BlocProvider<OrderItemCubit>.value(
            value: dependencies.orderItemCubit,
          ),
          BlocProvider<OrderItemProcessCubit>.value(
            value: dependencies.orderItemProcessCubit,
          ),
          BlocProvider<PrintCubit>.value(value: dependencies.printCubit),
          BlocProvider<WaNotificationCubit>.value(
            value: dependencies.waNotificationCubit,
          ),
        ],
        child: BlocListener<AuthCubit, AuthState>(
          listener: (context, state) {
            if (state is Authenticated) {
              ProductionPushNotificationCoordinator.instance.onAuthReady();
            } else if (state is Unauthenticated) {
              ProductionPushNotificationCoordinator.instance.onLogout();
            }
          },
          child: MaterialApp.router(
            title: 'WashWallet Production',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            themeMode: ThemeMode.system,
            routerConfig: dependencies.appRouter.router,
            scaffoldMessengerKey: scaffoldMessengerKey,
          ),
        ),
      ),
    );
  }
}
