import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import 'expense_state.dart';

class ExpenseCubit extends Cubit<ExpenseState> with TablePaginationCubitMixin<ExpenseState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;

  ExpenseCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StoreUsecase storeUsecase,
    required UpdateUsecase updateUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _storeUsecase = storeUsecase,
       _updateUsecase = updateUsecase,
       super(const ExpenseInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? outletId,
    int? employeeId,
    int? expenseAccountId,
    int? sourceAccountId,
    String? startDate,
    String? endDate,
    double? minAmount,
    double? maxAmount,
    bool? hasAttachment,
    String sortBy = 'date',
    String sortDirection = 'desc',
  }) async {
    if (page == 1) {
      emit(const ExpenseLoading());
    }

    final params = GetAllParams(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      outletId: outletId,
      employeeId: employeeId,
      expenseAccountId: expenseAccountId,
      sourceAccountId: sourceAccountId,
      startDate: startDate,
      endDate: endDate,
      minAmount: minAmount,
      maxAmount: maxAmount,
      hasAttachment: hasAttachment,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (data) {
        if (page == 1) {
          emit(
            ExpensesLoaded(
              expenses: data.items,
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
          if (currentState is ExpensesLoaded) {
            emit(
              currentState.copyWith(
                expenses: currentState.expenses + data.items,
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
      failure: (failure) => emit(ExpenseFailure(failure)),
    );
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  /// Always REPLACES expenses — never appends.
  Future<void> changePage(
    int page, {
    String? search,
    String? status,
    int? outletId,
    int? employeeId,
    int? expenseAccountId,
    int? sourceAccountId,
    String? startDate,
    String? endDate,
    double? minAmount,
    double? maxAmount,
    bool? hasAttachment,
    String sortBy = 'date',
    String sortDirection = 'desc',
  }) {
    final current = state;
    if (current is! ExpensesLoaded) return Future.value();
    return changePageGeneric<Expense>(
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
          employeeId: employeeId,
          expenseAccountId: expenseAccountId,
          sourceAccountId: sourceAccountId,
          startDate: startDate,
          endDate: endDate,
          minAmount: minAmount,
          maxAmount: maxAmount,
          hasAttachment: hasAttachment,
          sortBy: sortBy,
          sortDirection: sortDirection,
        ),
      ),
      markPageLoading: () => current.copyWith(isPageLoading: true),
      buildLoaded: (data) => ExpensesLoaded(
        expenses: data.items,
        hasReachedMax: data.hasReachedMax,
        currentPage: data.currentPage,
        lastPage: data.lastPage,
        total: data.total,
        from: data.from,
        to: data.to,
        perPage: data.perPage,
        isPageLoading: false,
      ),
      buildError: (f) => ExpenseFailure(ServerFailure(message: f.message)),
    );
  }

  Future<void> getById(int id) async {
    emit(const ExpenseLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (expense) => emit(ExpenseDetailLoaded(expense)),
      failure: (failure) => emit(ExpenseFailure(failure)),
    );
  }

  Future<void> store({
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
  }) async {
    emit(const ExpenseLoading());

    final params = StoreParams(
      outletId: outletId,
      expenseAccountId: expenseAccountId,
      sourceAccountId: sourceAccountId,
      amount: amount,
      date: date,
      description: description,
      attachmentPath: attachmentPath,
    );

    final result = await _storeUsecase(params);

    result.when(
      success: (expense) => emit(
        ExpenseActionSuccess('Pengeluaran berhasil dibuat', expense: expense),
      ),
      failure: (failure) => emit(ExpenseFailure(failure)),
    );
  }

  Future<void> update({
    required int id,
    required int outletId,
    required int expenseAccountId,
    int? sourceAccountId,
    required double amount,
    required String date,
    String? description,
    String? attachmentPath,
    bool removeAttachment = false,
  }) async {
    emit(const ExpenseLoading());

    final params = UpdateParams(
      id: id,
      outletId: outletId,
      expenseAccountId: expenseAccountId,
      sourceAccountId: sourceAccountId,
      amount: amount,
      date: date,
      description: description,
      attachmentPath: attachmentPath,
      removeAttachment: removeAttachment,
    );

    final result = await _updateUsecase(params);

    result.when(
      success: (expense) => emit(
        ExpenseActionSuccess(
          'Pengeluaran berhasil diperbarui',
          expense: expense,
        ),
      ),
      failure: (failure) => emit(ExpenseFailure(failure)),
    );
  }

  /// Reset to initial state
  void reset() {
    emit(const ExpenseInitial());
  }
}
