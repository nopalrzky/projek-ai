import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_all_usecase.dart';
import 'courier_schedule_state.dart';

class CourierScheduleCubit extends Cubit<CourierScheduleState> {
  final GetAllUsecase _getAllUsecase;

  CourierScheduleCubit({required GetAllUsecase getAllUsecase})
    : _getAllUsecase = getAllUsecase,
      super(const CourierScheduleInitial());

  Future<void> getAll({
    required int outletId,
    String? dayOfWeek,
    String? type,
    String? date,
  }) async {
    emit(CourierScheduleLoading());

    final result = await _getAllUsecase(
      outletId: outletId,
      dayOfWeek: dayOfWeek,
      type: type,
      date: date,
    );

    result.when(
      success: (data) => emit(CourierScheduleLoaded(data)),
      failure: (failure) => emit(CourierScheduleFailure(failure)),
    );
  }
}
