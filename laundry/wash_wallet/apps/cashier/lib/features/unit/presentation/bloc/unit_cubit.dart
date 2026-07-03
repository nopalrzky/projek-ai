import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_domain/unit_usecases.dart';
import 'unit_state.dart';

class UnitCubit extends Cubit<UnitState> with TablePaginationCubitMixin<UnitState> {
  final GetAllUsecase _getAllUsecase;

  UnitCubit({required GetAllUsecase getAllUsecase})
    : _getAllUsecase = getAllUsecase,
      super(const UnitInitial());

  Future<void> getAll({
    String? search,
    int page = 1,
    int perPage = 15,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    bool? isActive,
  }) async {
    if (page == 1) {
      emit(const UnitLoading());
    }

    final params = GetAllParams(
      page: page,
      perPage: perPage,
      search: search,
      sortBy: sortBy,
      sortDirection: sortDirection,
      isActive: isActive,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (paginatedUnits) {
        if (page == 1) {
          emit(
            UnitsLoaded(
              units: paginatedUnits.items,
              hasReachedMax: paginatedUnits.hasReachedMax,
              currentPage: paginatedUnits.currentPage,
              lastPage: paginatedUnits.lastPage,
              total: paginatedUnits.total,
              from: paginatedUnits.from,
              to: paginatedUnits.to,
              perPage: paginatedUnits.perPage,
            ),
          );
        } else {
          final currentState = state;
          if (currentState is UnitsLoaded) {
            emit(
              currentState.copyWith(
                units: currentState.units + paginatedUnits.items,
                hasReachedMax: paginatedUnits.hasReachedMax,
                currentPage: paginatedUnits.currentPage,
                lastPage: paginatedUnits.lastPage,
                total: paginatedUnits.total,
                from: paginatedUnits.from,
                to: paginatedUnits.to,
                perPage: paginatedUnits.perPage,
              ),
            );
          }
        }
      },
      failure: (failure) => emit(UnitFailure(failure)),
    );
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  /// Always REPLACES units — never appends.
  Future<void> changePage(
    int page, {
    String? search,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    bool? isActive,
  }) {
    final current = state;
    if (current is! UnitsLoaded) return Future.value();
    return changePageGeneric<Unit>(
      page: page,
      currentPage: current.currentPage,
      lastPage: current.lastPage,
      request: () => _getAllUsecase(
        GetAllParams(
          page: page,
          perPage: current.perPage,
          search: search,
          sortBy: sortBy,
          sortDirection: sortDirection,
          isActive: isActive,
        ),
      ),
      markPageLoading: () => current.copyWith(isPageLoading: true),
      buildLoaded: (data) => UnitsLoaded(
        units: data.items,
        hasReachedMax: data.hasReachedMax,
        currentPage: data.currentPage,
        lastPage: data.lastPage,
        total: data.total,
        from: data.from,
        to: data.to,
        perPage: data.perPage,
        isPageLoading: false,
      ),
      buildError: (f) => UnitFailure(ServerFailure(message: f.message)),
    );
  }
}
