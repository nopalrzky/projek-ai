import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../data/datasources/courier_schedule_remote_datasource.dart';
import '../../data/repositories/courier_schedule_repository_impl.dart';
import '../../domain/repositories/courier_schedule_repository.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../bloc/courier_schedule_cubit.dart';

class CourierScheduleProvider {
  CourierScheduleProvider._();

  static CourierScheduleRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return CourierScheduleRemoteDatasourceImpl(dio, endpoints);
  }

  static CourierScheduleRepository createRepository(
    CourierScheduleRemoteDatasource remoteDatasource,
  ) {
    return CourierScheduleRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetAllUsecase(
    CourierScheduleRepository repository,
  ) {
    return GetAllUsecase(repository);
  }

  static CourierScheduleCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    return CourierScheduleCubit(getAllUsecase: createGetAllUsecase(repository));
  }
}
