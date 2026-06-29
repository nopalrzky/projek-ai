import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/membership_contract_remote_datasource.dart';
import '../../data/repositories/membership_contract_repository_impl.dart';
import '../../domain/repositories/membership_contract_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../bloc/membership_contract_cubit.dart';

class MembershipContractProvider {
  MembershipContractProvider._();

  static MembershipContractRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return MembershipContractRemoteDatasourceImpl(dio, endpoints);
  }

  static MembershipContractRepository createRepository(
    MembershipContractRemoteDatasource remoteDatasource,
  ) {
    return MembershipContractRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(
    MembershipContractRepository repository,
  ) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetByIdUsecase(
    MembershipContractRepository repository,
  ) {
    return GetByIdUsecase(repository);
  }

  static MembershipContractCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getAll = createGetAllUsecase(repository);
    final getById = createGetByIdUsecase(repository);

    return MembershipContractCubit(
      getAllUsecase: getAll,
      getByIdUsecase: getById,
    );
  }
}
