import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
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
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockLogoutUsecase implements LogoutUsecase {
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
class _MockGetMeUsecase implements GetMeUsecase {
  @override dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
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

AuthCubit _makeAuthCubit(AuthState initialState) {
  return AuthCubit(
    loginUsecase: _MockLoginUsecase(),
    logoutUsecase: _MockLogoutUsecase(),
    getMeUsecase: _MockGetMeUsecase(),
    checkAuthStatusUsecase: _MockCheckAuthStatusUsecase(),
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

  const tEmployee = AuthEmployee(
    id: 1,
    username: 'test',
    name: 'Test',
    outletId: 1,
    hasPin: true,
    accessibleOutlets: [],
    allPermissions: ['order.view'],
  );

  testWidgets('router redirects from /splash when state is AuthSetupPinRequired', (tester) async {
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

    expect(appRouter.router.routerDelegate.currentConfiguration.fullPath, '/setup-pin');
  });

  testWidgets('router does not redirect when state is SwitchPinVerifying', (tester) async {
    final authCubit = _makeAuthCubit(const SwitchPinVerifying(
      previousEmployee: tEmployee,
      targetEmployeeId: 2,
      targetUsername: 'other',
    ));
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
    expect(appRouter.router.routerDelegate.currentConfiguration.fullPath, '/splash');
  });

  testWidgets('router does not redirect when state is SwitchPinFailure', (tester) async {
    final authCubit = _makeAuthCubit(const SwitchPinFailure(
      previousEmployee: tEmployee,
      failure: AuthFailure(message: 'Invalid PIN'),
    ));
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

    expect(appRouter.router.routerDelegate.currentConfiguration.fullPath, '/splash');
  });
}
