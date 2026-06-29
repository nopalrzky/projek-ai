import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

import '../../../../core/services/location_service.dart';
import '../../../../core/services/places_service.dart';
import '../../../customer_address/data/datasources/customer_address_remote_datasource.dart';
import '../../../customer_address/data/repositories/customer_address_repository_impl.dart';
import '../../../customer_address/domain/repositories/customer_address_repository.dart';
import '../../../customer_address/domain/usecases/get_all_usecase.dart'
    as customer_address;
import '../../data/datasources/recent_address_local_datasource.dart';
import '../../data/repositories/recent_address_repository_impl.dart';
import '../../domain/repositories/recent_address_repository.dart';
import '../../domain/usecases/recent_address/get_all_usecase.dart'
    as recent_address;
import '../../domain/usecases/recent_address/save_usecase.dart'
    as recent_address;
import '../bloc/location_picker_cubit.dart';

class LocationPickerProvider {
  LocationPickerProvider._();

  static CustomerAddressRemoteDatasource createCustomerAddressRemoteDatasource(
    Dio dio,
    ApiEndpoints endpoints,
  ) {
    return CustomerAddressRemoteDatasourceImpl(dio, endpoints);
  }

  static CustomerAddressRepository createCustomerAddressRepository(
    CustomerAddressRemoteDatasource remoteDatasource,
  ) {
    return CustomerAddressRepositoryImpl(remoteDatasource);
  }

  static RecentAddressLocalDatasource createRecentAddressLocalDatasource() {
    return const RecentAddressLocalDatasourceImpl();
  }

  static RecentAddressRepository createRecentAddressRepository(
    RecentAddressLocalDatasource localDatasource,
  ) {
    return RecentAddressRepositoryImpl(localDatasource);
  }

  static customer_address.GetAllUsecase createCustomerAddressGetAllUsecase(
    CustomerAddressRepository repository,
  ) {
    return customer_address.GetAllUsecase(repository);
  }

  static recent_address.GetAllUsecase createRecentAddressGetAllUsecase(
    RecentAddressRepository repository,
  ) {
    return recent_address.GetAllUsecase(repository);
  }

  static recent_address.SaveUsecase createRecentAddressSaveUsecase(
    RecentAddressRepository repository,
  ) {
    return recent_address.SaveUsecase(repository);
  }

  static LocationPickerCubit createCubit(Dio dio, ApiEndpoints endpoints) {
    final customerRemoteDatasource = createCustomerAddressRemoteDatasource(
      dio,
      endpoints,
    );
    final customerRepository = createCustomerAddressRepository(
      customerRemoteDatasource,
    );
    final recentLocalDatasource = createRecentAddressLocalDatasource();
    final recentRepository = createRecentAddressRepository(
      recentLocalDatasource,
    );

    return LocationPickerCubit(
      getCustomerAddressesUsecase: createCustomerAddressGetAllUsecase(
        customerRepository,
      ),
      getRecentAddressesUsecase: createRecentAddressGetAllUsecase(
        recentRepository,
      ),
      saveRecentAddressUsecase: createRecentAddressSaveUsecase(
        recentRepository,
      ),
      locationService: LocationService(),
      placesService: PlacesService(dio),
    );
  }
}
