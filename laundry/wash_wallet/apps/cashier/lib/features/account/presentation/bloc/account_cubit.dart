import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_all_usecase.dart';
import 'account_state.dart';

class AccountCubit extends Cubit<AccountState> {
  final GetAllUsecase _getAllUsecase;

  AccountCubit({required GetAllUsecase getAllUsecase})
    : _getAllUsecase = getAllUsecase,
      super(const AccountInitial());

  Future<void> getAll({required int outletId, required String type}) async {
    emit(const AccountLoading());
    final result = await _getAllUsecase(
      GetAllParams(outletId: outletId, type: type),
    );
    result.when(
      success: (accounts) => emit(AccountsLoaded(accounts)),
      failure: (failure) => emit(AccountFailure(failure)),
    );
  }

  Future<void> loadFundingAccounts(int outletId) async {
    await getAll(outletId: outletId, type: 'funding');
  }

  Future<void> loadTransferAccounts(int outletId) async {
    await getAll(outletId: outletId, type: 'transfer');
  }

  Future<void> loadExpenseAccounts(int outletId) async {
    await getAll(outletId: outletId, type: 'expense');
  }
}
