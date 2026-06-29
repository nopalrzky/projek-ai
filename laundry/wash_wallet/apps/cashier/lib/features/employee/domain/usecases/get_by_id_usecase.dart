import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/employee_repository.dart';

class GetByIdUsecase {
  final EmployeeRepository _repository;

  GetByIdUsecase(this._repository);

  Future<Result<Employee>> call(int id) async {
    return await _repository.getById(id);
  }
}

typedef GetEmployeeByIdUsecase = GetByIdUsecase;
