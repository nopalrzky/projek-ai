import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/membership_plan_remote_datasource.dart';
import '../../data/repositories/membership_plan_repository_impl.dart';
import '../../domain/repositories/membership_plan_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../bloc/membership_plan_cubit.dart';

class MembershipPlanProvider {
  MembershipPlanProvider._();

  static MembershipPlanRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return MembershipPlanRemoteDatasourceImpl(dio, endpoints);
  }

  static MembershipPlanRepository createRepository(
    MembershipPlanRemoteDatasource remoteDatasource,
  ) {
    return MembershipPlanRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(
    MembershipPlanRepository repository,
  ) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(
    MembershipPlanRepository repository,
  ) {
    return GetByIdUsecase(repository);
  }

  static MembershipPlanCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);

    return MembershipPlanCubit(getAllUsecase: getAll, getByIdUsecase: getById);
  }
}
