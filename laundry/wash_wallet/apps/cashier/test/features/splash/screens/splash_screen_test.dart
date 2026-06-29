import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_cubit.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_state.dart';
import 'package:wash_wallet_cashier/features/splash/screens/splash_screen.dart';
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
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockLogoutUsecase implements LogoutUsecase {
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockGetMeUsecase implements GetMeUsecase {
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockCheckAuthStatusUsecase implements CheckAuthStatusUsecase {
  final Result<AuthEmployee>? _result;
  _MockCheckAuthStatusUsecase([this._result]);

  @override
  Future<Result<AuthEmployee>> call() async {
    return _result ?? Result.failure(AuthFailure(message: 'unauthenticated'));
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockSetupPinUseCase implements SetupPinUseCase {
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockVerifyPinUseCase implements VerifyPinUseCase {
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockResetPinUseCase implements ResetPinUseCase {
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockSaveRememberedAccountUsecase implements SaveRememberedAccountUsecase {
  @override Future<Result<void>> call(AuthEmployee employee) async => const Result.success(null);
}
class _MockRegisterFcmTokenUsecase implements RegisterFcmTokenUsecase {
  @override Future<Result<void>> call({required String token, String? deviceId, String? deviceName}) async => const Result.success(null);
}
class _MockRemoveFcmTokenUsecase implements RemoveFcmTokenUsecase {
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockNotificationService implements NotificationService {
  @override Future<bool> requestPermission() async => true;
  @override Future<String> getDeviceId() async => 'device-id';
  @override Future<String?> getFcmToken() async => 'fcm-token';
  @override Future<void> connectPusher({required int outletId}) async {}
  @override void registerTokenRefresh(void Function(String) onTokenRefresh) {}
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

AuthCubit _makeAuthCubit(
  AuthState initialState, {
  Result<AuthEmployee>? checkAuthResult,
}) {
  return AuthCubit(
    loginUsecase: _MockLoginUsecase(),
    logoutUsecase: _MockLogoutUsecase(),
    getMeUsecase: _MockGetMeUsecase(),
    checkAuthStatusUsecase: _MockCheckAuthStatusUsecase(checkAuthResult),
    setupPinUseCase: _MockSetupPinUseCase(),
    verifyPinUseCase: _MockVerifyPinUseCase(),
    resetPinUseCase: _MockResetPinUseCase(),
    saveRememberedAccountUsecase: _MockSaveRememberedAccountUsecase(),
    registerFcmTokenUsecase: _MockRegisterFcmTokenUsecase(),
    removeFcmTokenUsecase: _MockRemoveFcmTokenUsecase(),
    notificationService: _MockNotificationService(),
  )..emit(initialState);
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({
      'is_onboarding_done': true,
    });
  });

  const tOutletAccess = OutletAccess(
    outletId: 1,
    outletName: 'Test Outlet',
    positions: [],
  );

  const tEmployee = AuthEmployee(
    id: 1,
    username: 'test',
    name: 'Test',
    outletId: 1,
    hasPin: true,
    accessibleOutlets: [tOutletAccess],
    allPermissions: ['order.view'],
  );

  const tEmployeeNoPin = AuthEmployee(
    id: 1,
    username: 'test',
    name: 'Test',
    outletId: 1,
    hasPin: false,
    accessibleOutlets: [tOutletAccess],
    allPermissions: ['order.view'],
  );

  const tEmployeeNoPermission = AuthEmployee(
    id: 1,
    username: 'test',
    name: 'Test',
    outletId: 1,
    hasPin: true,
    accessibleOutlets: [tOutletAccess],
    allPermissions: [],
  );

  GoRouter buildRouter() {
    return GoRouter(
      initialLocation: '/splash',
      routes: [
        GoRoute(path: '/splash', builder: (_, _) => const SplashScreen()),
        GoRoute(path: '/home', builder: (_, _) => const Scaffold(body: Text('Home'))),
        GoRoute(path: '/login', builder: (_, _) => const Scaffold(body: Text('Login'))),
        GoRoute(path: '/setup-pin', builder: (_, _) => const Scaffold(body: Text('Setup PIN'))),
        GoRoute(path: '/access-denied', builder: (_, _) => const Scaffold(body: Text('Access Denied'))),
        GoRoute(path: '/onboarding', builder: (_, _) => const Scaffold(body: Text('Onboarding'))),
        GoRoute(path: '/switch-employee', builder: (_, _) => const Scaffold(body: Text('Switch Employee'))),
      ],
    );
  }

  Widget buildTestableWidget(AuthCubit authCubit) {
    final router = buildRouter();
    return MaterialApp.router(
      routerConfig: router,
      theme: ThemeData(
        extensions: [
          AppColorExtension.light(),
          AppRadiusExtension.light(),
          AppSpacingExtension.light(),
          AppTypographyExtension.light(),
        ],
      ),
      builder: (context, child) {
        return BlocProvider<AuthCubit>.value(
          value: authCubit,
          child: child!,
        );
      },
    );
  }

  testWidgets('Authenticated navigates to /home', (tester) async {
    final authCubit = _makeAuthCubit(
      const Authenticated(tEmployee),
      checkAuthResult: const Result.success(tEmployee),
    );
    await tester.pumpWidget(buildTestableWidget(authCubit));
    await tester.pumpAndSettle();
    expect(find.text('Home'), findsOneWidget);
  });

  testWidgets('AuthenticatedStale navigates to /home', (tester) async {
    final authCubit = _makeAuthCubit(
      const AuthenticatedStale(tEmployee),
      checkAuthResult: const Result.success(tEmployee),
    );
    await tester.pumpWidget(buildTestableWidget(authCubit));
    await tester.pumpAndSettle();
    expect(find.text('Home'), findsOneWidget);
  });

  testWidgets('AuthSetupPinRequired navigates to /setup-pin', (tester) async {
    final authCubit = _makeAuthCubit(
      const AuthSetupPinRequired(tEmployeeNoPin),
      checkAuthResult: const Result.success(tEmployeeNoPin),
    );
    await tester.pumpWidget(buildTestableWidget(authCubit));
    await tester.pumpAndSettle();
    expect(find.text('Setup PIN'), findsOneWidget);
  });

  testWidgets('AuthAccessDenied navigates to /access-denied', (tester) async {
    final authCubit = _makeAuthCubit(
      const AuthAccessDenied(tEmployeeNoPermission),
      checkAuthResult: const Result.success(tEmployeeNoPermission),
    );
    await tester.pumpWidget(buildTestableWidget(authCubit));
    await tester.pumpAndSettle();
    expect(find.text('Access Denied'), findsOneWidget);
  });

  testWidgets('Unauthenticated without remembered account navigates to /login', (tester) async {
    final authCubit = _makeAuthCubit(
      const Unauthenticated(),
      checkAuthResult: const Result.failure(AuthFailure(message: 'unauthenticated')),
    );
    await tester.pumpWidget(buildTestableWidget(authCubit));
    await tester.pumpAndSettle();
    expect(find.text('Login'), findsOneWidget);
  });

  testWidgets('Unauthenticated with remembered account navigates to /switch-employee', (tester) async {
    SharedPreferences.setMockInitialValues({
      'is_onboarding_done': true,
      'cashier_remembered_employee_accounts_v1': '{"version":1,"accounts":[{"employeeId":1,"username":"test","name":"Test","outletId":1,"outletName":"Outlet 1","hasPin":true,"lastUsedAt":"2026-06-21T00:00:00.000Z"}]}',
    });
    final authCubit = _makeAuthCubit(
      const Unauthenticated(),
      checkAuthResult: const Result.failure(AuthFailure(message: 'unauthenticated')),
    );
    await tester.pumpWidget(buildTestableWidget(authCubit));
    await tester.pumpAndSettle();
    expect(find.text('Switch Employee'), findsOneWidget);
  });
}
