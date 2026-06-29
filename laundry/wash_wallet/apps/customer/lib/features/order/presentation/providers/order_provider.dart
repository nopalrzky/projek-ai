import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../data/datasources/order_remote_datasource.dart';
import '../../data/repositories/order_repository_impl.dart';
import '../../domain/usecases/cancel_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/pay_order_usecase.dart';
import '../../domain/usecases/schedule_delivery_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import '../../domain/usecases/submit_review_usecase.dart';
import '../bloc/order_cubit.dart';

class OrderProvider {
  static OrderCubit orderCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = OrderRemoteDatasourceImpl(dio, endpoints);
    final repository = OrderRepositoryImpl(remoteDatasource);

    final getAllUsecase = GetAllUsecase(repository);
    final storeUsecase = StoreUsecase(repository);
    final cancelUsecase = CancelUsecase(repository);
    final getByIdUsecase = GetByIdUsecase(repository);
    final payOrderUseCase = PayOrderUseCase(repository);
    final scheduleDeliveryUseCase = ScheduleDeliveryUseCase(repository);
    final completeUsecase = CompleteUsecase(repository);
    final submitReviewUseCase = SubmitReviewUseCase(repository);

    return OrderCubit(
      getAllUsecase: getAllUsecase,
      storeUsecase: storeUsecase,
      cancelUsecase: cancelUsecase,
      getByIdUsecase: getByIdUsecase,
      payOrderUseCase: payOrderUseCase,
      scheduleDeliveryUseCase: scheduleDeliveryUseCase,
      completeUsecase: completeUsecase,
      submitReviewUseCase: submitReviewUseCase,
    );
  }
}
