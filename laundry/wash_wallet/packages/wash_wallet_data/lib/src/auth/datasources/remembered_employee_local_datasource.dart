import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class RememberedEmployeeAccount {
  final int employeeId;
  final String username;
  final String name;
  final int outletId;
  final String outletName;
  final bool hasPin;
  final DateTime lastUsedAt;

  RememberedEmployeeAccount({
    required this.employeeId,
    required this.username,
    required this.name,
    required this.outletId,
    required this.outletName,
    required this.hasPin,
    required this.lastUsedAt,
  });

  Map<String, dynamic> toJson() => {
    'employeeId': employeeId,
    'username': username,
    'name': name,
    'outletId': outletId,
    'outletName': outletName,
    'hasPin': hasPin,
    'lastUsedAt': lastUsedAt.toIso8601String(),
  };

  factory RememberedEmployeeAccount.fromJson(Map<String, dynamic> json) {
    return RememberedEmployeeAccount(
      employeeId: json['employeeId'] as int,
      username: json['username'] as String,
      name: json['name'] as String,
      outletId: json['outletId'] as int,
      outletName: json['outletName'] as String? ?? 'Outlet ${json['outletId']}',
      hasPin: json['hasPin'] as bool? ?? false,
      lastUsedAt: DateTime.parse(json['lastUsedAt'] as String),
    );
  }
}

abstract class RememberedEmployeeLocalDatasource {
  Future<void> saveAccount(AuthEmployeeModel employee);
  Future<List<RememberedEmployeeAccount>> getAccounts();
  Future<void> removeAccount(int employeeId);
}

class RememberedEmployeeLocalDatasourceImpl
    implements RememberedEmployeeLocalDatasource {
  final SharedPreferences _prefs;
  static const String _key = 'cashier_remembered_employee_accounts_v1';

  RememberedEmployeeLocalDatasourceImpl(this._prefs);

  @override
  Future<void> saveAccount(AuthEmployeeModel employee) async {
    final accounts = await getAccounts();

    String outletName = 'Outlet ${employee.outletId}';
    if (employee.accessibleOutlets != null &&
        employee.accessibleOutlets!.isNotEmpty) {
      final match = employee.accessibleOutlets!.firstWhere(
        (o) => o.outletId == employee.outletId,
        orElse: () => employee.accessibleOutlets!.first,
      );
      outletName = match.outletName;
    }

    final newAccount = RememberedEmployeeAccount(
      employeeId: employee.id,
      username: employee.username,
      name: employee.name,
      outletId: employee.outletId,
      outletName: outletName,
      hasPin: employee.hasPin,
      lastUsedAt: DateTime.now(),
    );

    accounts.removeWhere((a) => a.employeeId == employee.id);
    accounts.insert(0, newAccount);

    // Sort by lastUsedAt descending
    accounts.sort((a, b) => b.lastUsedAt.compareTo(a.lastUsedAt));

    final mapData = {
      'version': 1,
      'accounts': accounts.map((e) => e.toJson()).toList(),
    };

    await _prefs.setString(_key, json.encode(mapData));
  }

  @override
  Future<List<RememberedEmployeeAccount>> getAccounts() async {
    final str = _prefs.getString(_key);
    if (str == null) return [];

    try {
      final mapData = json.decode(str) as Map<String, dynamic>;
      final accountsList = mapData['accounts'] as List<dynamic>? ?? [];

      return accountsList
          .map(
            (e) =>
                RememberedEmployeeAccount.fromJson(e as Map<String, dynamic>),
          )
          .toList();
    } catch (e) {
      return [];
    }
  }

  @override
  Future<void> removeAccount(int employeeId) async {
    final accounts = await getAccounts();
    accounts.removeWhere((a) => a.employeeId == employeeId);

    final mapData = {
      'version': 1,
      'accounts': accounts.map((e) => e.toJson()).toList(),
    };

    await _prefs.setString(_key, json.encode(mapData));
  }
}
