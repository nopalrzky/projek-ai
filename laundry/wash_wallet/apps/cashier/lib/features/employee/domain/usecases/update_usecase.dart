import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/employee_repository.dart';

class UpdateEmployeeParams {
  final int id;
  final String name;
  final String startDate;
  final int cutoffDays;
  final bool? isActive;
  final String? phone;
  final String? address;
  final String? gender;
  final String? avatarPath;
  final List<int>? positionIds;
  final List<Map<String, dynamic>>? employeeSalaries;
  final List<Map<String, dynamic>>? employeeProcessCommissions;

  const UpdateEmployeeParams({
    required this.id,
    required this.name,
    required this.startDate,
    required this.cutoffDays,
    this.isActive,
    this.phone,
    this.address,
    this.gender,
    this.avatarPath,
    this.positionIds,
    this.employeeSalaries,
    this.employeeProcessCommissions,
  });
}

class UpdateEmployeeUsecase {
  final EmployeeRepository _repository;

  UpdateEmployeeUsecase(this._repository);

  Future<Result<Employee>> call(UpdateEmployeeParams params) async {
    return await _repository.update(
      id: params.id,
      name: params.name,
      startDate: params.startDate,
      cutoffDays: params.cutoffDays,
      isActive: params.isActive,
      phone: params.phone,
      address: params.address,
      gender: params.gender,
      avatarPath: params.avatarPath,
      positionIds: params.positionIds,
      employeeSalaries: params.employeeSalaries,
      employeeProcessCommissions: params.employeeProcessCommissions,
    );
  }
}

typedef UpdateUsecase = UpdateEmployeeUsecase;
