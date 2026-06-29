import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import 'membership_contract_state.dart';

class MembershipContractCubit extends Cubit<MembershipContractState> {
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
      success: (contracts) {
        final currentState = state;

        if (currentState is MembershipContractsLoaded && params.page > 1) {
          final merged = List.of(currentState.contracts)..addAll(contracts);
          emit(
            MembershipContractsLoaded(
              contracts: merged,
              hasReachedMax: contracts.length < perPage,
              currentPage: params.page,
            ),
          );
        } else {
          emit(
            MembershipContractsLoaded(
              contracts: contracts,
              hasReachedMax: contracts.length < perPage,
              currentPage: params.page,
            ),
          );
        }
      },
      failure: (failure) => emit(MembershipContractFailure(failure)),
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
