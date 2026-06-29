import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class EmployeeRepository {
  Future<Result<List<Employee>>> getAll({int? outletId});

  Future<Result<Employee>> getById(int id);

  Future<Result<Employee>> update({
    required int id,
    required String name,
    required String startDate,
    required int cutoffDays,
    bool? isActive,
    String? phone,
    String? address,
    String? gender,
    String? avatarPath,
    List<int>? positionIds,
    List<Map<String, dynamic>>? employeeSalaries,
    List<Map<String, dynamic>>? employeeProcessCommissions,
  });
}
