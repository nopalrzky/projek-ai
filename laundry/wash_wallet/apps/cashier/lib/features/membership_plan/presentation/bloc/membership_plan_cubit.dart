import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import 'membership_plan_state.dart';

class MembershipPlanCubit extends Cubit<MembershipPlanState> {
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
    emit(const MembershipPlanLoading());

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
      success: (plans) => emit(MembershipPlansLoaded(
        plans,
        currentPage: page,
        hasReachedMax: plans.length < perPage,
      )),
      failure: (failure) => emit(MembershipPlanFailure(failure)),
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
