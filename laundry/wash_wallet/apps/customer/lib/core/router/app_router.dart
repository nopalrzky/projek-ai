import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../features/outlet/presentation/providers/outlet_provider.dart';
import '../../features/outlet/presentation/screens/index_outlet_screen.dart';
import '../presentation/screens/main_navigation_screen.dart';
import '../../features/auth/presentation/bloc/customer_auth_cubit.dart';
import '../../features/auth/presentation/bloc/customer_auth_state.dart';
import '../../features/auth/presentation/screens/login_password_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/otp_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/customer_address/domain/entities/customer_address.dart';
import '../../features/customer_address/presentation/providers/customer_address_provider.dart';
import '../../features/customer_address/presentation/screens/create_customer_address_screen.dart';
import '../../features/customer_address/presentation/screens/edit_customer_address_screen.dart';
import '../../features/customer_address/presentation/screens/index_customer_address_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/order/presentation/screens/index_order_screen.dart';
import '../../features/onboarding/presentation/bloc/onboarding_cubit.dart';
import '../../features/onboarding/presentation/bloc/onboarding_state.dart';
import '../../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../../features/onboarding/presentation/screens/splash_screen.dart';
import '../../features/onboarding/presentation/screens/welcome_screen.dart';
import '../../features/outlet/presentation/screens/show_outlet_screen.dart';
import '../../features/outlet/presentation/screens/outlet_info_screen.dart';
import '../../features/outlet/presentation/bloc/outlet_cubit.dart';
import '../../features/order_review/presentation/providers/order_review_provider.dart';
import '../../features/order/presentation/bloc/cart_cubit.dart';
import '../../features/profile/presentation/screens/edit_profile_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/set_password_screen.dart';
import '../../features/promo/presentation/screens/index_promo_screen.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../features/order/presentation/providers/order_provider.dart';
import '../../features/order/presentation/screens/order_summary_screen.dart';
import '../../features/order/presentation/screens/order_success_screen.dart';
import '../../features/courier_schedule/presentation/providers/courier_schedule_provider.dart';
import '../../features/topup/presentation/providers/topup_providers.dart';
import '../../features/topup/presentation/screens/index_topup_screen.dart';
import '../../features/topup/presentation/screens/create_topup_screen.dart';
import '../../features/topup/presentation/screens/show_topup_screen.dart';
import '../../features/topup/presentation/screens/topup_payment_screen.dart';
import '../../features/order/presentation/screens/order_invoice_screen.dart';
import '../../features/order/presentation/screens/delivery_schedule_screen.dart';
import '../../features/order/presentation/screens/show_order_screen.dart';
import '../../features/courier_pricing/presentation/providers/courier_pricing_provider.dart';
import '../../features/discovery/presentation/providers/discovery_provider.dart';
import '../../features/discovery/presentation/providers/location_picker_provider.dart';
import '../../features/discovery/presentation/screens/discovery_screen.dart';
import '../../features/search/presentation/screens/search_screen.dart';

class AppRouter {
  final CustomerAuthCubit authCubit;
  final OnboardingCubit onboardingCubit;
  final Dio dio;
  final ApiEndpoints endpoints;

  AppRouter({
    required this.authCubit,
    required this.onboardingCubit,
    required this.dio,
    required this.endpoints,
  });

  late final GoRouter router = GoRouter(
    initialLocation: '/splash',
    refreshListenable: GoRouterRefreshStreams([
      authCubit.stream,
      onboardingCubit.stream,
    ]),
    redirect: (context, state) {
      final authState = authCubit.state;
      final onboardingState = onboardingCubit.state;
      final authRoutes = [
        '/login',
        '/register-start',
        '/otp',
        '/register',
        '/login-password',
      ];
      final preAuthRoutes = ['/splash', '/onboarding', '/welcome'];
      final isGoingToAuth = authRoutes.contains(state.matchedLocation);
      final isGoingToPreAuth = preAuthRoutes.contains(state.matchedLocation);

      if (state.matchedLocation == '/splash') {
        if (authState is CustomerAuthInitial ||
            authState is CustomerAuthLoading ||
            onboardingState is OnboardingInitial ||
            onboardingState is OnboardingChecking) {
          return null;
        }

        if (authState is CustomerAuthAuthenticated) {
          return '/home';
        }

        if (authState is CustomerAuthOtpRequested) {
          return '/otp';
        }

        if (authState is CustomerAuthOtpVerifiedNewUser) {
          return '/register';
        }

        if (onboardingState is OnboardingRequired) {
          return '/onboarding';
        }

        if (onboardingState is OnboardingAlreadyCompleted ||
            onboardingState is OnboardingCompleted) {
          return '/welcome';
        }

        return null;
      }

      if (authState is CustomerAuthInitial ||
          authState is CustomerAuthLoading) {
        return null;
      }

      if (authState is CustomerAuthAuthenticated) {
        if (!isGoingToAuth && !isGoingToPreAuth) {
          return null;
        }
        return '/home';
      }

      if (onboardingState is OnboardingRequired &&
          state.matchedLocation != '/onboarding') {
        return '/onboarding';
      }

      if ((onboardingState is OnboardingAlreadyCompleted ||
              onboardingState is OnboardingCompleted) &&
          isGoingToPreAuth &&
          state.matchedLocation != '/welcome') {
        return '/welcome';
      }

      if (authState is CustomerAuthUnauthenticated &&
          !isGoingToAuth &&
          !isGoingToPreAuth) {
        return '/welcome';
      }

      if (authState is CustomerAuthOtpRequested &&
          state.matchedLocation != '/otp') {
        return '/otp';
      }

      if (authState is CustomerAuthOtpVerifiedNewUser &&
          state.matchedLocation != '/register') {
        return '/register';
      }

      if (authState is CustomerAuthUnauthenticated &&
          state.matchedLocation == '/splash') {
        return '/welcome';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register-start',
        builder: (context, state) =>
            const LoginScreen(initialIntent: 'register'),
      ),
      GoRoute(path: '/otp', builder: (context, state) => const OtpScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) {
          final phone = state.extra as String? ?? '';
          return RegisterScreen(phone: phone);
        },
      ),
      GoRoute(
        path: '/login-password',
        builder: (context, state) {
          final phone = state.extra as String?;
          return LoginPasswordScreen(phone: phone);
        },
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainNavigationScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/outlets',
                builder: (context, state) {
                  return MultiBlocProvider(
                    providers: [
                      BlocProvider(
                        create: (context) =>
                            OutletProvider.createOutletCubit(dio, endpoints),
                      ),
                      BlocProvider(
                        create: (context) =>
                            CustomerAddressProvider.createListCubit(
                              dio,
                              endpoints,
                            )..getAll(),
                      ),
                    ],
                    child: const IndexOutletScreen(),
                  );
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/promos',
                builder: (context, state) => const IndexPromoScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/orders',
                builder: (context, state) {
                  return BlocProvider(
                    create: (context) =>
                        OrderProvider.orderCubit(dio, endpoints),
                    child: const IndexOrderScreen(),
                  );
                },
                routes: [
                  GoRoute(
                    path: ':id/invoice',
                    builder: (context, state) {
                      final id = int.parse(state.pathParameters['id']!);
                      return BlocProvider(
                        create: (context) =>
                            OrderProvider.orderCubit(dio, endpoints)
                              ..getById(id),
                        child: OrderInvoiceScreen(orderId: id),
                      );
                    },
                  ),
                  GoRoute(
                    path: ':id/schedule-delivery',
                    builder: (context, state) {
                      final id = int.parse(state.pathParameters['id']!);
                      return MultiBlocProvider(
                        providers: [
                          BlocProvider(
                            create: (context) =>
                                OrderProvider.orderCubit(dio, endpoints)
                                  ..getById(id),
                          ),
                          BlocProvider(
                            create: (context) =>
                                CourierScheduleProvider.createCubit(
                                  dio,
                                  endpoints,
                                ),
                          ),
                          BlocProvider(
                            create: (context) =>
                                CourierPricingProvider.createCubit(
                                  dio,
                                  endpoints,
                                ),
                          ),
                        ],
                        child: DeliveryScheduleScreen(orderId: id),
                      );
                    },
                  ),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) {
                      final id = int.parse(state.pathParameters['id']!);
                      return BlocProvider(
                        create: (context) =>
                            OrderProvider.orderCubit(dio, endpoints)
                              ..getById(id),
                        child: ShowOrderScreen(orderId: id),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
                routes: [
                  GoRoute(
                    path: 'password',
                    builder: (context, state) => const SetPasswordScreen(),
                  ),
                  GoRoute(
                    path: 'edit',
                    builder: (context, state) => const EditProfileScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/customer-addresses',
        builder: (context, state) {
          return BlocProvider(
            create: (_) =>
                CustomerAddressProvider.createListCubit(dio, endpoints)
                  ..getAll(),
            child: const IndexCustomerAddressScreen(),
          );
        },
      ),
      GoRoute(
        path: '/customer-addresses/create',
        builder: (context, state) {
          return BlocProvider(
            create: (_) =>
                CustomerAddressProvider.createActionCubit(dio, endpoints),
            child: const CreateCustomerAddressScreen(),
          );
        },
      ),
      GoRoute(
        path: '/customer-addresses/edit/:id',
        builder: (context, state) {
          final address = state.extra;
          if (address is! CustomerAddress) {
            return const Scaffold(
              body: Center(child: Text('Data alamat tidak valid')),
            );
          }

          return BlocProvider(
            create: (_) =>
                CustomerAddressProvider.createActionCubit(dio, endpoints),
            child: EditCustomerAddressScreen(address: address),
          );
        },
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/discovery',
        builder: (context, state) {
          final query = state.uri.queryParameters['query'];
          return MultiBlocProvider(
            providers: [
              BlocProvider(
                create: (_) => DiscoveryProvider.createCubit(dio, endpoints),
              ),
              BlocProvider(
                create: (_) =>
                    LocationPickerProvider.createCubit(dio, endpoints)..init(),
              ),
            ],
            child: DiscoveryScreen(initialQuery: query),
          );
        },
      ),
      GoRoute(
        path: '/outlets/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          final serviceId = int.tryParse(
            state.uri.queryParameters['serviceId'] ?? '',
          );
          final openService =
              state.uri.queryParameters['openService'] == 'true' &&
              serviceId != null;
          final extra = state.extra is Map<String, dynamic>
              ? state.extra as Map<String, dynamic>
              : null;
          final latitude = extra?['latitude'] as double?;
          final longitude = extra?['longitude'] as double?;
          return MultiBlocProvider(
            providers: [
              BlocProvider(
                create: (context) =>
                    OutletProvider.createOutletCubit(dio, endpoints),
              ),
            ],
            child: ShowOutletScreen(
              outletId: id,
              initialServiceId: serviceId,
              openServiceOnLoad: openService,
              latitude: latitude,
              longitude: longitude,
            ),
          );
        },
        routes: [
          GoRoute(
            path: 'info',
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              final cubit = state.extra as OutletCubit?;

              if (cubit != null) {
                return MultiBlocProvider(
                  providers: [
                    BlocProvider.value(value: cubit),
                    BlocProvider(
                      create: (_) =>
                          OrderReviewProvider.createCubit(dio, endpoints),
                    ),
                  ],
                  child: OutletInfoScreen(outletId: id),
                );
              }

              return MultiBlocProvider(
                providers: [
                  BlocProvider(
                    create: (context) =>
                        OutletProvider.createOutletCubit(dio, endpoints)
                          ..getById(id: id),
                  ),
                  BlocProvider(
                    create: (_) =>
                        OrderReviewProvider.createCubit(dio, endpoints),
                  ),
                ],
                child: OutletInfoScreen(outletId: id),
              );
            },
          ),
        ],
      ),
      GoRoute(
        path: '/order-summary',
        builder: (context, state) {
          final cartState = context.read<CartCubit>().state;
          final outletId = cartState.activeOutletId;

          if (outletId == null) {
            return const Scaffold(
              body: Center(child: Text('Data outlet tidak ditemukan')),
            );
          }

          return MultiBlocProvider(
            providers: [
              BlocProvider(
                create: (context) => OrderProvider.orderCubit(dio, endpoints),
              ),
              BlocProvider(
                create: (context) =>
                    CustomerAddressProvider.createListCubit(dio, endpoints)
                      ..getAll(),
              ),
              BlocProvider(
                create: (context) =>
                    CourierScheduleProvider.createCubit(dio, endpoints),
              ),
              BlocProvider(
                create: (context) =>
                    OutletProvider.createOutletCubit(dio, endpoints)
                      ..getById(id: outletId),
              ),
              BlocProvider(
                create: (context) =>
                    CourierPricingProvider.createCubit(dio, endpoints),
              ),
            ],
            child: OrderSummaryScreen(outletId: outletId),
          );
        },
      ),
      GoRoute(
        path: '/order-success',
        builder: (context, state) {
          final order = state.extra;
          if (order is! Order) {
            return const Scaffold(
              body: Center(child: Text('Data pesanan tidak valid')),
            );
          }
          return OrderSuccessScreen(order: order);
        },
      ),
      ShellRoute(
        builder: (context, state, child) {
          return MultiRepositoryProvider(
            providers: TopupProviders.repositoryProviders,
            child: MultiBlocProvider(
              providers: TopupProviders.blocProviders,
              child: child,
            ),
          );
        },
        routes: [
          GoRoute(
            path: '/topup',
            builder: (context, state) => const IndexTopupScreen(),
            routes: [
              GoRoute(
                path: 'create',
                builder: (context, state) => const CreateTopupScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return ShowTopupScreen(topupId: id);
                },
              ),
              GoRoute(
                path: 'payment/:id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return TopupPaymentScreen(topupId: id);
                },
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

class GoRouterRefreshStreams extends ChangeNotifier {
  GoRouterRefreshStreams(List<Stream<dynamic>> streams) {
    notifyListeners();
    _subscriptions = streams
        .map(
          (stream) => stream.asBroadcastStream().listen(
            (dynamic _) => notifyListeners(),
          ),
        )
        .toList();
  }

  late final List<StreamSubscription<dynamic>> _subscriptions;

  @override
  void dispose() {
    for (final subscription in _subscriptions) {
      subscription.cancel();
    }
    super.dispose();
  }
}
