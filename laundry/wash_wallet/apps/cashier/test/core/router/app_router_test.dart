import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_cashier/core/router/app_router.dart';
import 'package:wash_wallet_cashier/core/permissions/cashier_permissions.dart';
import 'package:wash_wallet_cashier/features/customer/presentation/bloc/customer_cubit.dart';
import 'package:wash_wallet_cashier/features/customer/domain/usecases/get_all_usecase.dart';
import 'package:wash_wallet_cashier/features/customer/domain/usecases/get_by_id_usecase.dart';
import 'package:wash_wallet_cashier/features/customer/domain/usecases/store_usecase.dart';
import 'package:wash_wallet_cashier/features/customer/domain/usecases/update_usecase.dart';
import 'package:wash_wallet_cashier/features/customer/domain/usecases/destroy_usecase.dart';
import 'package:wash_wallet_cashier/features/customer/domain/usecases/store_membership_contract_usecase.dart';
import 'package:wash_wallet_cashier/features/customer/domain/usecases/store_customer_subscription_usecase.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_cubit.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_state.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_cashier/core/services/notification_service.dart';
import 'package:wash_wallet_cashier/features/auth/domain/usecases/register_fcm_token_usecase.dart';
import 'package:wash_wallet_cashier/features/auth/domain/usecases/remove_fcm_token_usecase.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_color_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_radius_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_spacing_extension.dart';
import 'package:wash_wallet_ui/src/theme/extensions/app_typography_extension.dart';

class _MockLoginUsecase implements LoginUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockLogoutUsecase implements LogoutUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockGetMeUsecase implements GetMeUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockCheckAuthStatusUsecase implements CheckAuthStatusUsecase {
  @override
  Future<Result<AuthEmployee>> call() async {
    return Result.failure(AuthFailure(message: 'unauthenticated'));
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockSetupPinUseCase implements SetupPinUseCase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockVerifyPinUseCase implements VerifyPinUseCase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockResetPinUseCase implements ResetPinUseCase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockChangePasswordUseCase implements ChangePasswordUseCase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockUpdateProfileUseCase implements UpdateProfileUseCase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockSaveRememberedAccountUsecase
    implements SaveRememberedAccountUsecase {
  @override
  Future<Result<void>> call(AuthEmployee employee) async =>
      const Result.success(null);
}

class _MockRegisterFcmTokenUsecase implements RegisterFcmTokenUsecase {
  @override
  Future<Result<void>> call({
    required String token,
    String? deviceId,
    String? deviceName,
  }) async => const Result.success(null);
}

class _MockRemoveFcmTokenUsecase implements RemoveFcmTokenUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockNotificationService implements NotificationService {
  @override
  Future<bool> requestPermission() async => true;
  @override
  Future<String> getDeviceId() async => 'device-id';
  @override
  Future<String?> getFcmToken() async => 'fcm-token';
  @override
  Future<void> connectPusher({required int outletId}) async {}
  @override
  void registerTokenRefresh(void Function(String) onTokenRefresh) {}
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

AuthCubit _makeAuthCubit(AuthState initialState) {
  return AuthCubit(
    loginUsecase: _MockLoginUsecase(),
    logoutUsecase: _MockLogoutUsecase(),
    getMeUsecase: _MockGetMeUsecase(),
    checkAuthStatusUsecase: _MockCheckAuthStatusUsecase(),
    setupPinUseCase: _MockSetupPinUseCase(),
    verifyPinUseCase: _MockVerifyPinUseCase(),
    resetPinUseCase: _MockResetPinUseCase(),
    changePasswordUseCase: _MockChangePasswordUseCase(),
    updateProfileUseCase: _MockUpdateProfileUseCase(),
    saveRememberedAccountUsecase: _MockSaveRememberedAccountUsecase(),
    registerFcmTokenUsecase: _MockRegisterFcmTokenUsecase(),
    removeFcmTokenUsecase: _MockRemoveFcmTokenUsecase(),
    notificationService: _MockNotificationService(),
  )..emit(initialState);
}

class _MockGetAllUsecase implements GetAllUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockGetByIdUsecase implements GetByIdUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockStoreUsecase implements StoreUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockUpdateUsecase implements UpdateUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockDestroyUsecase implements DestroyUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockStoreMembershipContractUsecase
    implements StoreMembershipContractUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _MockStoreCustomerSubscriptionUsecase
    implements StoreCustomerSubscriptionUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

CustomerCubit _makeCustomerCubit() {
  return CustomerCubit(
    getAllUsecase: _MockGetAllUsecase(),
    getByIdUsecase: _MockGetByIdUsecase(),
    storeUsecase: _MockStoreUsecase(),
    updateUsecase: _MockUpdateUsecase(),
    destroyUsecase: _MockDestroyUsecase(),
    storeMembershipContractUsecase: _MockStoreMembershipContractUsecase(),
    storeCustomerSubscriptionUsecase: _MockStoreCustomerSubscriptionUsecase(),
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const tEmployee = AuthEmployee(
    id: 1,
    username: 'test',
    name: 'Test',
    outletId: 1,
    hasPin: true,
    accessibleOutlets: [],
    allPermissions: ['order.view'],
  );

  testWidgets(
    'router redirects from /splash when state is AuthSetupPinRequired',
    (tester) async {
      final authCubit = _makeAuthCubit(const AuthSetupPinRequired(tEmployee));
      final appRouter = AppRouter(
        authCubit: authCubit,
        navigatorKey: GlobalKey<NavigatorState>(),
        splashScreen: const SizedBox(),
      );

      await tester.pumpWidget(
        BlocProvider.value(
          value: authCubit,
          child: MaterialApp.router(
            routerConfig: appRouter.router,
            theme: ThemeData(
              extensions: [
                AppColorExtension.light(),
                AppRadiusExtension.light(),
                AppSpacingExtension.light(),
                AppTypographyExtension.light(),
              ],
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(
        appRouter.router.routerDelegate.currentConfiguration.fullPath,
        '/setup-pin',
      );
    },
  );

  testWidgets('router does not redirect when state is SwitchPinVerifying', (
    tester,
  ) async {
    final authCubit = _makeAuthCubit(
      const SwitchPinVerifying(
        previousEmployee: tEmployee,
        targetEmployeeId: 2,
        targetUsername: 'other',
      ),
    );
    final appRouter = AppRouter(
      authCubit: authCubit,
      navigatorKey: GlobalKey<NavigatorState>(),
      splashScreen: const SizedBox(),
    );

    await tester.pumpWidget(
      BlocProvider.value(
        value: authCubit,
        child: MaterialApp.router(
          routerConfig: appRouter.router,
          theme: ThemeData(
            extensions: [
              AppColorExtension.light(),
              AppRadiusExtension.light(),
              AppSpacingExtension.light(),
              AppTypographyExtension.light(),
            ],
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Should stay on /splash because redirect returns null for SwitchPinVerifying
    expect(
      appRouter.router.routerDelegate.currentConfiguration.fullPath,
      '/splash',
    );
  });

  testWidgets('router does not redirect when state is SwitchPinFailure', (
    tester,
  ) async {
    final authCubit = _makeAuthCubit(
      const SwitchPinFailure(
        previousEmployee: tEmployee,
        failure: AuthFailure(message: 'Invalid PIN'),
      ),
    );
    final appRouter = AppRouter(
      authCubit: authCubit,
      navigatorKey: GlobalKey<NavigatorState>(),
      splashScreen: const SizedBox(),
    );

    await tester.pumpWidget(
      BlocProvider.value(
        value: authCubit,
        child: MaterialApp.router(
          routerConfig: appRouter.router,
          theme: ThemeData(
            extensions: [
              AppColorExtension.light(),
              AppRadiusExtension.light(),
              AppSpacingExtension.light(),
              AppTypographyExtension.light(),
            ],
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(
      appRouter.router.routerDelegate.currentConfiguration.fullPath,
      '/splash',
    );
  });

  for (final route in [
    '/categories',
    '/laundry-services',
    '/service-packages',
    '/membership-plans',
    '/profile',
    '/printer',
    '/pin-security',
    '/deposits',
    '/petty-cashes',
    '/expenses',
  ]) {
    testWidgets('unauthenticated redirect  -> /login', (tester) async {
      final authCubit = _makeAuthCubit(const Unauthenticated());
      final appRouter = AppRouter(
        authCubit: authCubit,
        navigatorKey: GlobalKey<NavigatorState>(),
        splashScreen: const SizedBox(),
      );

      appRouter.router.go(route);
      await tester.pumpWidget(
        BlocProvider.value(
          value: authCubit,
          child: MaterialApp.router(
            routerConfig: appRouter.router,
            theme: ThemeData(
              extensions: [
                AppColorExtension.light(),
                AppRadiusExtension.light(),
                AppSpacingExtension.light(),
                AppTypographyExtension.light(),
              ],
            ),
          ),
        ),
      );
      await tester.pump(Duration.zero);

      final fullPath =
          appRouter.router.routerDelegate.currentConfiguration.fullPath;
      expect(fullPath, startsWith('/login'));
    });
  }

  testWidgets('AppRouter has valid route for /deposits', (tester) async {
    // For /deposits, we just test that we can parse the route and find a match.
    // If we use pumpWidget, we would need to mock DepositCubit.
    // Testing route registration is sufficient:
    final authCubit = _makeAuthCubit(const Authenticated(tEmployee));
    final appRouter = AppRouter(
      authCubit: authCubit,
      navigatorKey: GlobalKey<NavigatorState>(),
      splashScreen: const SizedBox(),
    );
    final matches = appRouter.router.configuration.findMatch(
      Uri.parse('/deposits'),
    );
    expect(matches.isNotEmpty, true);
  });

  testWidgets('/customers/:id/edit without extra shows error scaffold', (
    tester,
  ) async {
    const employee = AuthEmployee(
      id: 1,
      username: 'test',
      name: 'Test',
      outletId: 1,
      hasPin: true,
      accessibleOutlets: [],
      allPermissions: ['customer.update'],
    );
    final authCubit = _makeAuthCubit(const Authenticated(employee));
    final customerCubit = _makeCustomerCubit();

    final appRouter = AppRouter(
      authCubit: authCubit,
      navigatorKey: GlobalKey<NavigatorState>(),
      splashScreen: const SizedBox(),
    );

    appRouter.router.push('/customers/1/edit');
    await tester.pumpWidget(
      MultiBlocProvider(
        providers: [
          BlocProvider.value(value: authCubit),
          BlocProvider.value(value: customerCubit),
        ],
        child: MaterialApp.router(
          routerConfig: appRouter.router,
          theme: ThemeData(
            extensions: [
              AppColorExtension.light(),
              AppRadiusExtension.light(),
              AppSpacingExtension.light(),
              AppTypographyExtension.light(),
            ],
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));

    final matches =
        appRouter.router.routerDelegate.currentConfiguration.matches;
    expect(matches.last.matchedLocation, '/customers/1/edit');
    expect(find.text('Data tidak tersedia untuk mode edit.'), findsWidgets);
  });

  testWidgets(
    'authenticated without deposit.view redirected to no-permission',
    (tester) async {
      const employee = AuthEmployee(
        id: 2,
        username: 'limited',
        name: 'Limited',
        outletId: 1,
        hasPin: true,
        accessibleOutlets: [],
        allPermissions: [CashierPermissions.orderView],
      );

      final authCubit = _makeAuthCubit(const Authenticated(employee));
      final appRouter = AppRouter(
        authCubit: authCubit,
        navigatorKey: GlobalKey<NavigatorState>(),
        splashScreen: const SizedBox(),
      );

      appRouter.router.go('/deposits');
      await tester.pumpWidget(
        BlocProvider.value(
          value: authCubit,
          child: MaterialApp.router(
            routerConfig: appRouter.router,
            theme: ThemeData(
              extensions: [
                AppColorExtension.light(),
                AppRadiusExtension.light(),
                AppSpacingExtension.light(),
                AppTypographyExtension.light(),
              ],
            ),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      expect(
        appRouter.router.routerDelegate.currentConfiguration.fullPath,
        '/no-permission',
      );
      expect(find.textContaining('Anda tidak memiliki izin'), findsOneWidget);
    },
  );

  testWidgets(
    'authCubit from /onboarding with Unauthenticated -> redirect to /login',
    (tester) async {
      final authCubit = _makeAuthCubit(const Unauthenticated());
      final appRouter = AppRouter(
        authCubit: authCubit,
        navigatorKey: GlobalKey<NavigatorState>(),
        splashScreen: const SizedBox(),
      );

      appRouter.router.go('/onboarding');
      await tester.pumpWidget(
        BlocProvider.value(
          value: authCubit,
          child: MaterialApp.router(
            routerConfig: appRouter.router,
            theme: ThemeData(
              extensions: [
                AppColorExtension.light(),
                AppRadiusExtension.light(),
                AppSpacingExtension.light(),
                AppTypographyExtension.light(),
              ],
            ),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      expect(
        appRouter.router.routerDelegate.currentConfiguration.fullPath,
        '/login',
      );
    },
  );

  testWidgets(
    'authCubit from /onboarding with AuthRequiresSwitchEmployee -> redirect to /switch-employee',
    (tester) async {
      final authCubit = _makeAuthCubit(const AuthRequiresSwitchEmployee());
      final appRouter = AppRouter(
        authCubit: authCubit,
        navigatorKey: GlobalKey<NavigatorState>(),
        splashScreen: const SizedBox(),
      );

      appRouter.router.go('/onboarding');
      await tester.pumpWidget(
        BlocProvider.value(
          value: authCubit,
          child: MaterialApp.router(
            routerConfig: appRouter.router,
            theme: ThemeData(
              extensions: [
                AppColorExtension.light(),
                AppRadiusExtension.light(),
                AppSpacingExtension.light(),
                AppTypographyExtension.light(),
              ],
            ),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100));

      expect(
        appRouter.router.routerDelegate.currentConfiguration.fullPath,
        '/switch-employee',
      );
    },
  );
}
