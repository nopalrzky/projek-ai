import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_home_data_usecase.dart';
import 'home_state.dart';

class HomeCubit extends Cubit<HomeState> {
  final GetHomeDataUsecase _getHomeDataUsecase;

  HomeCubit({required GetHomeDataUsecase getHomeDataUsecase})
    : _getHomeDataUsecase = getHomeDataUsecase,
      super(const HomeInitial());

  Future<void> loadHome() async {
    emit(const HomeLoading());

    final result = await _getHomeDataUsecase();

    result.when(
      success: (homeData) => emit(HomeLoaded(homeData: homeData)),
      failure: (failure) => emit(HomeError(failure.message)),
    );
  }

  Future<void> refresh() async {
    final result = await _getHomeDataUsecase();

    result.when(
      success: (homeData) => emit(HomeLoaded(homeData: homeData)),
      failure: (failure) => emit(HomeError(failure.message)),
    );
  }
}
