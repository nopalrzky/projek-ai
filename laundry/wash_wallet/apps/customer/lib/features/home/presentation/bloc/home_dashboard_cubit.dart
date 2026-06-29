import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/usecases/get_home_dashboard_usecase.dart';
import 'home_dashboard_state.dart';

class HomeDashboardCubit extends Cubit<HomeDashboardState> {
  final GetHomeDashboardUsecase _getHomeDashboardUsecase;

  HomeDashboardCubit({required GetHomeDashboardUsecase getHomeDashboardUsecase})
    : _getHomeDashboardUsecase = getHomeDashboardUsecase,
      super(const HomeDashboardInitial());

  Future<void> getHomeDashboard() async {
    emit(const HomeDashboardLoading());

    final result = await _getHomeDashboardUsecase();

    result.when(
      success: (dashboard) => emit(HomeDashboardSuccess(dashboard)),
      failure: (failure) => emit(HomeDashboardFailure(failure)),
    );
  }
}
