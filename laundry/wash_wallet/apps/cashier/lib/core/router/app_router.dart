import 'dart:async';
import '../../features/category/presentation/screens/create_category_screen.dart';
import '../../features/category/presentation/screens/show_category_screen.dart';
import '../../features/category/presentation/screens/edit_category_screen.dart';

import '../../features/laundry_service/presentation/screens/create_laundry_service_screen.dart';
import '../../features/laundry_service/presentation/screens/show_laundry_service_screen.dart';
import '../../features/laundry_service/presentation/screens/edit_laundry_service_screen.dart';

import '../../features/service_package/presentation/screens/show_service_package_screen.dart';

import '../../features/service_package/presentation/screens/index_service_packages_screen.dart';
import '../../features/membership_plan/presentation/screens/index_membership_plan_screen.dart';

import '../../features/customer/presentation/screens/create_customer_screen.dart';
import '../../features/customer/presentation/screens/show_customer_screen.dart';
import '../../features/customer/presentation/screens/edit_customer_screen.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_cashier/features/splash/screens/splash_screen.dart';
import '../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/setup_pin_screen.dart';
import '../../features/auth/presentation/screens/access_denied_screen.dart';
import '../../features/auth/presentation/screens/switch_employee_screen.dart';
import '../../features/auth/presentation/screens/pin_entry_screen.dart';
import '../../features/category/presentation/screens/index_categories_screen.dart';
import '../../features/customer/presentation/screens/index_customers_screen.dart';
import '../../features/laundry_service/presentation/screens/index_laundry_services_screen.dart';
import '../../features/order/presentation/screens/index_orders_screen.dart';
import '../../features/order/presentation/screens/show_order_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../../features/setting/presentation/screens/index_setting_screen.dart';
import '../../features/setting/presentation/screens/printer_setting_screen.dart';
import '../../features/setting/presentation/screens/profile_setting_screen.dart';
import '../../features/setting/presentation/screens/pin_security_setting_screen.dart';
import '../../features/setting/presentation/screens/reset_pin_verify_screen.dart';
import '../../features/setting/presentation/screens/reset_pin_new_screen.dart';
import '../../features/auth/presentation/screens/confirm_pin_screen.dart';
import '../../features/auth/presentation/screens/re_auth_pin_screen.dart';
import '../../features/finances/presentation/screens/index_finances_screen.dart';
import '../../features/setting/presentation/screens/setup_outlet_setting_screen.dart';
import '../navigation/main_shell_screen.dart';
import 'route_transitions.dart';

class AppRouter {
  final AuthCubit _authCubit;
  final GlobalKey<NavigatorState> navigatorKey;
  final Widget? splashScreen;

  final _homeNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'homeNav');
  final _financesNavigatorKey = GlobalKey<NavigatorState>(
    debugLabel: 'financesNav',
  );
  final _ordersNavigatorKey = GlobalKey<NavigatorState>(
    debugLabel: 'ordersNav',
  );
  final _settingsNavigatorKey = GlobalKey<NavigatorState>(
    debugLabel: 'settingsNav',
  );

  AppRouter({
    required AuthCubit authCubit,
    required this.navigatorKey,
    this.splashScreen,
  }) : _authCubit = authCubit;

  String? _resolveRouteFromState(AuthState authState) {
    if (authState is Authenticated || authState is AuthenticatedStale) {
      return '/home';
    }
    if (authState is AuthSetupPinRequired) return '/setup-pin';
    if (authState is AuthAccessDenied) return '/access-denied';
    if (authState is AuthRequiresOnboarding) return '/onboarding';
    if (authState is AuthRequiresSwitchEmployee) return '/switch-employee';
    if (authState is Unauthenticated || authState is AuthFailureState) {
      return '/login';
    }
    return null;
  }

  late final GoRouter router = GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: '/splash',
    refreshListenable: GoRouterRefreshStream(_authCubit.stream),
    redirect: (context, state) {
      final authState = _authCubit.state;
      final currentLocation = state.matchedLocation;

      if (currentLocation == '/splash') {
        if (authState is AuthInitial || authState is AuthLoading) {
          return null;
        }
        return _resolveRouteFromState(authState);
      }

      if (authState is SwitchPinVerifying || authState is SwitchPinFailure) {
        return null;
      }

      if (authState is AuthSetupPinRequired) {
        if (currentLocation != '/setup-pin') return '/setup-pin';
        return null;
      }

      if (authState is AuthAccessDenied) {
        if (currentLocation != '/access-denied') return '/access-denied';
        return null;
      }

      if (authState is AuthenticatedStale) {
        if (currentLocation != '/re-auth-pin') {
          final from = Uri.encodeComponent(state.uri.toString());
          return '/re-auth-pin?from=$from';
        }
        return null;
      }

      if (authState is Authenticated) {
        if (currentLocation == '/login' ||
            currentLocation == '/onboarding' ||
            currentLocation == '/setup-pin' ||
            currentLocation == '/access-denied' ||
            currentLocation == '/re-auth-pin') {
          final from = state.uri.queryParameters['from'];
          return from != null ? Uri.decodeComponent(from) : '/home';
        }
        return null;
      }

      final isProtectedRoute =
          currentLocation == '/home' ||
          currentLocation.startsWith('/orders') ||
          currentLocation.startsWith('/customers') ||
          currentLocation.startsWith('/settings') ||
          currentLocation.startsWith('/finances') ||
          currentLocation.startsWith('/outlets');

      if (authState is AuthRequiresOnboarding) {
        if (currentLocation != '/onboarding') return '/onboarding';
        return null;
      }

      if (authState is AuthRequiresSwitchEmployee) {
        if (currentLocation != '/switch-employee' &&
            currentLocation != '/login') {
          return '/switch-employee';
        }
        return null;
      }

      if (authState is Unauthenticated || authState is AuthFailureState) {
        if (isProtectedRoute) {
          final from = Uri.encodeComponent(state.uri.toString());
          return '/login?from=$from';
        }
        return null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        pageBuilder: (context, state) =>
            state.fadePage(splashScreen ?? const SplashScreen()),
      ),
      GoRoute(
        path: '/onboarding',
        pageBuilder: (context, state) =>
            state.fadePage(const OnboardingScreen()),
      ),
      GoRoute(
        path: '/login',
        pageBuilder: (context, state) => state.fadePage(const LoginScreen()),
      ),
      GoRoute(
        path: '/setup-pin',
        pageBuilder: (context, state) => state.fadePage(const SetupPinScreen()),
      ),
      GoRoute(
        path: '/access-denied',
        pageBuilder: (context, state) =>
            state.fadePage(const AccessDeniedScreen()),
      ),
      GoRoute(
        path: '/confirm-pin',
        pageBuilder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return state.fadePage(
            ConfirmPinScreen(initialPin: extra['initialPin'] as String? ?? ''),
          );
        },
      ),
      GoRoute(
        path: '/re-auth-pin',
        pageBuilder: (context, state) =>
            state.fadePage(const ReAuthPinScreen()),
      ),
      GoRoute(
        path: '/switch-employee',
        pageBuilder: (context, state) =>
            state.fadePage(const SwitchEmployeeScreen()),
      ),
      GoRoute(
        path: '/pin-entry',
        pageBuilder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return state.fadePage(
            PinEntryScreen(
              employeeId: extra['employeeId'] as int? ?? 0,
              username: extra['username'] as String? ?? '',
              name: extra['name'] as String? ?? '',
            ),
          );
        },
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShellScreen(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            navigatorKey: _homeNavigatorKey,
            routes: [
              GoRoute(
                path: '/home',
                pageBuilder: (context, state) =>
                    const NoTransitionPage(child: HomeScreen()),
              ),
            ],
          ),

          StatefulShellBranch(
            navigatorKey: _financesNavigatorKey,
            routes: [
              GoRoute(
                path: '/finances',
                pageBuilder: (context, state) {
                  final authState = _authCubit.state;
                  if (authState is Authenticated) {
                    return NoTransitionPage(
                      child: IndexFinancesScreen(
                        outletId: authState.employee.outletId,
                      ),
                    );
                  } else if (authState is AuthenticatedStale) {
                    return NoTransitionPage(
                      child: IndexFinancesScreen(
                        outletId: authState.employee.outletId,
                      ),
                    );
                  }
                  return const NoTransitionPage(
                    child: Scaffold(
                      body: Center(child: CircularProgressIndicator()),
                    ),
                  );
                },
              ),
            ],
          ),

          StatefulShellBranch(
            navigatorKey: _ordersNavigatorKey,
            routes: [
              GoRoute(
                path: '/orders',
                pageBuilder: (context, state) {
                  final authState = _authCubit.state;
                  final statusFilter = state.uri.queryParameters['status'];
                  if (authState is Authenticated) {
                    return NoTransitionPage(
                      child: IndexOrdersScreen(
                        outletId: authState.employee.outletId,
                        initialStatusFilter: statusFilter,
                      ),
                    );
                  } else if (authState is AuthenticatedStale) {
                    return NoTransitionPage(
                      child: IndexOrdersScreen(
                        outletId: authState.employee.outletId,
                        initialStatusFilter: statusFilter,
                      ),
                    );
                  }
                  return const NoTransitionPage(
                    child: Scaffold(
                      body: Center(child: CircularProgressIndicator()),
                    ),
                  );
                },
                routes: [
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      final orderIdStr = state.pathParameters['id'];
                      final orderId = int.tryParse(orderIdStr ?? '');
                      final authState = _authCubit.state;
                      int? outletId;

                      if (authState is Authenticated) {
                        outletId = authState.employee.outletId;
                      } else if (authState is AuthenticatedStale) {
                        outletId = authState.employee.outletId;
                      }

                      if (orderId != null && outletId != null) {
                        return state.slidePage(
                          ShowOrderScreen(orderId: orderId, outletId: outletId),
                        );
                      }
                      return state.slidePage(
                        const Scaffold(
                          body: Center(child: Text('Order tidak valid')),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),

          StatefulShellBranch(
            navigatorKey: _settingsNavigatorKey,
            routes: [
              GoRoute(
                path: '/settings',
                pageBuilder: (context, state) =>
                    const NoTransitionPage(child: IndexSettingScreen()),
                routes: [
                  GoRoute(
                    path: 'printer',
                    pageBuilder: (context, state) =>
                        state.slidePage(const PrinterSettingScreen()),
                  ),
                  GoRoute(
                    path: 'profile',
                    pageBuilder: (context, state) =>
                        state.slidePage(const ProfileSettingScreen()),
                  ),
                  GoRoute(
                    path: 'pin-security',
                    pageBuilder: (context, state) =>
                        state.slidePage(const PinSecuritySettingScreen()),
                  ),
                  GoRoute(
                    path: 'pin-setup',
                    pageBuilder: (context, state) =>
                        state.slidePage(const SetupPinScreen()),
                  ),
                  GoRoute(
                    path: 'confirm-pin',
                    pageBuilder: (context, state) {
                      final extra = state.extra as Map<String, dynamic>? ?? {};
                      return state.slidePage(
                        ConfirmPinScreen(
                          initialPin: extra['initialPin'] as String? ?? '',
                        ),
                      );
                    },
                  ),
                  GoRoute(
                    path: 'pin-reset-verify',
                    pageBuilder: (context, state) =>
                        state.slidePage(const ResetPinVerifyScreen()),
                  ),
                  GoRoute(
                    path: 'pin-reset-new',
                    pageBuilder: (context, state) {
                      final extra = state.extra as Map<String, dynamic>? ?? {};
                      final currentPin = extra['currentPin'] as String? ?? '';
                      return state.slidePage(
                        ResetPinNewScreen(currentPin: currentPin),
                      );
                    },
                  ),
                  GoRoute(
                    path: 'setup-outlet',
                    pageBuilder: (context, state) =>
                        state.slidePage(const SetupOutletSettingScreen()),
                    routes: [
                      GoRoute(
                        path: 'customers',
                        pageBuilder: (context, state) {
                          final authState = _authCubit.state;
                          if (authState is Authenticated) {
                            return state.slidePage(
                              IndexCustomersScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          } else if (authState is AuthenticatedStale) {
                            return state.slidePage(
                              IndexCustomersScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          }
                          return state.slidePage(
                            const Scaffold(
                              body: Center(child: CircularProgressIndicator()),
                            ),
                          );
                        },
                        routes: [
                          GoRoute(
                            path: 'create',
                            pageBuilder: (context, state) {
                              final authState = _authCubit.state;
                              int? outletId;
                              if (authState is Authenticated) {
                                outletId = authState.employee.outletId;
                              } else if (authState is AuthenticatedStale) {
                                outletId = authState.employee.outletId;
                              }
                              if (outletId != null) {
                                return state.slidePage(
                                  CreateCustomerScreen(outletId: outletId),
                                );
                              }
                              return state.slidePage(
                                const Scaffold(
                                  body: Center(
                                    child: CircularProgressIndicator(),
                                  ),
                                ),
                              );
                            },
                          ),
                          GoRoute(
                            path: ':id',
                            pageBuilder: (context, state) {
                              final id = int.tryParse(
                                state.pathParameters['id'] ?? '',
                              );
                              if (id != null) {
                                return state.slidePage(
                                  ShowCustomerScreen(customerId: id),
                                );
                              }
                              return state.slidePage(
                                const Scaffold(
                                  body: Center(child: Text('Not found')),
                                ),
                              );
                            },
                          ),
                          GoRoute(
                            path: ':id/edit',
                            pageBuilder: (context, state) {
                              final item = state.extra as Customer;
                              return state.slidePage(
                                EditCustomerScreen(customer: item),
                              );
                            },
                          ),
                        ],
                      ),
                      GoRoute(
                        path: 'categories',
                        pageBuilder: (context, state) {
                          final authState = _authCubit.state;
                          if (authState is Authenticated) {
                            return state.slidePage(
                              IndexCategoriesScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          } else if (authState is AuthenticatedStale) {
                            return state.slidePage(
                              IndexCategoriesScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          }
                          return state.slidePage(
                            const Scaffold(
                              body: Center(child: CircularProgressIndicator()),
                            ),
                          );
                        },
                        routes: [
                          GoRoute(
                            path: 'create',
                            pageBuilder: (context, state) {
                              final authState = _authCubit.state;
                              int? outletId;
                              if (authState is Authenticated) {
                                outletId = authState.employee.outletId;
                              } else if (authState is AuthenticatedStale) {
                                outletId = authState.employee.outletId;
                              }
                              if (outletId != null) {
                                return state.slidePage(
                                  CreateCategoryScreen(outletId: outletId),
                                );
                              }
                              return state.slidePage(
                                const Scaffold(
                                  body: Center(
                                    child: CircularProgressIndicator(),
                                  ),
                                ),
                              );
                            },
                          ),
                          GoRoute(
                            path: ':id',
                            pageBuilder: (context, state) {
                              final id = int.tryParse(
                                state.pathParameters['id'] ?? '',
                              );
                              if (id != null) {
                                return state.slidePage(
                                  ShowCategoryScreen(categoryId: id),
                                );
                              }
                              return state.slidePage(
                                const Scaffold(
                                  body: Center(child: Text('Not found')),
                                ),
                              );
                            },
                          ),
                          GoRoute(
                            path: ':id/edit',
                            pageBuilder: (context, state) {
                              final item = state.extra as Category;
                              return state.slidePage(
                                EditCategoryScreen(category: item),
                              );
                            },
                          ),
                        ],
                      ),
                      GoRoute(
                        path: 'laundry-services',
                        pageBuilder: (context, state) {
                          final authState = _authCubit.state;
                          if (authState is Authenticated) {
                            return state.slidePage(
                              IndexLaundryServicesScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          } else if (authState is AuthenticatedStale) {
                            return state.slidePage(
                              IndexLaundryServicesScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          }
                          return state.slidePage(
                            const Scaffold(
                              body: Center(child: CircularProgressIndicator()),
                            ),
                          );
                        },
                        routes: [
                          GoRoute(
                            path: 'create',
                            pageBuilder: (context, state) {
                              final authState = _authCubit.state;
                              int? outletId;
                              if (authState is Authenticated) {
                                outletId = authState.employee.outletId;
                              } else if (authState is AuthenticatedStale) {
                                outletId = authState.employee.outletId;
                              }
                              if (outletId != null) {
                                return state.slidePage(
                                  CreateLaundryServiceScreen(
                                    outletId: outletId,
                                  ),
                                );
                              }
                              return state.slidePage(
                                const Scaffold(
                                  body: Center(
                                    child: CircularProgressIndicator(),
                                  ),
                                ),
                              );
                            },
                          ),
                          GoRoute(
                            path: ':id',
                            pageBuilder: (context, state) {
                              final id = int.tryParse(
                                state.pathParameters['id'] ?? '',
                              );
                              if (id != null) {
                                return state.slidePage(
                                  ShowLaundryServiceScreen(serviceId: id),
                                );
                              }
                              return state.slidePage(
                                const Scaffold(
                                  body: Center(child: Text('Not found')),
                                ),
                              );
                            },
                          ),
                          GoRoute(
                            path: ':id/edit',
                            pageBuilder: (context, state) {
                              final item = state.extra as LaundryService;
                              return state.slidePage(
                                EditLaundryServiceScreen(service: item),
                              );
                            },
                          ),
                        ],
                      ),
                      GoRoute(
                        path: 'service-packages',
                        pageBuilder: (context, state) {
                          final authState = _authCubit.state;
                          if (authState is Authenticated) {
                            return state.slidePage(
                              IndexServicePackagesScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          } else if (authState is AuthenticatedStale) {
                            return state.slidePage(
                              IndexServicePackagesScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          }
                          return state.slidePage(
                            const Scaffold(
                              body: Center(child: CircularProgressIndicator()),
                            ),
                          );
                        },
                        routes: [
                          GoRoute(
                            path: ':id',
                            pageBuilder: (context, state) {
                              final id = int.tryParse(
                                state.pathParameters['id'] ?? '',
                              );
                              if (id != null) {
                                return state.slidePage(
                                  ShowServicePackageScreen(packageId: id),
                                );
                              }
                              return state.slidePage(
                                const Scaffold(
                                  body: Center(child: Text('Not found')),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                      GoRoute(
                        path: 'membership-plans',
                        pageBuilder: (context, state) {
                          final authState = _authCubit.state;
                          if (authState is Authenticated) {
                            return state.slidePage(
                              IndexMembershipPlanScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          } else if (authState is AuthenticatedStale) {
                            return state.slidePage(
                              IndexMembershipPlanScreen(
                                outletId: authState.employee.outletId,
                              ),
                            );
                          }
                          return state.slidePage(
                            const Scaffold(
                              body: Center(child: CircularProgressIndicator()),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/customers',
        redirect: (context, state) => '/settings/setup-outlet/customers',
      ),
      GoRoute(
        path: '/categories',
        redirect: (context, state) => '/settings/setup-outlet/categories',
      ),
      GoRoute(
        path: '/laundry-services',
        redirect: (context, state) => '/settings/setup-outlet/laundry-services',
      ),
      GoRoute(
        path: '/service-packages',
        redirect: (context, state) => '/settings/setup-outlet/service-packages',
      ),
      GoRoute(
        path: '/membership-plans',
        redirect: (context, state) => '/settings/setup-outlet/membership-plans',
      ),
      GoRoute(path: '/dashboard', redirect: (context, state) => '/home'),
    ],
  );
}

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen(
      (dynamic _) => notifyListeners(),
    );
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
