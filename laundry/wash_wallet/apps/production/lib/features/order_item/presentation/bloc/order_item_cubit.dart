import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/start_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import 'order_item_state.dart';

class OrderItemCubit extends Cubit<OrderItemState>
    with TablePaginationCubitMixin<OrderItemState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StartUsecase _startUsecase;
  final CompleteUsecase _completeUsecase;

  OrderItemCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StartUsecase startUsecase,
    required CompleteUsecase completeUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _startUsecase = startUsecase,
       _completeUsecase = completeUsecase,
       super(const OrderItemInitial());

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String? search,
    String? status,
    int? orderId,
    int? laundryServiceId,
    int? customerId,
    String? startedAtFrom,
    String? startedAtTo,
    String? completedAtFrom,
    String? completedAtTo,
    String? createdAtFrom,
    String? createdAtTo,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) async {
    if (page == 1) {
      emit(const OrderItemLoading());
    }

    final result = await _getAllUsecase(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      orderId: orderId,
      laundryServiceId: laundryServiceId,
      customerId: customerId,
      startedAtFrom: startedAtFrom,
      startedAtTo: startedAtTo,
      completedAtFrom: completedAtFrom,
      completedAtTo: completedAtTo,
      createdAtFrom: createdAtFrom,
      createdAtTo: createdAtTo,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    result.when(
      success: (data) {
        if (page == 1) {
          emit(
            OrderItemsLoaded(
              orderItems: data.items,
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
          final currentState = state;
          if (currentState is OrderItemsLoaded) {
            emit(
              currentState.copyWith(
                orderItems: currentState.orderItems + data.items,
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
        }
      },
      failure: (failure) => emit(OrderItemError(failure.message)),
    );
  }

  Future<void> getById(int id) async {
    emit(const OrderItemDetailLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (item) => emit(OrderItemDetailLoaded(orderItem: item)),
      failure: (failure) => emit(OrderItemDetailError(failure.message)),
    );
  }

  Future<void> start(int id) async {
    final result = await _startUsecase(id);

    result.when(
      success: (item) => emit(OrderItemStarted(orderItem: item)),
      failure: (failure) => emit(OrderItemError(failure.message)),
    );
  }

  Future<void> complete({required int id, String? notes}) async {
    final result = await _completeUsecase(id: id, notes: notes);

    result.when(
      success: (item) => emit(OrderItemCompleted(orderItem: item)),
      failure: (failure) => emit(OrderItemError(failure.message)),
    );
  }

  void reset() {
    emit(const OrderItemInitial());
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  /// Always REPLACES items — never appends.
  Future<void> changePage(
    int page, {
    String? search,
    String? status,
    int? orderId,
    int? laundryServiceId,
    int? customerId,
    String? startedAtFrom,
    String? startedAtTo,
    String? completedAtFrom,
    String? completedAtTo,
    String? createdAtFrom,
    String? createdAtTo,
    String sortBy = 'createdAt',
    String sortDirection = 'desc',
  }) {
    final current = state;
    if (current is! OrderItemsLoaded) return Future.value();
    return changePageGeneric<OrderItem>(
      page: page,
      currentPage: current.currentPage,
      lastPage: current.lastPage,
      request: () => _getAllUsecase(
        page: page,
        perPage: current.perPage,
        search: search,
        status: status,
        orderId: orderId,
        laundryServiceId: laundryServiceId,
        customerId: customerId,
        startedAtFrom: startedAtFrom,
        startedAtTo: startedAtTo,
        completedAtFrom: completedAtFrom,
        completedAtTo: completedAtTo,
        createdAtFrom: createdAtFrom,
        createdAtTo: createdAtTo,
        sortBy: sortBy,
        sortDirection: sortDirection,
      ),
      markPageLoading: () => current.copyWith(isPageLoading: true),
      buildLoaded: (data) => OrderItemsLoaded(
        orderItems: data.items,
        hasReachedMax: data.hasReachedMax,
        currentPage: data.currentPage,
        lastPage: data.lastPage,
        total: data.total,
        from: data.from,
        to: data.to,
        perPage: data.perPage,
        isPageLoading: false,
      ),
      buildError: (f) => OrderItemError(f.message),
    );
  }
}