import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import 'package:wash_wallet_data/wash_wallet_data.dart';
import 'package:wash_wallet_domain/unit_usecases.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../bloc/unit_cubit.dart';

class UnitProvider {
  UnitProvider._();

  static UnitRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return UnitRemoteDatasourceImpl(dio, endpoints);
  }

  static UnitRepository createRepository(
    UnitRemoteDatasource remoteDatasource,
  ) {
    return UnitRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(UnitRepository repository) {
    return GetAllUsecase(repository);
  }

  static UnitCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);
    final getAllUsecase = createGetAllUsecase(repository);

    return UnitCubit(getAllUsecase: getAllUsecase);
  }
}
