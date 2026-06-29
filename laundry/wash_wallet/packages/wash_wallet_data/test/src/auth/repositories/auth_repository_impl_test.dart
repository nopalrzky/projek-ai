import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_data/wash_wallet_data.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

class MockAuthRemoteDatasource implements AuthRemoteDatasource {
  Future<AuthEmployeeModel> Function()? getMeMock;
  Future<(String, AuthEmployeeModel)> Function({required String username, required String password})? loginMock;
  Future<AuthEmployeeModel> Function({required String pin, required String pinConfirmation})? setupPinMock;
  Future<(String, AuthEmployeeModel)> Function({int? employeeId, String? username, required String pin, String? deviceName})? verifyPinMock;

  @override
  Future<AuthEmployeeModel> getMe() {
    if (getMeMock != null) return getMeMock!();
    throw UnimplementedError();
  }

  @override
  Future<(String, AuthEmployeeModel)> login({required String username, required String password}) {
    if (loginMock != null) return loginMock!(username: username, password: password);
    throw UnimplementedError();
  }

  @override
  Future<AuthEmployeeModel> setupPin({required String pin, required String pinConfirmation}) {
    if (setupPinMock != null) return setupPinMock!(pin: pin, pinConfirmation: pinConfirmation);
    throw UnimplementedError();
  }

  @override
  Future<(String, AuthEmployeeModel)> verifyPin({int? employeeId, String? username, required String pin, String? deviceName}) {
    if (verifyPinMock != null) return verifyPinMock!(employeeId: employeeId, username: username, pin: pin, deviceName: deviceName);
    throw UnimplementedError();
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockAuthLocalDatasource implements AuthLocalDatasource {
  Future<String?> Function()? getTokenMock;
  Future<AuthEmployeeModel?> Function()? getEmployeeMock;
  Future<void> Function()? clearAllMock;
  int clearAllCallCount = 0;

  @override
  Future<String?> getToken() {
    if (getTokenMock != null) return getTokenMock!();
    throw UnimplementedError();
  }

  @override
  Future<AuthEmployeeModel?> getEmployee() {
    if (getEmployeeMock != null) return getEmployeeMock!();
    throw UnimplementedError();
  }

  @override
  Future<void> clearAll() async {
    clearAllCallCount++;
    if (clearAllMock != null) return clearAllMock!();
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockRememberedEmployeeLocalDatasource implements RememberedEmployeeLocalDatasource {
  int saveAccountCallCount = 0;
  AuthEmployeeModel? lastSavedAccount;

  @override
  Future<void> saveAccount(AuthEmployeeModel employee) async {
    saveAccountCallCount++;
    lastSavedAccount = employee;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  late AuthRepositoryImpl repository;
  late MockAuthRemoteDatasource mockRemote;
  late MockAuthLocalDatasource mockLocal;
  late MockRememberedEmployeeLocalDatasource mockRemembered;

  final tEmployeeModel = const AuthEmployeeModel(
    id: 1,
    username: 'test',
    name: 'Test Employee',
    outletId: 1,
    hasPin: true,
    accessibleOutlets: [],
    allPermissions: [],
  );

  setUp(() {
    mockRemote = MockAuthRemoteDatasource();
    mockLocal = MockAuthLocalDatasource();
    mockRemembered = MockRememberedEmployeeLocalDatasource();

    repository = AuthRepositoryImpl(
      remoteDatasource: mockRemote,
      localDatasource: mockLocal,
      rememberedDatasource: mockRemembered,
    );
  });

  group('checkAuthStatus', () {
    test('returns failure if no token', () async {
      mockLocal.getTokenMock = () async => null;

      final result = await repository.checkAuthStatus();

      expect(result, isA<Result<AuthEmployee>>());
      result.when(
        success: (_) => fail('Should be failure'),
        failure: (failure) => expect(failure, isA<AuthFailure>()),
      );
    });

    test('clears token and returns AuthFailure on 401', () async {
      mockLocal.getTokenMock = () async => 'token';
      mockRemote.getMeMock = () async => throw ApiException(message: 'Unauthenticated', statusCode: 401);
      mockLocal.clearAllMock = () async {};

      final result = await repository.checkAuthStatus();

      expect(mockLocal.clearAllCallCount, 2);
      result.when(
        success: (_) => fail('Should be failure'),
        failure: (failure) => expect(failure, isA<AuthFailure>()),
      );
    });

    test('returns success with local data on NetworkException', () async {
      mockLocal.getTokenMock = () async => 'token';
      mockRemote.getMeMock = () async => throw NetworkException(message: 'Offline');
      mockLocal.getEmployeeMock = () async => tEmployeeModel;

      final result = await repository.checkAuthStatus();

      expect(mockLocal.clearAllCallCount, 0);
      result.when(
        success: (employee) => expect(employee.id, tEmployeeModel.id),
        failure: (_) => fail('Should be success due to local data fallback'),
      );
    });
    
    test('returns success with local data on ServerException (500)', () async {
      mockLocal.getTokenMock = () async => 'token';
      mockRemote.getMeMock = () async => throw ApiException(message: 'Server error', statusCode: 500);
      mockLocal.getEmployeeMock = () async => tEmployeeModel;

      final result = await repository.checkAuthStatus();

      expect(mockLocal.clearAllCallCount, 0);
      result.when(
        success: (employee) => expect(employee.id, tEmployeeModel.id),
        failure: (_) => fail('Should be success due to local data fallback'),
      );
    });
  });

  group('login', () {
    test('tidak memanggil saveAccount pada remembered datasource', () async {
      mockRemote.loginMock = ({required String username, required String password}) async {
        return ('token', tEmployeeModel);
      };

      final result = await repository.login(username: 'test', password: 'pass');

      expect(mockRemembered.saveAccountCallCount, 0);
      expect(result.isSuccess, true);
    });
  });

  group('setupPin', () {
    test('tidak memanggil saveAccount pada remembered datasource', () async {
      mockRemote.setupPinMock = ({required String pin, required String pinConfirmation}) async {
        return tEmployeeModel;
      };

      final result = await repository.setupPin(pin: '123456', pinConfirmation: '123456');

      expect(mockRemembered.saveAccountCallCount, 0);
      expect(result.isSuccess, true);
    });
  });

  group('verifyPin', () {
    test('tidak memanggil saveAccount pada remembered datasource', () async {
      mockRemote.verifyPinMock = ({int? employeeId, String? username, required String pin, String? deviceName}) async {
        return ('token', tEmployeeModel);
      };

      final result = await repository.verifyPin(pin: '123456');

      expect(mockRemembered.saveAccountCallCount, 0);
      expect(result.isSuccess, true);
    });
  });

  group('saveRememberedAccount', () {
    test('memanggil saveAccount pada remembered datasource', () async {
      mockLocal.getEmployeeMock = () async => tEmployeeModel;

      final result = await repository.saveRememberedAccount(tEmployeeModel.toEntity());

      expect(mockRemembered.saveAccountCallCount, 1);
      expect(mockRemembered.lastSavedAccount?.id, tEmployeeModel.id);
      expect(result.isSuccess, true);
    });

    test('gagal jika employee tidak ada di local cache', () async {
      mockLocal.getEmployeeMock = () async => null;

      final result = await repository.saveRememberedAccount(tEmployeeModel.toEntity());

      expect(mockRemembered.saveAccountCallCount, 0);
      expect(result.isFailure, true);
      result.when(
        success: (_) => fail('Should be failure'),
        failure: (failure) => expect(failure, isA<CacheFailure>()),
      );
    });
  });
}
