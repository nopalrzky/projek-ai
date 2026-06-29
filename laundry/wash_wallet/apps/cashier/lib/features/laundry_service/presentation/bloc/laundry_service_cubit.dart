import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_all_usecase.dart';
import 'laundry_service_state.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/destroy_usecase.dart';

class LaundryServiceCubit extends Cubit<LaundryServiceState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;
  final DestroyUsecase _destroyUsecase;

  LaundryServiceCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StoreUsecase storeUsecase,
    required UpdateUsecase updateUsecase,
    required DestroyUsecase destroyUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _storeUsecase = storeUsecase,
       _updateUsecase = updateUsecase,
       _destroyUsecase = destroyUsecase,
       super(const LaundryServiceInitial());

  Future<void> getAll({
    int page = 1,
    String? search,
    int? outletId,
    int? categoryId,
    int? unitId,
    bool? isActive,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    if (page == 1) {
      emit(const LaundryServiceLoading());
    }

    final params = GetAllParams(
      page: page,
      search: search,
      outletId: outletId,
      categoryId: categoryId,
      unitId: unitId,
      isActive: isActive,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (services) {
        if (page == 1) {
          emit(
            LaundryServicesLoaded(
              services: services,
              hasReachedMax: services.length < 15,
              currentPage: page,
            ),
          );
        } else {
          final currentState = state;
          if (currentState is LaundryServicesLoaded) {
            emit(
              currentState.copyWith(
                services: currentState.services + services,
                hasReachedMax: services.isEmpty || services.length < 15,
                currentPage: page,
              ),
            );
          }
        }
      },
      failure: (failure) => emit(LaundryServiceFailure(failure)),
    );
  }

  Future<void> getById(int id) async {
    emit(const LaundryServiceLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (service) => emit(LaundryServiceDetailLoaded(service: service)),
      failure: (failure) => emit(LaundryServiceFailure(failure)),
    );
  }

  Future<void> store({
    required int unitId,
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int durationHours,
    int minQuantity = 1,
  }) async {
    emit(const LaundryServiceLoading());

    final params = StoreParams(
      unitId: unitId,
      categoryId: categoryId,
      name: name,
      description: description,
      price: price,
      durationHours: durationHours,
      minQuantity: minQuantity,
    );

    final result = await _storeUsecase(params);

    result.when(
      success: (service) => emit(
        LaundryServiceActionSuccess(
          'Layanan laundry berhasil dibuat',
          service: service,
        ),
      ),
      failure: (failure) => emit(LaundryServiceFailure(failure)),
    );
  }

  Future<void> update({
    required int id,
    int? unitId,
    int? categoryId,
    String? name,
    String? description,
    double? price,
    int? durationHours,
    int? minQuantity,
    bool? isActive,
  }) async {
    emit(const LaundryServiceLoading());

    final params = UpdateParams(
      id: id,
      unitId: unitId,
      categoryId: categoryId,
      name: name,
      description: description,
      price: price,
      durationHours: durationHours,
      minQuantity: minQuantity,
      isActive: isActive,
    );

    final result = await _updateUsecase(params);

    result.when(
      success: (service) => emit(
        LaundryServiceActionSuccess(
          'Layanan laundry berhasil diperbarui',
          service: service,
        ),
      ),
      failure: (failure) => emit(LaundryServiceFailure(failure)),
    );
  }

  Future<void> destroy(int id) async {
    emit(const LaundryServiceLoading());

    final result = await _destroyUsecase(id);

    result.when(
      success: (_) => emit(
        const LaundryServiceActionSuccess('Layanan laundry berhasil dihapus'),
      ),
      failure: (failure) => emit(LaundryServiceFailure(failure)),
    );
  }
}
