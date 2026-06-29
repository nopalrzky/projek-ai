import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../data/datasources/order_review_remote_datasource.dart';
import '../../data/repositories/order_review_repository_impl.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_order_review_summary_usecase.dart';
import '../bloc/order_review_cubit.dart';

class OrderReviewProvider {
  static OrderReviewCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final datasource = OrderReviewRemoteDatasourceImpl(dio, endpoints);
    final repository = OrderReviewRepositoryImpl(datasource);
    return OrderReviewCubit(
      getAllUseCase: GetAllOrderReviewUseCase(repository),
      getByIdUseCase: GetOrderReviewByIdUseCase(repository),
      getSummaryUseCase: GetOrderReviewSummaryUseCase(repository),
    );
  }
}
