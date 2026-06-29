import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../../data/datasources/courier_pricing_remote_datasource.dart';
import '../../data/repositories/courier_pricing_repository_impl.dart';
import '../../domain/repositories/courier_pricing_repository.dart';
import '../../domain/usecases/calculate_fee_usecase.dart';
import '../../domain/usecases/get_setting_summary_usecase.dart';
import '../bloc/courier_pricing_cubit.dart';

class CourierPricingProvider {
  CourierPricingProvider._();

  static CourierPricingRemoteDatasource createRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return CourierPricingRemoteDatasourceImpl(dio, endpoints);
  }

  static CourierPricingRepository createRepository(
    CourierPricingRemoteDatasource remoteDatasource,
  ) {
    return CourierPricingRepositoryImpl(remoteDatasource);
  }

  static CalculateFeeUsecase createCalculateFeeUsecase(
    CourierPricingRepository repository,
  ) {
    return CalculateFeeUsecase(repository);
  }

  static GetSettingSummaryUsecase createGetSettingSummaryUsecase(
    CourierPricingRepository repository,
  ) {
    return GetSettingSummaryUsecase(repository);
  }

  static CourierPricingCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    return CourierPricingCubit(
      calculateFeeUsecase: createCalculateFeeUsecase(repository),
      getSettingSummaryUsecase: createGetSettingSummaryUsecase(repository),
    );
  }
}
