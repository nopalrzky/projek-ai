import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import 'employee_state.dart';

class EmployeeCubit extends Cubit<EmployeeState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final UpdateUsecase _updateUsecase;

  EmployeeCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required UpdateUsecase updateUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _updateUsecase = updateUsecase,
       super(const EmployeeInitial());

  Future<void> getAll({int? outletId}) async {
    emit(const EmployeeLoading());

    final result = await _getAllUsecase(GetAllParams(outletId: outletId));

    result.when(
      success: (employees) => emit(EmployeesLoaded(employees)),
      failure: (failure) => emit(EmployeeFailure(failure)),
    );
  }

  Future<void> getById(int id) async {
    emit(const EmployeeLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (employee) => emit(EmployeeDetailLoaded(employee)),
      failure: (failure) => emit(EmployeeFailure(failure)),
    );
  }

  Future<void> update({
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
  }) async {
    emit(const EmployeeLoading());

    final params = UpdateEmployeeParams(
      id: id,
      name: name,
      startDate: startDate,
      cutoffDays: cutoffDays,
      isActive: isActive,
      phone: phone,
      address: address,
      gender: gender,
      avatarPath: avatarPath,
      positionIds: positionIds,
      employeeSalaries: employeeSalaries,
      employeeProcessCommissions: employeeProcessCommissions,
    );

    final result = await _updateUsecase(params);

    result.when(
      success: (employee) => emit(
        EmployeeActionSuccess('Employee updated successfully', employee),
      ),
      failure: (failure) => emit(EmployeeFailure(failure)),
    );
  }

  Future<void> loadProfile(int id) async => getById(id);

  Future<void> updateProfile({
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
  }) async {
    await update(
      id: id,
      name: name,
      startDate: startDate,
      cutoffDays: cutoffDays,
      isActive: isActive,
      phone: phone,
      address: address,
      gender: gender,
      avatarPath: avatarPath,
      positionIds: positionIds,
      employeeSalaries: employeeSalaries,
      employeeProcessCommissions: employeeProcessCommissions,
    );
  }
}
