import 'package:equatable/equatable.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/employee_repository.dart';

class GetAllParams extends Equatable {
  final int? outletId;

  const GetAllParams({this.outletId});

  @override
  List<Object?> get props => [outletId];
}

class GetAllUsecase {
  final EmployeeRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<List<Employee>>> call(GetAllParams params) async {
    return await _repository.getAll(outletId: params.outletId);
  }
}
