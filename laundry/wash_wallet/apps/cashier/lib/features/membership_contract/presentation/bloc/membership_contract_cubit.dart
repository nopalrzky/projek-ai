import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import 'membership_contract_state.dart';

class MembershipContractCubit extends Cubit<MembershipContractState>
    with TablePaginationCubitMixin<MembershipContractState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;

  MembershipContractCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       super(const MembershipContractInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? customerId,
    int? outletId,
    int? membershipPlanId,
    String? status,
    double? totalPaidMin,
    double? totalPaidMax,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
    bool refresh = false,
  }) async {
    if (refresh || page == 1) {
      emit(const MembershipContractLoading());
    }

    if (!refresh && state is MembershipContractLoading && page > 1) {
      return;
    }

    final params = GetAllParams(
      page: refresh ? 1 : page,
      perPage: perPage,
      search: search,
      customerId: customerId,
      outletId: outletId,
      membershipPlanId: membershipPlanId,
      status: status,
      totalPaidMin: totalPaidMin,
      totalPaidMax: totalPaidMax,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (data) {
        final currentState = state;

        if (currentState is MembershipContractsLoaded && params.page > 1) {
          final merged = List.of(currentState.contracts)..addAll(data.items);
          emit(
            MembershipContractsLoaded(
              contracts: merged,
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
            MembershipContractsLoaded(
              contracts: data.items,
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
      failure: (failure) => emit(MembershipContractFailure(failure)),
    );
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  /// Always REPLACES membership contracts — never appends.
  Future<void> changePage(
    int page, {
    String? search,
    int? customerId,
    int? outletId,
    int? membershipPlanId,
    String? status,
    double? totalPaidMin,
    double? totalPaidMax,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) {
    final current = state;
    if (current is! MembershipContractsLoaded) return Future.value();
    return changePageGeneric<MembershipContract>(
      page: page,
      currentPage: current.currentPage,
      lastPage: current.lastPage,
      request: () => _getAllUsecase(
        GetAllParams(
          page: page,
          perPage: current.perPage,
          search: search,
          customerId: customerId,
          outletId: outletId,
          membershipPlanId: membershipPlanId,
          status: status,
          totalPaidMin: totalPaidMin,
          totalPaidMax: totalPaidMax,
          sortBy: sortBy,
          sortDirection: sortDirection,
        ),
      ),
      markPageLoading: () => current.copyWith(isPageLoading: true),
      buildLoaded: (data) => MembershipContractsLoaded(
        contracts: data.items,
        hasReachedMax: data.hasReachedMax,
        currentPage: data.currentPage,
        lastPage: data.lastPage,
        total: data.total,
        from: data.from,
        to: data.to,
        perPage: data.perPage,
        isPageLoading: false,
      ),
      buildError: (f) => MembershipContractFailure(ServerFailure(message: f.message)),
    );
  }

  Future<void> getById(int id) async {
    emit(const MembershipContractLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (contract) => emit(MembershipContractDetailLoaded(contract)),
      failure: (failure) => emit(MembershipContractFailure(failure)),
    );
  }

  void reset() {
    emit(const MembershipContractInitial());
  }
}
