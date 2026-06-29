import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_cubit.dart';
import 'package:wash_wallet_cashier/features/auth/presentation/bloc/auth_state.dart';
import 'package:wash_wallet_cashier/features/auth/domain/usecases/register_fcm_token_usecase.dart';
import 'package:wash_wallet_cashier/features/auth/domain/usecases/remove_fcm_token_usecase.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_cashier/core/services/notification_service.dart';

class MockLoginUsecase implements LoginUsecase {
  Future<Result<AuthEmployee>> Function({required String username, required String password})? callMock;

  @override
  Future<Result<AuthEmployee>> call({required String username, required String password}) {
    if (callMock != null) return callMock!(username: username, password: password);
    throw UnimplementedError();
  }
}

class MockLogoutUsecase implements LogoutUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockGetMeUsecase implements GetMeUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockCheckAuthStatusUsecase implements CheckAuthStatusUsecase {
  Future<Result<AuthEmployee>> Function()? callMock;
  @override
  Future<Result<AuthEmployee>> call() {
    if (callMock != null) return callMock!();
    throw UnimplementedError();
  }
}

class MockSetupPinUseCase implements SetupPinUseCase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockVerifyPinUseCase implements VerifyPinUseCase {
  Future<Result<AuthEmployee>> Function(VerifyPinParams)? callMock;
  @override
  Future<Result<AuthEmployee>> call(VerifyPinParams params) {
    if (callMock != null) return callMock!(params);
    throw UnimplementedError();
  }
}

class MockResetPinUseCase implements ResetPinUseCase {
  Future<Result<AuthEmployee>> Function(ResetPinParams)? callMock;
  @override
  Future<Result<AuthEmployee>> call(ResetPinParams params) {
    if (callMock != null) return callMock!(params);
    throw UnimplementedError();
  }
}

class MockSaveRememberedAccountUsecase implements SaveRememberedAccountUsecase {
  int callCount = 0;
  AuthEmployee? lastEmployee;

  @override
  Future<Result<void>> call(AuthEmployee employee) async {
    callCount++;
    lastEmployee = employee;
    return const Result.success(null);
  }
}

class MockRegisterFcmTokenUsecase implements RegisterFcmTokenUsecase {
  @override
  Future<Result<void>> call({required String token, String? deviceId, String? deviceName}) async {
    return const Result.success(null);
  }
}

class MockRemoveFcmTokenUsecase implements RemoveFcmTokenUsecase {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockNotificationService implements NotificationService {
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

void main() {
  late AuthCubit authCubit;
  late MockLoginUsecase mockLoginUsecase;
  late MockLogoutUsecase mockLogoutUsecase;
  late MockGetMeUsecase mockGetMeUsecase;
  late MockCheckAuthStatusUsecase mockCheckAuthStatusUsecase;
  late MockSetupPinUseCase mockSetupPinUseCase;
  late MockVerifyPinUseCase mockVerifyPinUseCase;
  late MockResetPinUseCase mockResetPinUseCase;
  late MockSaveRememberedAccountUsecase mockSaveRememberedAccountUsecase;
  late MockRegisterFcmTokenUsecase mockRegisterFcmTokenUsecase;
  late MockRemoveFcmTokenUsecase mockRemoveFcmTokenUsecase;
  late MockNotificationService mockNotificationService;

  final tEmployee = const AuthEmployee(
    id: 1,
    username: 'test',
    name: 'Test',
    outletId: 1,
    hasPin: true,
    accessibleOutlets: [],
    allPermissions: ['order.view'],
  );

  setUp(() {
    SharedPreferences.setMockInitialValues({});

    mockLoginUsecase = MockLoginUsecase();
    mockLogoutUsecase = MockLogoutUsecase();
    mockGetMeUsecase = MockGetMeUsecase();
    mockCheckAuthStatusUsecase = MockCheckAuthStatusUsecase();
    mockSetupPinUseCase = MockSetupPinUseCase();
    mockVerifyPinUseCase = MockVerifyPinUseCase();
    mockResetPinUseCase = MockResetPinUseCase();
    mockSaveRememberedAccountUsecase = MockSaveRememberedAccountUsecase();
    mockRegisterFcmTokenUsecase = MockRegisterFcmTokenUsecase();
    mockRemoveFcmTokenUsecase = MockRemoveFcmTokenUsecase();
    mockNotificationService = MockNotificationService();

    authCubit = AuthCubit(
      loginUsecase: mockLoginUsecase,
      logoutUsecase: mockLogoutUsecase,
      getMeUsecase: mockGetMeUsecase,
      checkAuthStatusUsecase: mockCheckAuthStatusUsecase,
      setupPinUseCase: mockSetupPinUseCase,
      verifyPinUseCase: mockVerifyPinUseCase,
      resetPinUseCase: mockResetPinUseCase,
      saveRememberedAccountUsecase: mockSaveRememberedAccountUsecase,
      registerFcmTokenUsecase: mockRegisterFcmTokenUsecase,
      removeFcmTokenUsecase: mockRemoveFcmTokenUsecase,
      notificationService: mockNotificationService,
    );
  });

  tearDown(() {
    authCubit.close();
  });

  test('switchEmployee emits SwitchPinVerifying then Authenticated on success', () async {
    mockVerifyPinUseCase.callMock = (params) async => Result.success(tEmployee);

    final previousEmployee = const AuthEmployee(
      id: 2,
      username: 'other',
      name: 'Other',
      outletId: 1,
      hasPin: true,
      accessibleOutlets: [],
      allPermissions: ['order.view'],
    );
    mockCheckAuthStatusUsecase.callMock = () async => Result.success(previousEmployee);

    await authCubit.checkAuthStatus();
    expect(authCubit.state, isA<Authenticated>());

    final states = <AuthState>[];
    final subscription = authCubit.stream.listen(states.add);

    await authCubit.switchEmployee(
      targetEmployeeId: 1,
      targetUsername: 'test',
      pin: '123456',
    );

    await Future.delayed(Duration.zero);

    expect(states[0], isA<SwitchPinVerifying>());
    expect(states[1], isA<Authenticated>());
    expect((states[1] as Authenticated).employee.id, 1);

    subscription.cancel();
  });

  test('switchEmployee emits SwitchPinVerifying then SwitchPinFailure on fail', () async {
    mockVerifyPinUseCase.callMock = (params) async => const Result.failure(AuthFailure(message: 'Invalid PIN'));

    final previousEmployee = const AuthEmployee(
      id: 2,
      username: 'other',
      name: 'Other',
      outletId: 1,
      hasPin: true,
      accessibleOutlets: [],
      allPermissions: ['order.view'],
    );
    mockCheckAuthStatusUsecase.callMock = () async => Result.success(previousEmployee);

    await authCubit.checkAuthStatus();

    final states = <AuthState>[];
    final subscription = authCubit.stream.listen(states.add);

    await authCubit.switchEmployee(
      targetEmployeeId: 1,
      targetUsername: 'test',
      pin: 'wrong',
    );

    await Future.delayed(Duration.zero);

    expect(states[0], isA<SwitchPinVerifying>());
    expect(states[1], isA<SwitchPinFailure>());
    expect((states[1] as SwitchPinFailure).previousEmployee.id, 2);

    subscription.cancel();
  });

  test('rememberCurrentEmployee memanggil saveRememberedAccountUsecase dan emit state tanpa prompt', () async {
    mockCheckAuthStatusUsecase.callMock = () async => Result.success(tEmployee);
    await authCubit.checkAuthStatus();

    expect(authCubit.state, isA<Authenticated>());

    await authCubit.rememberCurrentEmployee();

    expect(mockSaveRememberedAccountUsecase.callCount, 1);
    expect(mockSaveRememberedAccountUsecase.lastEmployee?.id, tEmployee.id);
    expect(authCubit.state, isA<Authenticated>());
    expect((authCubit.state as Authenticated).shouldPromptRemember, false);
  });

  test('login success set shouldPromptRemember: true jika akun belum tersimpan', () async {
    mockLoginUsecase.callMock = ({required String username, required String password}) async {
      return Result.success(tEmployee);
    };

    final states = <AuthState>[];
    final subscription = authCubit.stream.listen(states.add);

    await authCubit.login(username: 'test', password: 'pass');
    await Future.delayed(Duration.zero);

    expect(states.any((s) => s is Authenticated && s.shouldPromptRemember), true);
    subscription.cancel();
  });

  group('completeOnboarding', () {
    test('emit Unauthenticated jika tidak ada remembered employee', () async {
      final states = <AuthState>[];
      final subscription = authCubit.stream.listen(states.add);

      await authCubit.completeOnboarding();
      await Future.delayed(Duration.zero);

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool('is_onboarding_done'), true);
      expect(states.last, isA<Unauthenticated>());

      subscription.cancel();
    });

    test('emit AuthRequiresSwitchEmployee jika ada remembered employee', () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('cashier_remembered_employee_accounts_v1', '{"version": 1, "accounts": [{"employeeId": 1, "username": "test", "name": "Test", "outletId": 1, "outletName": "Outlet 1", "hasPin": true, "lastUsedAt": "2026-06-28T12:00:00.000Z"}]}');

      final states = <AuthState>[];
      final subscription = authCubit.stream.listen(states.add);

      await authCubit.completeOnboarding();
      await Future.delayed(Duration.zero);

      expect(prefs.getBool('is_onboarding_done'), true);
      expect(states.last, isA<AuthRequiresSwitchEmployee>());

      subscription.cancel();
    });
  });
}
