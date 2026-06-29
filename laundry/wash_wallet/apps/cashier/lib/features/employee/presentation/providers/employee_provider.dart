import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/employee_remote_datasource.dart';
import '../../data/repositories/employee_repository_impl.dart';
import '../../domain/repositories/employee_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../bloc/employee_cubit.dart';

class EmployeeProvider {
  EmployeeProvider._();

  static EmployeeRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return EmployeeRemoteDatasourceImpl(dio, endpoints);
  }

  static EmployeeRepository createRepository(
    EmployeeRemoteDatasource remoteDatasource,
  ) {
    return EmployeeRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(EmployeeRepository repository) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(EmployeeRepository repository) {
    return GetByIdUsecase(repository);
  }

  static UpdateUsecase createUpdateUsecase(EmployeeRepository repository) {
    return UpdateUsecase(repository);
  }

  static EmployeeCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);
    final update = createUpdateUsecase(repository);

    return EmployeeCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
      updateUsecase: update,
    );
  }
}
