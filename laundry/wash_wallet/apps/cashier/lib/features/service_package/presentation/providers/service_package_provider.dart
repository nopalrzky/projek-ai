import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:dio/dio.dart';
import '../../data/datasources/service_package_remote_datasource.dart';
import '../../data/repositories/service_package_repository_impl.dart';
import '../../domain/repositories/service_package_repository.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../bloc/service_package_cubit.dart';

class ServicePackageProvider {
  ServicePackageProvider._();

  static ServicePackageRemoteDatasource createRemoteDatasource(Dio dio, ApiEndpoints endpoints) {
    return ServicePackageRemoteDatasourceImpl(dio, endpoints);
  }

  static ServicePackageRepository createRepository(
    ServicePackageRemoteDatasource remoteDatasource,
  ) {
    return ServicePackageRepositoryImpl(remoteDatasource);
  }

  static GetAllUsecase createGetServicePackagesUsecase(
    ServicePackageRepository repository,
  ) {
    return GetAllUsecase(repository);
  }

  static GetByIdUsecase createGetServicePackageByIdUsecase(
    ServicePackageRepository repository,
  ) {
    return GetByIdUsecase(repository);
  }

  static ServicePackageCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final remoteDatasource = createRemoteDatasource(dio, endpoints);
    final repository = createRepository(remoteDatasource);

    final getPackages = createGetServicePackagesUsecase(repository);
    final getPackageById = createGetServicePackageByIdUsecase(repository);

    return ServicePackageCubit(
      getServicePackagesUsecase: getPackages,
      getServicePackageByIdUsecase: getPackageById,
    );
  }
}
