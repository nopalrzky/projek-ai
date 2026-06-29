import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';

enum TopupStatus { initial, loading, success, historyLoaded, detailLoaded, error }

class TopupState extends Equatable {
  final TopupStatus status;
  final List<CustomerTopup> history;
  final CustomerTopup? lastCreatedTopup;
  final CustomerTopup? detail;
  final String? errorMessage;

  const TopupState({
    this.status = TopupStatus.initial,
    this.history = const [],
    this.lastCreatedTopup,
    this.detail,
    this.errorMessage,
  });

  TopupState copyWith({
    TopupStatus? status,
    List<CustomerTopup>? history,
    CustomerTopup? lastCreatedTopup,
    CustomerTopup? detail,
    String? errorMessage,
  }) {
    return TopupState(
      status: status ?? this.status,
      history: history ?? this.history,
      lastCreatedTopup: lastCreatedTopup ?? this.lastCreatedTopup,
      detail: detail ?? this.detail,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, history, lastCreatedTopup, detail, errorMessage];

  // Helper getters for backward compatibility / easier migration
  bool get isLoading => status == TopupStatus.loading;
  bool get isError => status == TopupStatus.error;
  bool get isSuccess => status == TopupStatus.success;
}

class TopupCubit extends Cubit<TopupState> {
  final StoreUsecase _createTopup;
  final GetAllUsecase _getHistory;
  final GetByIdUsecase _getDetail;

  TopupCubit({
    required StoreUsecase createTopup,
    required GetAllUsecase getHistory,
    required GetByIdUsecase getDetail,
  }) : _createTopup = createTopup,
       _getHistory = getHistory,
       _getDetail = getDetail,
       super(const TopupState());

  Future<void> createTopup(Map<String, dynamic> payload) async {
    emit(state.copyWith(status: TopupStatus.loading));
    final result = await _createTopup(payload);
    result.fold(
      (failure) => emit(state.copyWith(
        status: TopupStatus.error,
        errorMessage: failure.message,
      )),
      (topup) => emit(state.copyWith(
        status: TopupStatus.success,
        lastCreatedTopup: topup,
        detail: topup, // Also set as current detail
      )),
    );
  }

  Future<void> getHistory() async {
    emit(state.copyWith(status: TopupStatus.loading));
    final result = await _getHistory();
    result.fold(
      (failure) => emit(state.copyWith(
        status: TopupStatus.error,
        errorMessage: failure.message,
      )),
      (topups) => emit(state.copyWith(
        status: TopupStatus.historyLoaded,
        history: topups,
      )),
    );
  }

  Future<void> getDetail(int id) async {
    // Only show loading if we don't already have this detail or are in a different status
    if (state.status != TopupStatus.detailLoaded || state.detail?.id != id) {
      emit(state.copyWith(status: TopupStatus.loading));
    }
    
    final result = await _getDetail(id);
    result.fold(
      (failure) => emit(state.copyWith(
        status: TopupStatus.error,
        errorMessage: failure.message,
      )),
      (topup) => emit(state.copyWith(
        status: TopupStatus.detailLoaded,
        detail: topup,
      )),
    );
  }
}
