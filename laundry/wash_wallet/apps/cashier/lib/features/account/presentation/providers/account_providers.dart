import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/account_remote_datasource.dart';
import '../../data/repositories/account_repository_impl.dart';
import '../../domain/repositories/account_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../bloc/account_cubit.dart';

class AccountProvider {
  AccountProvider._();

  static AccountRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return AccountRemoteDatasourceImpl(dio: dio, endpoints: endpoints);
  }

  static AccountRepository createRepository(
    AccountRemoteDatasource remoteDatasource,
  ) {
    return AccountRepositoryImpl(remoteDatasource: remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(AccountRepository repository) {
    return GetAllUsecase(repository);
  }

  static AccountCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);
    final getAllUsecase = createGetAllUsecase(repository);

    return AccountCubit(getAllUsecase: getAllUsecase);
  }
}
