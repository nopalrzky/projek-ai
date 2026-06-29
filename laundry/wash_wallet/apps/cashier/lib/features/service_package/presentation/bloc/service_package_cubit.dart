import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import 'service_package_state.dart';

class ServicePackageCubit extends Cubit<ServicePackageState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;

  ServicePackageCubit({
    required GetAllUsecase getServicePackagesUsecase,
    required GetByIdUsecase getServicePackageByIdUsecase,
  }) : _getAllUsecase = getServicePackagesUsecase,
       _getByIdUsecase = getServicePackageByIdUsecase,
       super(const ServicePackageInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minValidityDays,
    int? maxValidityDays,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    if (page == 1) emit(const ServicePackageLoading());

    final params = GetAllParams(
      page: page,
      perPage: perPage,
      search: search,
      outletId: outletId,
      isActive: isActive,
      minPrice: minPrice,
      maxPrice: maxPrice,
      minValidityDays: minValidityDays,
      maxValidityDays: maxValidityDays,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (packages) {
        final currentState = state;
        if (currentState is ServicePackagesLoaded && page > 1) {
          final updatedPackages = List.of(currentState.packages)
            ..addAll(packages);
          emit(
            ServicePackagesLoaded(
              packages: updatedPackages,
              hasReachedMax: packages.length < perPage,
              currentPage: page,
            ),
          );
        } else {
          emit(
            ServicePackagesLoaded(
              packages: packages,
              hasReachedMax: packages.length < perPage,
              currentPage: page,
            ),
          );
        }
      },
      failure: (failure) => emit(ServicePackageFailure(failure)),
    );
  }

  Future<void> getById({required int servicePackageId}) async {
    emit(const ServicePackageLoading());

    final result = await _getByIdUsecase(servicePackageId);

    result.when(
      success: (package) => emit(ServicePackageDetailLoaded(package)),
      failure: (failure) => emit(ServicePackageFailure(failure)),
    );
  }

  Future<void> refreshServicePackages({
    int? outletId,
    String? search,
    bool? isActive,
  }) async {
    await getAll(
      page: 1,
      search: search,
      outletId: outletId,
      isActive: isActive,
    );
  }
}
