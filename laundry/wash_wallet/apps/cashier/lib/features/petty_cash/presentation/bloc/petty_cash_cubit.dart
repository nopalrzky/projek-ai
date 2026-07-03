import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import 'petty_cash_state.dart';

class PettyCashCubit extends Cubit<PettyCashState> with TablePaginationCubitMixin<PettyCashState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storePettyCashUsecase;
  final UpdateUsecase _updatePettyCashUsecase;

  PettyCashCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StoreUsecase storePettyCashUsecase,
    required UpdateUsecase updatePettyCashUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _storePettyCashUsecase = storePettyCashUsecase,
       _updatePettyCashUsecase = updatePettyCashUsecase,
       super(const PettyCashInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? cashierId,
    int? ownerId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    if (page == 1) {
      emit(const PettyCashLoading());
    }

    final params = GetAllParams(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      outletId: outletId,
      cashierId: cashierId,
      ownerId: ownerId,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (data) {
        if (page == 1) {
          emit(
            PettyCashesLoaded(
              pettyCashes: data.items,
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
          final currentState = state;
          if (currentState is PettyCashesLoaded) {
            emit(
              currentState.copyWith(
                pettyCashes: currentState.pettyCashes + data.items,
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
        }
      },
      failure: (failure) => emit(PettyCashFailure(failure)),
    );
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  /// Always REPLACES petty cashes — never appends.
  Future<void> changePage(
    int page, {
    String? search,
    String? status,
    int? outletId,
    int? cashierId,
    int? ownerId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) {
    final current = state;
    if (current is! PettyCashesLoaded) return Future.value();
    return changePageGeneric<PettyCash>(
      page: page,
      currentPage: current.currentPage,
      lastPage: current.lastPage,
      request: () => _getAllUsecase(
        GetAllParams(
          page: page,
          perPage: current.perPage,
          search: search,
          status: status,
          outletId: outletId,
          cashierId: cashierId,
          ownerId: ownerId,
          sortBy: sortBy,
          sortDirection: sortDirection,
        ),
      ),
      markPageLoading: () => current.copyWith(isPageLoading: true),
      buildLoaded: (data) => PettyCashesLoaded(
        pettyCashes: data.items,
        hasReachedMax: data.hasReachedMax,
        currentPage: data.currentPage,
        lastPage: data.lastPage,
        total: data.total,
        from: data.from,
        to: data.to,
        perPage: data.perPage,
        isPageLoading: false,
      ),
      buildError: (f) => PettyCashFailure(ServerFailure(message: f.message)),
    );
  }

  Future<void> loadPettyCashesByCashierId({
    required int cashierId,
    String? search,
    String? status,
  }) async {
    await getAll(search: search, status: status, cashierId: cashierId);
  }

  Future<void> getById(int id) async {
    emit(const PettyCashLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (pettyCash) => emit(PettyCashDetailLoaded(pettyCash)),
      failure: (failure) => emit(PettyCashFailure(failure)),
    );
  }

  Future<void> store({
    required double amount,
    required String description,
    required String requestDate,
  }) async {
    emit(const PettyCashLoading());

    final params = StoreParams(
      amount: amount,
      description: description,
      requestDate: requestDate,
    );

    final result = await _storePettyCashUsecase(params);

    result.when(
      success: (pettyCash) => emit(
        PettyCashActionSuccess(
          'Permintaan kas kecil berhasil dibuat dan menunggu persetujuan',
          pettyCash: pettyCash,
        ),
      ),
      failure: (failure) => emit(PettyCashFailure(failure)),
    );
  }

  Future<void> update({
    required int id,
    double? amount,
    String? description,
    String? requestDate,
  }) async {
    emit(const PettyCashLoading());

    final params = UpdateParams(
      id: id,
      amount: amount,
      description: description,
      requestDate: requestDate,
    );

    final result = await _updatePettyCashUsecase(params);

    result.when(
      success: (pettyCash) => emit(
        PettyCashActionSuccess(
          'Permintaan kas kecil berhasil diperbarui',
          pettyCash: pettyCash,
        ),
      ),
      failure: (failure) => emit(PettyCashFailure(failure)),
    );
  }

  /// Reset to initial state
  void reset() {
    emit(const PettyCashInitial());
  }
}
