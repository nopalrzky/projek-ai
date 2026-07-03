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
import '../../features/membership_plan/presentation/screens/show_membership_plan_screen.dart';
import '../../features/unit/presentation/screens/index_units_screen.dart';

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
import '../../features/auth/presentation/screens/pin_setup_prompt_screen.dart';
import '../../features/auth/presentation/screens/access_denied_screen.dart';
import '../../features/auth/presentation/screens/switch_employee_screen.dart';
import '../../features/auth/presentation/screens/pin_entry_screen.dart';
import '../../features/no_permission/presentation/screens/cashier_no_permission_screen.dart';
import '../../features/category/presentation/screens/index_categories_screen.dart';
import '../../features/customer/presentation/screens/index_customers_screen.dart';
import '../../features/laundry_service/presentation/screens/index_laundry_services_screen.dart';
import '../../features/order/presentation/screens/index_orders_screen.dart';
import '../../features/order/presentation/screens/show_order_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../../features/setting/presentation/screens/index_setting_screen.dart';
import '../../features/setting/presentation/screens/printer_setting_screen.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/profile/presentation/index_profile_screen.dart';
import '../../features/setting/presentation/screens/pin_security_setting_screen.dart';
import '../../features/setting/presentation/screens/reset_pin_verify_screen.dart';
import '../../features/setting/presentation/screens/reset_pin_new_screen.dart';
import '../../features/auth/presentation/screens/confirm_pin_screen.dart';
import '../../features/auth/presentation/screens/re_auth_pin_screen.dart';
import '../../features/finances/presentation/screens/index_finances_screen.dart';
import '../../features/deposit/presentation/screens/index_deposit_screen.dart';
import '../../features/petty_cash/presentation/screens/index_petty_cash_screen.dart';
import '../../features/expense/presentation/screens/index_expense_screen.dart';

import '../navigation/main_shell_screen.dart';
import '../permissions/cashier_permission_checker.dart';
import '../permissions/cashier_permissions.dart';
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
  final _managementNavigatorKey = GlobalKey<NavigatorState>(
    debugLabel: 'managementNav',
  );
  final _settingsNavigatorKey = GlobalKey<NavigatorState>(
    debugLabel: 'settingsNav',
  );

  AppRouter({
    required AuthCubit authCubit,
    required this.navigatorKey,
    this.splashScreen,
  }) : _authCubit = authCubit;

  int? _resolveOutletId() {
    return _resolveEmployee()?.outletId;
  }

  AuthEmployee? _resolveEmployee() {
    final authState = _authCubit.state;
    if (authState is Authenticated) return authState.employee;
    if (authState is AuthenticatedStale) return authState.employee;
    return null;
  }

  String _noPermissionPath(String context) {
    final encodedContext = Uri.encodeQueryComponent(context);
    return '/no-permission?context=$encodedContext';
  }

  String? _guardCashierRoute(String currentLocation, AuthEmployee employee) {
    if (currentLocation == '/no-permission') {
      return null;
    }

    if (currentLocation == '/orders' ||
        currentLocation.startsWith('/orders/')) {
      if (currentLocation == '/orders' ||
          RegExp(r'^/orders/\d+$').hasMatch(currentLocation)) {
        if (!employee.hasPermission(CashierPermissions.orderView)) {
          return _noPermissionPath('Transaksi');
        }
      }

      if (currentLocation.contains('/create') &&
          !employee.hasPermission(CashierPermissions.orderCreate)) {
        return _noPermissionPath('buat order');
      }
    }

    if (currentLocation == '/customers' ||
        currentLocation.startsWith('/customers/')) {
      if (currentLocation == '/customers' ||
          RegExp(r'^/customers/\d+$').hasMatch(currentLocation)) {
        if (!employee.hasPermission(CashierPermissions.customerView)) {
          return _noPermissionPath('Pelanggan');
        }
      }
      if (currentLocation == '/customers/create' &&
          !employee.hasPermission(CashierPermissions.customerCreate)) {
        return _noPermissionPath('buat customer');
      }
      if (currentLocation.endsWith('/edit') &&
          !employee.hasPermission(CashierPermissions.customerUpdate)) {
        return _noPermissionPath('edit customer');
      }
    }

    if (currentLocation == '/categories' ||
        currentLocation.startsWith('/categories/')) {
      if (currentLocation == '/categories' ||
          RegExp(r'^/categories/\d+$').hasMatch(currentLocation)) {
        if (!employee.hasPermission(CashierPermissions.categoryView)) {
          return _noPermissionPath('Kategori');
        }
      }
      if (currentLocation == '/categories/create' &&
          !employee.hasPermission(CashierPermissions.categoryCreate)) {
        return _noPermissionPath('buat kategori');
      }
      if (currentLocation.endsWith('/edit') &&
          !employee.hasPermission(CashierPermissions.categoryUpdate)) {
        return _noPermissionPath('edit kategori');
      }
    }

    if (currentLocation == '/laundry-services' ||
        currentLocation.startsWith('/laundry-services/')) {
      if (currentLocation == '/laundry-services' ||
          RegExp(r'^/laundry-services/\d+$').hasMatch(currentLocation)) {
        if (!employee.hasPermission(CashierPermissions.laundryServiceView)) {
          return _noPermissionPath('Layanan Laundry');
        }
      }
      if (currentLocation == '/laundry-services/create' &&
          !employee.hasPermission(CashierPermissions.laundryServiceCreate)) {
        return _noPermissionPath('buat layanan laundry');
      }
      if (currentLocation.endsWith('/edit') &&
          !employee.hasPermission(CashierPermissions.laundryServiceUpdate)) {
        return _noPermissionPath('edit layanan laundry');
      }
    }

    if (currentLocation.startsWith('/service-packages') &&
        !employee.hasPermission(CashierPermissions.servicePackageView)) {
      return _noPermissionPath('Paket Layanan');
    }

    if (currentLocation.startsWith('/membership-plans') &&
        !employee.hasPermission(CashierPermissions.membershipPlanView)) {
      return _noPermissionPath('Membership');
    }

    if (currentLocation.startsWith('/deposits') &&
        !employee.hasPermission(CashierPermissions.depositView)) {
      return _noPermissionPath('Setoran');
    }

    if (currentLocation.startsWith('/petty-cashes') &&
        !employee.hasPermission(CashierPermissions.pettyCashView)) {
      return _noPermissionPath('Petty Cash');
    }

    if (currentLocation.startsWith('/expenses') &&
        !employee.hasPermission(CashierPermissions.expenseView)) {
      return _noPermissionPath('Pengeluaran Outlet');
    }

    if (currentLocation.startsWith('/finances') &&
        !CashierPermissionChecker.canViewFinances(employee)) {
      return _noPermissionPath('Dana & Keuangan');
    }

    return null;
  }

  String? _resolveRouteFromState(AuthState authState) {
    if (authState is Authenticated || authState is AuthenticatedStale) {
      return '/home';
    }
    if (authState is AuthPinSetupPrompt) return '/pin-setup-prompt';
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

      if (authState is AuthPinSetupPrompt) {
        if (currentLocation == '/setup-pin') return null;
        if (currentLocation != '/pin-setup-prompt') return '/pin-setup-prompt';
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
        final employee = authState.employee;
        final guardedLocation = _guardCashierRoute(currentLocation, employee);
        if (guardedLocation != null) {
          return guardedLocation;
        }

        if (currentLocation == '/login' ||
            currentLocation == '/onboarding' ||
            currentLocation == '/setup-pin' ||
            currentLocation == '/pin-setup-prompt' ||
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
          currentLocation.startsWith('/categories') ||
          currentLocation.startsWith('/laundry-services') ||
          currentLocation.startsWith('/service-packages') ||
          currentLocation.startsWith('/membership-plans') ||
          currentLocation.startsWith('/settings') ||
          currentLocation.startsWith('/finances') ||
          currentLocation.startsWith('/outlets') ||
          currentLocation.startsWith('/profile') ||
          currentLocation.startsWith('/printer') ||
          currentLocation.startsWith('/pin-security') ||
          currentLocation.startsWith('/deposits') ||
          currentLocation.startsWith('/petty-cashes') ||
          currentLocation.startsWith('/expenses') ||
          currentLocation.startsWith('/units');

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
        if (currentLocation == '/onboarding') {
          return '/login';
        }
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
        path: '/pin-setup-prompt',
        pageBuilder: (context, state) =>
            state.fadePage(const PinSetupPromptScreen()),
      ),
      GoRoute(
        path: '/access-denied',
        pageBuilder: (context, state) =>
            state.fadePage(const AccessDeniedScreen()),
      ),
      GoRoute(
        path: '/no-permission',
        pageBuilder: (context, state) {
          final featureContext =
              state.uri.queryParameters['context'] ?? 'fitur ini';
          return state.fadePage(
            CashierNoPermissionScreen(featureContext: featureContext),
          );
        },
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
              GoRoute(
                path: '/deposits',
                pageBuilder: (context, state) {
                  final outletId = _resolveOutletId();
                  if (outletId != null) {
                    return state.slidePage(
                      IndexDepositScreen(outletId: outletId),
                    );
                  }
                  return state.slidePage(const _LoadingScaffold());
                },
              ),
              GoRoute(
                path: '/petty-cashes',
                pageBuilder: (context, state) =>
                    state.slidePage(const IndexPettyCashScreen()),
              ),
              GoRoute(
                path: '/expenses',
                pageBuilder: (context, state) {
                  final outletId = _resolveOutletId();
                  if (outletId != null) {
                    return state.slidePage(
                      IndexExpenseScreen(outletId: outletId),
                    );
                  }
                  return state.slidePage(const _LoadingScaffold());
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
            navigatorKey: _managementNavigatorKey,
            routes: [
              GoRoute(
                path: '/customers',
                pageBuilder: (context, state) {
                  final outletId = _resolveOutletId();
                  if (outletId != null) {
                    return state.slidePage(
                      IndexCustomersScreen(outletId: outletId),
                    );
                  }
                  return state.slidePage(const _LoadingScaffold());
                },
                routes: [
                  GoRoute(
                    path: 'create',
                    pageBuilder: (context, state) {
                      final outletId = _resolveOutletId();
                      if (outletId != null) {
                        return state.slidePage(
                          CreateCustomerScreen(outletId: outletId),
                        );
                      }
                      return state.slidePage(const _LoadingScaffold());
                    },
                  ),
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      final id = int.tryParse(state.pathParameters['id'] ?? '');
                      if (id != null) {
                        return state.slidePage(
                          ShowCustomerScreen(customerId: id),
                        );
                      }
                      return state.slidePage(const _NotFoundScaffold());
                    },
                  ),
                  GoRoute(
                    path: ':id/edit',
                    pageBuilder: (context, state) {
                      final item = state.extra;
                      if (item is Customer) {
                        return state.slidePage(
                          EditCustomerScreen(customer: item),
                        );
                      }
                      return state.slidePage(const _EditErrorScaffold());
                    },
                  ),
                ],
              ),
              GoRoute(
                path: '/categories',
                pageBuilder: (context, state) {
                  final outletId = _resolveOutletId();
                  if (outletId != null) {
                    return state.slidePage(
                      IndexCategoriesScreen(outletId: outletId),
                    );
                  }
                  return state.slidePage(const _LoadingScaffold());
                },
                routes: [
                  GoRoute(
                    path: 'create',
                    pageBuilder: (context, state) {
                      final outletId = _resolveOutletId();
                      if (outletId != null) {
                        return state.slidePage(
                          CreateCategoryScreen(outletId: outletId),
                        );
                      }
                      return state.slidePage(const _LoadingScaffold());
                    },
                  ),
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      final id = int.tryParse(state.pathParameters['id'] ?? '');
                      if (id != null) {
                        return state.slidePage(
                          ShowCategoryScreen(categoryId: id),
                        );
                      }
                      return state.slidePage(const _NotFoundScaffold());
                    },
                  ),
                  GoRoute(
                    path: ':id/edit',
                    pageBuilder: (context, state) {
                      final item = state.extra;
                      if (item is Category) {
                        return state.slidePage(
                          EditCategoryScreen(category: item),
                        );
                      }
                      return state.slidePage(const _EditErrorScaffold());
                    },
                  ),
                ],
              ),
              GoRoute(
                path: '/laundry-services',
                pageBuilder: (context, state) {
                  final outletId = _resolveOutletId();
                  if (outletId != null) {
                    return state.slidePage(
                      IndexLaundryServicesScreen(outletId: outletId),
                    );
                  }
                  return state.slidePage(const _LoadingScaffold());
                },
                routes: [
                  GoRoute(
                    path: 'create',
                    pageBuilder: (context, state) {
                      final outletId = _resolveOutletId();
                      if (outletId != null) {
                        return state.slidePage(
                          CreateLaundryServiceScreen(outletId: outletId),
                        );
                      }
                      return state.slidePage(const _LoadingScaffold());
                    },
                  ),
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      final id = int.tryParse(state.pathParameters['id'] ?? '');
                      if (id != null) {
                        return state.slidePage(
                          ShowLaundryServiceScreen(serviceId: id),
                        );
                      }
                      return state.slidePage(const _NotFoundScaffold());
                    },
                  ),
                  GoRoute(
                    path: ':id/edit',
                    pageBuilder: (context, state) {
                      final item = state.extra;
                      if (item is LaundryService) {
                        return state.slidePage(
                          EditLaundryServiceScreen(service: item),
                        );
                      }
                      return state.slidePage(const _EditErrorScaffold());
                    },
                  ),
                ],
              ),
              GoRoute(
                path: '/service-packages',
                pageBuilder: (context, state) {
                  final outletId = _resolveOutletId();
                  if (outletId != null) {
                    return state.slidePage(
                      IndexServicePackagesScreen(outletId: outletId),
                    );
                  }
                  return state.slidePage(const _LoadingScaffold());
                },
                routes: [
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      final id = int.tryParse(state.pathParameters['id'] ?? '');
                      if (id != null) {
                        return state.slidePage(
                          ShowServicePackageScreen(packageId: id),
                        );
                      }
                      return state.slidePage(const _NotFoundScaffold());
                    },
                  ),
                ],
              ),
              GoRoute(
                path: '/membership-plans',
                pageBuilder: (context, state) {
                  final outletId = _resolveOutletId();
                  if (outletId != null) {
                    return state.slidePage(
                      IndexMembershipPlanScreen(outletId: outletId),
                    );
                  }
                  return state.slidePage(const _LoadingScaffold());
                },
                routes: [
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      final id = int.tryParse(state.pathParameters['id'] ?? '');
                      if (id != null) {
                        return state.slidePage(
                          ShowMembershipPlanScreen(planId: id),
                        );
                      }
                      return state.slidePage(const _NotFoundScaffold());
                    },
                  ),
                ],
              ),
              GoRoute(
                path: '/units',
                pageBuilder: (context, state) =>
                    state.slidePage(const IndexUnitsScreen()),
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
                ],
              ),
              GoRoute(
                path: '/profile',
                pageBuilder: (context, state) =>
                    state.slidePage(const IndexProfileScreen()),
                routes: [
                  GoRoute(
                    path: 'edit',
                    pageBuilder: (context, state) =>
                        state.slidePage(const EditProfileScreen()),
                  ),
                ],
              ),
              GoRoute(
                path: '/printer',
                pageBuilder: (context, state) =>
                    state.slidePage(const PrinterSettingScreen()),
              ),
              GoRoute(
                path: '/pin-security',
                pageBuilder: (context, state) =>
                    state.slidePage(const PinSecuritySettingScreen()),
              ),
            ],
          ),
        ],
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

class _EditErrorScaffold extends StatelessWidget {
  const _EditErrorScaffold();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tidak dapat membuka halaman')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red),
            SizedBox(height: 16),
            Text(
              'Data tidak tersedia untuk mode edit.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 8),
            Text('Silakan kembali dan coba lagi.', textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _LoadingScaffold extends StatelessWidget {
  const _LoadingScaffold();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}

class _NotFoundScaffold extends StatelessWidget {
  const _NotFoundScaffold();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: const Center(child: Text('Halaman tidak ditemukan')),
    );
  }
}
