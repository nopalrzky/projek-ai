import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_home_data_usecase.dart';
import 'home_state.dart';

class HomeCubit extends Cubit<HomeState> {
  final GetHomeDataUsecase _getHomeDataUsecase;

  HomeCubit({required GetHomeDataUsecase getHomeDataUsecase})
    : _getHomeDataUsecase = getHomeDataUsecase,
      super(const HomeInitial());

  Future<void> getHomeData() async {
    emit(const HomeLoading());

    final result = await _getHomeDataUsecase();

    result.when(
      success: (homeData) => emit(
        HomeLoaded(
          employeeName: homeData.employeeName,
          employeePhone: homeData.employeePhone,
          cashBalance: homeData.cashBalance,
          ordersInProduction: homeData.ordersInProduction,
          ordersNotPickedUp: homeData.ordersNotPickedUp,
          ordersPickedUp: homeData.ordersPickedUp,
        ),
      ),
      failure: (failure) => emit(HomeError(failure)),
    );
  }

  Future<void> refresh() async {
    final result = await _getHomeDataUsecase();

    result.when(
      success: (homeData) => emit(
        HomeLoaded(
          employeeName: homeData.employeeName,
          employeePhone: homeData.employeePhone,
          cashBalance: homeData.cashBalance,
          ordersInProduction: homeData.ordersInProduction,
          ordersNotPickedUp: homeData.ordersNotPickedUp,
          ordersPickedUp: homeData.ordersPickedUp,
        ),
      ),
      failure: (failure) => emit(HomeError(failure)),
    );
  }
}
