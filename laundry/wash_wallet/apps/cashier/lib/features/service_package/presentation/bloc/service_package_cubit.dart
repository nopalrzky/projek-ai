import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import 'service_package_state.dart';

class ServicePackageCubit extends Cubit<ServicePackageState> with TablePaginationCubitMixin<ServicePackageState> {
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
      success: (data) {
        final currentState = state;
        if (currentState is ServicePackagesLoaded && page > 1) {
          final updatedPackages = List.of(currentState.packages)
            ..addAll(data.items);
          emit(
            ServicePackagesLoaded(
              packages: updatedPackages,
              hasReachedMax: data.hasReachedMax,
              currentPage: data.currentPage,
              lastPage: data.lastPage,
              total: data.total,
              from: data.from,
              to: data.to,
              perPage: data.perPage,
            ),
          );
        } else {
          emit(
            ServicePackagesLoaded(
              packages: data.items,
              hasReachedMax: data.hasReachedMax,
              currentPage: data.currentPage,
              lastPage: data.lastPage,
              total: data.total,
              from: data.from,
              to: data.to,
              perPage: data.perPage,
            ),
          );
        }
      },
      failure: (failure) => emit(ServicePackageFailure(failure)),
    );
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  /// Always REPLACES packages — never appends.
  Future<void> changePage(
    int page, {
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minValidityDays,
    int? maxValidityDays,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) {
    final current = state;
    if (current is! ServicePackagesLoaded) return Future.value();
    return changePageGeneric<ServicePackage>(
      page: page,
      currentPage: current.currentPage,
      lastPage: current.lastPage,
      request: () => _getAllUsecase(
        GetAllParams(
          page: page,
          perPage: current.perPage,
          search: search,
          outletId: outletId,
          isActive: isActive,
          minPrice: minPrice,
          maxPrice: maxPrice,
          minValidityDays: minValidityDays,
          maxValidityDays: maxValidityDays,
          sortBy: sortBy,
          sortDirection: sortDirection,
        ),
      ),
      markPageLoading: () => current.copyWith(isPageLoading: true),
      buildLoaded: (data) => ServicePackagesLoaded(
        packages: data.items,
        hasReachedMax: data.hasReachedMax,
        currentPage: data.currentPage,
        lastPage: data.lastPage,
        total: data.total,
        from: data.from,
        to: data.to,
        perPage: data.perPage,
        isPageLoading: false,
      ),
      buildError: (f) => ServicePackageFailure(ServerFailure(message: f.message)),
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
