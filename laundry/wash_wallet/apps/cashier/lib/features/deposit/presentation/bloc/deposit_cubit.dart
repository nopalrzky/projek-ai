import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import 'deposit_state.dart';

class DepositCubit extends Cubit<DepositState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;

  DepositCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StoreUsecase storeUsecase,
    required UpdateUsecase updateUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _storeUsecase = storeUsecase,
       _updateUsecase = updateUsecase,
       super(const DepositInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? ownerId,
    String? status,
    int? outletId,
    int? cashierId,
    String sortBy = 'created_at',
    String sortDirection = 'desc',
  }) async {
    if (page == 1) {
      emit(const DepositLoading());
    }

    final params = GetAllParams(
      page: page,
      perPage: perPage,
      search: search,
      ownerId: ownerId,
      status: status,
      outletId: outletId,
      cashierId: cashierId,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (deposits) {
        if (page == 1) {
          emit(
            DepositsLoaded(
              deposits: deposits,
              hasReachedMax: deposits.length < perPage,
              currentPage: page,
            ),
          );
        } else {
          final currentState = state;
          if (currentState is DepositsLoaded) {
            emit(
              currentState.copyWith(
                deposits: currentState.deposits + deposits,
                hasReachedMax: deposits.isEmpty || deposits.length < perPage,
                currentPage: page,
              ),
            );
          }
        }
      },
      failure: (failure) => emit(DepositFailure(failure)),
    );
  }

  Future<void> getById(int id) async {
    emit(const DepositLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (deposit) => emit(DepositDetailLoaded(deposit)),
      failure: (failure) => emit(DepositFailure(failure)),
    );
  }

  Future<void> store({
    required int destinationAccountId,
    required double amount,
    String? notes,
    String? attachmentPath,
  }) async {
    emit(const DepositLoading());

    final params = StoreParams(
      destinationAccountId: destinationAccountId,
      amount: amount,
      notes: notes,
      attachmentPath: attachmentPath,
    );

    final result = await _storeUsecase(params);

    result.when(
      success: (deposit) => emit(
        DepositActionSuccess(
          'Setoran berhasil dibuat dan menunggu persetujuan',
          deposit: deposit,
        ),
      ),
      failure: (failure) => emit(DepositFailure(failure)),
    );
  }

  Future<void> update({
    required int id,
    int? destinationAccountId,
    double? amount,
    String? notes,
    String? attachmentPath,
  }) async {
    emit(const DepositLoading());

    final params = UpdateParams(
      id: id,
      destinationAccountId: destinationAccountId,
      amount: amount,
      notes: notes,
      attachmentPath: attachmentPath,
    );

    final result = await _updateUsecase(params);

    result.when(
      success: (deposit) => emit(
        DepositActionSuccess('Setoran berhasil diperbarui', deposit: deposit),
      ),
      failure: (failure) => emit(DepositFailure(failure)),
    );
  }

  void reset() {
    emit(const DepositInitial());
  }
}
