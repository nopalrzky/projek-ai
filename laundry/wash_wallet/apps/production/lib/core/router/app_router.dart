import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/bloc/auth_cubit.dart';
import '../../features/auth/presentation/bloc/auth_state.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/pin_setup_prompt_screen.dart';
import '../../features/auth/presentation/screens/setup_pin_screen.dart';
import '../../features/auth/presentation/screens/confirm_pin_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/no_permission/presentation/screens/no_permission_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../../features/order/presentation/screens/index_order_screen.dart';
import '../../features/order/presentation/screens/show_order_screen.dart';
import '../../features/order/presentation/screens/pickup_schedule_screen.dart';
import '../../features/order_item/presentation/screens/show_order_item_screen.dart';
import '../../features/profile/presentation/screens/profile_setting_screen.dart';
import '../../features/splash/presentation/screens/splash_screen.dart';
import '../navigation/production_shell_screen.dart';
import '../utils/permission_checker.dart';
import 'route_transitions.dart';

class AppRouter {
  final AuthCubit _authCubit;

  AppRouter({required AuthCubit authCubit}) : _authCubit = authCubit;

  late final GoRouter router = GoRouter(
    initialLocation: '/splash',
    refreshListenable: GoRouterRefreshStream(_authCubit.stream),
    redirect: (context, state) {
      final authState = _authCubit.state;
      final currentLocation = state.matchedLocation;
      final permissionContext = state.uri.queryParameters['context'] ?? 'app';

      if (currentLocation == '/splash') {
        return null;
      }

      if (authState is AuthPinSetupPrompt) {
        if (currentLocation != '/pin-setup-prompt') return '/pin-setup-prompt';
        return null;
      }

      if (authState is Authenticated) {
        final employee = authState.employee;

        if (currentLocation == '/login' ||
            currentLocation == '/onboarding' ||
            currentLocation == '/pin-setup-prompt' ||
            currentLocation == '/setup-pin' ||
            currentLocation == '/confirm-pin') {
          return '/home';
        }

        if (!PermissionChecker.hasAnyAppAccess(employee)) {
          if (currentLocation == '/no-permission') {
            return null;
          }
          return '/no-permission?context=app';
        }

        if (currentLocation == '/no-permission') {
          final shouldStay = switch (permissionContext) {
            'production' => !PermissionChecker.hasProductionAccess(employee),
            'courier' => !PermissionChecker.hasCourierAccess(employee),
            _ => false,
          };

          return shouldStay ? null : '/home';
        }

        if (_isProductionRoute(currentLocation) &&
            !PermissionChecker.hasProductionAccess(employee)) {
          return '/no-permission?context=production';
        }

        if (currentLocation.startsWith('/pickup-schedule') &&
            !PermissionChecker.hasCourierAccess(employee)) {
          return '/no-permission?context=courier';
        }

        return null;
      }

      if (authState is Unauthenticated || authState is AuthFailureState) {
        if (currentLocation == '/home' ||
            currentLocation.startsWith('/orders') ||
            currentLocation.startsWith('/order-items') ||
            currentLocation.startsWith('/pickup-schedule') ||
            currentLocation.startsWith('/profile') ||
            currentLocation == '/no-permission' ||
            currentLocation == '/pin-setup-prompt' ||
            currentLocation == '/setup-pin' ||
            currentLocation == '/confirm-pin') {
          return '/login';
        }
        return null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        pageBuilder: (context, state) => state.fadePage(const SplashScreen()),
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
        path: '/pin-setup-prompt',
        pageBuilder: (context, state) =>
            state.fadePage(const PinSetupPromptScreen()),
      ),
      GoRoute(
        path: '/setup-pin',
        pageBuilder: (context, state) => state.fadePage(const SetupPinScreen()),
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
        path: '/no-permission',
        pageBuilder: (context, state) {
          final permissionContext =
              state.uri.queryParameters['context'] ?? 'app';
          return state.fadePage(
            NoPermissionScreen(permissionContext: permissionContext),
          );
        },
      ),
      ShellRoute(
        builder: (context, state, child) => ProductionShellScreen(child: child),
        routes: [
          GoRoute(
            path: '/home',
            pageBuilder: (context, state) =>
                state.slidePage(const HomeScreen()),
          ),
          GoRoute(
            path: '/pickup-schedule',
            pageBuilder: (context, state) =>
                state.slidePage(const PickupScheduleScreen()),
          ),
          GoRoute(
            path: '/orders',
            pageBuilder: (context, state) =>
                state.slidePage(const IndexOrderScreen()),
          ),
          GoRoute(
            path: '/orders/:id',
            pageBuilder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return state.slidePage(ShowOrderScreen(orderId: id));
            },
          ),
          GoRoute(
            path: '/order-items/:id',
            pageBuilder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return state.slidePage(ShowOrderItemScreen(orderItemId: id));
            },
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) =>
                state.slidePage(const ProfileSettingScreen()),
          ),
        ],
      ),
    ],
  );

  bool _isProductionRoute(String location) {
    return location.startsWith('/orders') ||
        location.startsWith('/order-items');
  }
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
