import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../data/datasources/order_item_process_remote_datasource.dart';
import '../../data/repositories/order_item_process_repository_impl.dart';
import '../../domain/repositories/order_item_process_repository.dart';
import '../../domain/usecases/start_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import '../bloc/order_item_process_cubit.dart';

class OrderItemProcessProvider {
  OrderItemProcessProvider._();

  static OrderItemProcessRemoteDataSource createRemoteDataSource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return OrderItemProcessRemoteDataSourceImpl(dio, endpoints);
  }

  static OrderItemProcessRepository createRepository(
    OrderItemProcessRemoteDataSource remoteDataSource,
  ) {
    return OrderItemProcessRepositoryImpl(remoteDataSource);
  }

  static StartUsecase createStartUsecase(
    OrderItemProcessRepository repository,
  ) {
    return StartUsecase(repository);
  }

  static CompleteUsecase createCompleteUsecase(
    OrderItemProcessRepository repository,
  ) {
    return CompleteUsecase(repository);
  }

  static OrderItemProcessCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDataSource = createRemoteDataSource(dio, endpoints);
    final repository = createRepository(remoteDataSource);

    return OrderItemProcessCubit(
      startUsecase: createStartUsecase(repository),
      completeUsecase: createCompleteUsecase(repository),
    );
  }
}
