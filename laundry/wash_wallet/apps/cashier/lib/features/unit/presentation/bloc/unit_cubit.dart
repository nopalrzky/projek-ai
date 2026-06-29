import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/unit_usecases.dart';
import 'unit_state.dart';

class UnitCubit extends Cubit<UnitState> {
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
    if (page == 1) emit(const UnitLoading());

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
      success: (units) => emit(UnitsLoaded(units: units)),
      failure: (failure) => emit(UnitFailure(failure)),
    );
  }
}
