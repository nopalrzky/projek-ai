import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_cashier/core/router/app_router.dart';
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

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  Widget buildApp(AppRouter appRouter, AuthCubit authCubit) {
    return BlocProvider.value(
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
    );
  }

  group('Onboarding Screen Navigation', () {
    setUp(() {
      final binding = TestWidgetsFlutterBinding.ensureInitialized();
      binding.window.physicalSizeTestValue = const Size(1080, 1920);
      binding.window.devicePixelRatioTestValue = 1.0;
    });

    tearDown(() {
      final binding = TestWidgetsFlutterBinding.ensureInitialized();
      binding.window.clearPhysicalSizeTestValue();
      binding.window.clearDevicePixelRatioTestValue();
    });

    testWidgets('Fresh storage, tap Lewati -> redirect ke /login', (tester) async {
      SharedPreferences.setMockInitialValues({});
      final authCubit = _makeAuthCubit(const AuthRequiresOnboarding());
      final appRouter = AppRouter(
        authCubit: authCubit,
        navigatorKey: GlobalKey<NavigatorState>(),
      );

      await tester.pumpWidget(buildApp(appRouter, authCubit));
      await tester.pumpAndSettle();
      
      expect(appRouter.router.routerDelegate.currentConfiguration.fullPath, '/onboarding');

      await tester.tap(find.text('Lewati'));
      await tester.pumpAndSettle();

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool('is_onboarding_done'), true);
      expect(appRouter.router.routerDelegate.currentConfiguration.fullPath, '/login');
    });

    testWidgets('Fresh storage, halaman terakhir tap Mulai Sekarang -> redirect ke /login', (tester) async {
      SharedPreferences.setMockInitialValues({});
      final authCubit = _makeAuthCubit(const AuthRequiresOnboarding());
      final appRouter = AppRouter(
        authCubit: authCubit,
        navigatorKey: GlobalKey<NavigatorState>(),
      );

      await tester.pumpWidget(buildApp(appRouter, authCubit));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Selanjutnya'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Selanjutnya'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Mulai Sekarang'));
      await tester.pumpAndSettle();

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool('is_onboarding_done'), true);
      expect(appRouter.router.routerDelegate.currentConfiguration.fullPath, '/login');
    });

    testWidgets('Remembered-account storage, tap Lewati -> redirect ke /switch-employee', (tester) async {
      SharedPreferences.setMockInitialValues({
        'cashier_remembered_employee_accounts_v1': '{"version": 1, "accounts": [{"employeeId": 1, "username": "test", "name": "Test", "outletId": 1, "outletName": "Outlet 1", "hasPin": true, "lastUsedAt": "2026-06-28T12:00:00.000Z"}]}'
      });
      final authCubit = _makeAuthCubit(const AuthRequiresOnboarding());
      final appRouter = AppRouter(
        authCubit: authCubit,
        navigatorKey: GlobalKey<NavigatorState>(),
      );

      await tester.pumpWidget(buildApp(appRouter, authCubit));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Lewati'));
      await tester.pumpAndSettle();

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool('is_onboarding_done'), true);
      expect(appRouter.router.routerDelegate.currentConfiguration.fullPath, '/switch-employee');
    });
  });
}
