import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/start_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import 'order_item_process_state.dart';

class OrderItemProcessCubit extends Cubit<OrderItemProcessState> {
  final StartUsecase _startUsecase;
  final CompleteUsecase _completeUsecase;

  OrderItemProcessCubit({
    required StartUsecase startUsecase,
    required CompleteUsecase completeUsecase,
  }) : _startUsecase = startUsecase,
       _completeUsecase = completeUsecase,
       super(const OrderItemProcessInitial());

  Future<void> start(int id) async {
    emit(const OrderItemProcessLoading());

    final result = await _startUsecase(id);

    result.when(
      success: (process) => emit(OrderItemProcessStarted(process)),
      failure: (failure) => emit(OrderItemProcessError(failure.message)),
    );
  }

  Future<void> complete(int id) async {
    emit(const OrderItemProcessLoading());

    final result = await _completeUsecase(id);

    result.when(
      success: (process) => emit(OrderItemProcessCompleted(process)),
      failure: (failure) => emit(OrderItemProcessError(failure.message)),
    );
  }

  void reset() {
    emit(const OrderItemProcessInitial());
  }
}
