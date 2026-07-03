import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'core/navigation/customer_push_notification_coordinator.dart';
import 'core/router/app_router.dart';
import 'core/services/customer_notification_service.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/auth/presentation/bloc/customer_auth_cubit.dart';
import 'features/auth/presentation/bloc/customer_auth_state.dart';
import 'features/onboarding/presentation/bloc/onboarding_cubit.dart';
import 'features/onboarding/presentation/providers/onboarding_provider.dart';
import 'features/outlet/presentation/providers/outlet_provider.dart';
import 'features/outlet/presentation/bloc/outlet_cubit.dart';
import 'features/order/presentation/bloc/cart_cubit.dart';
import 'features/customer_address/presentation/bloc/customer_address_action_cubit.dart';
import 'features/customer_address/presentation/bloc/customer_address_list_cubit.dart';
import 'features/customer_address/presentation/providers/customer_address_provider.dart';
import 'features/home/presentation/bloc/home_dashboard_cubit.dart';
import 'features/home/presentation/providers/home_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id_ID', null);
  await initializeDateFormatting('en_US', null);
  FirebaseMessaging.onBackgroundMessage(
    customerFirebaseMessagingBackgroundHandler,
  );
  await Firebase.initializeApp();
  await CustomerNotificationService.instance.initialize();
  await CustomerNotificationService.instance.requestPermission();
  CustomerPushNotificationCoordinator.instance.initialize();

  final dependencies = await _initializeDependencies();

  runApp(MainApp(dependencies: dependencies));
}

Future<AppDependencies> _initializeDependencies() async {
  final endpoints = ApiEndpoints.customer();

  final storage = SecureStorageProvider.create();
  final tokenStorage = SecureTokenStorage(storage);

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

  final authCubit = await CustomerAuthProvider.createAuthCubitWithDependencies(
    dio,
    endpoints,
  );
  final homeDashboardCubit = HomeProvider.createCubit(dio, endpoints);
  final customerOutletCubit = OutletProvider.createCubit(dio, endpoints);
  final customerAddressListCubit = CustomerAddressProvider.createListCubit(
    dio,
    endpoints,
  );
  final customerAddressActionCubit = CustomerAddressProvider.createActionCubit(
    dio,
    endpoints,
  );
  final onboardingCubit = await OnboardingProvider.create();
  final cartCubit = CartCubit();

  final appRouter = AppRouter(
    authCubit: authCubit,
    onboardingCubit: onboardingCubit,
    dio: dio,
    endpoints: endpoints,
  );
  CustomerPushNotificationCoordinator.instance.attachRouter(appRouter.router);

  return AppDependencies(
    dio: dio,
    authCubit: authCubit,
    onboardingCubit: onboardingCubit,
    homeDashboardCubit: homeDashboardCubit,
    customerOutletCubit: customerOutletCubit,
    customerAddressListCubit: customerAddressListCubit,
    customerAddressActionCubit: customerAddressActionCubit,
    cartCubit: cartCubit,
    appRouter: appRouter,
  );
}

class AppDependencies {
  final Dio dio;
  final CustomerAuthCubit authCubit;
  final OnboardingCubit onboardingCubit;
  final HomeDashboardCubit homeDashboardCubit;
  final OutletCubit customerOutletCubit;
  final CustomerAddressListCubit customerAddressListCubit;
  final CustomerAddressActionCubit customerAddressActionCubit;
  final CartCubit cartCubit;
  final AppRouter appRouter;

  AppDependencies({
    required this.dio,
    required this.authCubit,
    required this.onboardingCubit,
    required this.homeDashboardCubit,
    required this.customerOutletCubit,
    required this.customerAddressListCubit,
    required this.customerAddressActionCubit,
    required this.cartCubit,
    required this.appRouter,
  });
}

class MainApp extends StatelessWidget {
  final AppDependencies dependencies;

  const MainApp({super.key, required this.dependencies});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<Dio>.value(value: dependencies.dio),
        RepositoryProvider<ApiEndpoints>.value(
          value: dependencies.appRouter.endpoints,
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<CustomerAuthCubit>.value(value: dependencies.authCubit),
          BlocProvider<OnboardingCubit>.value(
            value: dependencies.onboardingCubit,
          ),
          BlocProvider<HomeDashboardCubit>.value(
            value: dependencies.homeDashboardCubit,
          ),
          BlocProvider<OutletCubit>.value(
            value: dependencies.customerOutletCubit,
          ),
          BlocProvider<CustomerAddressListCubit>.value(
            value: dependencies.customerAddressListCubit,
          ),
          BlocProvider<CustomerAddressActionCubit>.value(
            value: dependencies.customerAddressActionCubit,
          ),
          BlocProvider<CartCubit>.value(value: dependencies.cartCubit),
        ],
        child: BlocListener<CustomerAuthCubit, CustomerAuthState>(
          listener: (context, state) {
            if (state is CustomerAuthAuthenticated) {
              CustomerPushNotificationCoordinator.instance.onAuthReady();
            } else if (state is CustomerAuthUnauthenticated) {
              CustomerPushNotificationCoordinator.instance.onLogout();
            }
          },
          child: MaterialApp.router(
            title: 'WashWallet Customer',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            themeMode: ThemeMode.system,
            routerConfig: dependencies.appRouter.router,
          ),
        ),
      ),
    );
  }
}
