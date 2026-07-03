import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import 'membership_plan_state.dart';

class MembershipPlanCubit extends Cubit<MembershipPlanState>
    with TablePaginationCubitMixin<MembershipPlanState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;

  MembershipPlanCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       super(const MembershipPlanInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minDurationDays,
    int? maxDurationDays,
    double? minDiscountPercentage,
    double? maxDiscountPercentage,
    String sortBy = 'createdAt',
    String sortOrder = 'desc',
  }) async {
    if (page == 1) {
      emit(const MembershipPlanLoading());
    }

    final params = GetAllParams(
      page: page,
      perPage: perPage,
      search: search,
      outletId: outletId,
      isActive: isActive,
      minPrice: minPrice,
      maxPrice: maxPrice,
      minDurationDays: minDurationDays,
      maxDurationDays: maxDurationDays,
      minDiscountPercentage: minDiscountPercentage,
      maxDiscountPercentage: maxDiscountPercentage,
      sortBy: sortBy,
      sortOrder: sortOrder,
    );

    final result = await _getAllUsecase(params);

    result.when(
      success: (data) {
        final currentState = state;
        if (currentState is MembershipPlansLoaded && page > 1) {
          final updatedPlans = List.of(currentState.plans)..addAll(data.items);
          emit(
            MembershipPlansLoaded(
              updatedPlans,
              currentPage: data.currentPage,
              hasReachedMax: data.hasReachedMax,
              lastPage: data.lastPage,
              total: data.total,
              from: data.from,
              to: data.to,
              perPage: data.perPage,
            ),
          );
        } else {
          emit(
            MembershipPlansLoaded(
              data.items,
              currentPage: data.currentPage,
              hasReachedMax: data.hasReachedMax,
              lastPage: data.lastPage,
              total: data.total,
              from: data.from,
              to: data.to,
              perPage: data.perPage,
            ),
          );
        }
      },
      failure: (failure) => emit(MembershipPlanFailure(failure)),
    );
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  /// Always REPLACES membership plans — never appends.
  Future<void> changePage(
    int page, {
    String? search,
    int? outletId,
    bool? isActive,
    double? minPrice,
    double? maxPrice,
    int? minDurationDays,
    int? maxDurationDays,
    double? minDiscountPercentage,
    double? maxDiscountPercentage,
    String sortBy = 'createdAt',
    String sortOrder = 'desc',
  }) {
    final current = state;
    if (current is! MembershipPlansLoaded) return Future.value();
    return changePageGeneric<MembershipPlan>(
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
          minDurationDays: minDurationDays,
          maxDurationDays: maxDurationDays,
          minDiscountPercentage: minDiscountPercentage,
          maxDiscountPercentage: maxDiscountPercentage,
          sortBy: sortBy,
          sortOrder: sortOrder,
        ),
      ),
      markPageLoading: () => current.copyWith(isPageLoading: true),
      buildLoaded: (data) => MembershipPlansLoaded(
        data.items,
        hasReachedMax: data.hasReachedMax,
        currentPage: data.currentPage,
        lastPage: data.lastPage,
        total: data.total,
        from: data.from,
        to: data.to,
        perPage: data.perPage,
        isPageLoading: false,
      ),
      buildError: (f) => MembershipPlanFailure(ServerFailure(message: f.message)),
    );
  }

  Future<void> getById(int membershipPlanId) async {
    emit(const MembershipPlanLoading());

    final result = await _getByIdUsecase(membershipPlanId);

    result.when(
      success: (plan) => emit(MembershipPlanLoaded(plan)),
      failure: (failure) => emit(MembershipPlanFailure(failure)),
    );
  }

  void reset() {
    emit(const MembershipPlanInitial());
  }
}
