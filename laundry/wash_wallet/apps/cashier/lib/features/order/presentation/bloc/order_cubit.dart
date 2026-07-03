import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/update_usecase.dart';
import '../../domain/usecases/get_draft_usecase.dart';
import '../../domain/usecases/save_draft_usecase.dart';
import '../../domain/usecases/clear_draft_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import '../../domain/usecases/accept_usecase.dart';
import '../../domain/usecases/reject_usecase.dart';
import '../../domain/usecases/weigh_usecase.dart';
import '../../domain/usecases/start_usecase.dart';
import '../../domain/usecases/get_new_order_count_usecase.dart';
import '../../domain/usecases/save_weighing_draft_usecase.dart';
import '../../domain/usecases/get_weighing_draft_usecase.dart';
import '../../domain/usecases/clear_weighing_draft_usecase.dart';
import 'order_state.dart';

class OrderCubit extends Cubit<OrderState> with TablePaginationCubitMixin<OrderState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StoreUsecase _storeUsecase;
  final UpdateUsecase _updateUsecase;
  final GetDraftUsecase _getDraftUsecase;
  final SaveDraftUsecase _saveDraftUsecase;
  final ClearDraftUsecase _clearDraftUsecase;
  final SaveWeighingDraftUsecase _saveWeighingDraftUsecase;
  final GetWeighingDraftUsecase _getWeighingDraftUsecase;
  final ClearWeighingDraftUsecase _clearWeighingDraftUsecase;
  final CompleteUsecase _completeUsecase;
  final AcceptUsecase _acceptUsecase;
  final RejectUsecase _rejectUsecase;
  final WeighUsecase _weighUsecase;
  final StartUsecase _startUsecase;
  final GetNewOrderCountUsecase _getNewOrderCountUsecase;

  OrderCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StoreUsecase storeUsecase,
    required UpdateUsecase updateUsecase,
    required GetDraftUsecase getDraftUsecase,
    required SaveDraftUsecase saveDraftUsecase,
    required ClearDraftUsecase clearDraftUsecase,
    required SaveWeighingDraftUsecase saveWeighingDraftUsecase,
    required GetWeighingDraftUsecase getWeighingDraftUsecase,
    required ClearWeighingDraftUsecase clearWeighingDraftUsecase,
    required CompleteUsecase completeUsecase,
    required AcceptUsecase acceptUsecase,
    required RejectUsecase rejectUsecase,
    required WeighUsecase weighUsecase,
    required StartUsecase startUsecase,
    required GetNewOrderCountUsecase getNewOrderCountUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _storeUsecase = storeUsecase,
       _updateUsecase = updateUsecase,
       _getDraftUsecase = getDraftUsecase,
       _saveDraftUsecase = saveDraftUsecase,
       _clearDraftUsecase = clearDraftUsecase,
       _saveWeighingDraftUsecase = saveWeighingDraftUsecase,
       _getWeighingDraftUsecase = getWeighingDraftUsecase,
       _clearWeighingDraftUsecase = clearWeighingDraftUsecase,
       _completeUsecase = completeUsecase,
       _acceptUsecase = acceptUsecase,
       _rejectUsecase = rejectUsecase,
       _weighUsecase = weighUsecase,
       _startUsecase = startUsecase,
       _getNewOrderCountUsecase = getNewOrderCountUsecase,
       super(const OrderInitial());

  int _requestGeneration = 0;

  Future<void> getAll({
    int page = 1,
    int perPage = 15,
    String search = "",
    String? status,
    String? paymentStatus,
    int? outletId,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  }) async {
    final generation = ++_requestGeneration;
    if (page == 1) {
      emit(const OrderLoading());
    }

    final result = await _getAllUsecase(
      page: page,
      perPage: perPage,
      search: search,
      status: status,
      paymentStatus: paymentStatus,
      outletId: outletId,
      customerId: customerId,
      employeeId: employeeId,
      orderDateFrom: orderDateFrom,
      orderDateTo: orderDateTo,
      estimatedCompletionFrom: estimatedCompletionFrom,
      estimatedCompletionTo: estimatedCompletionTo,
      totalAmountMin: totalAmountMin,
      totalAmountMax: totalAmountMax,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );

    if (generation != _requestGeneration) return;

    result.when(
      success: (data) {
        if (page == 1) {
          emit(
            OrdersLoaded(
              orders: data.items,
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
          if (currentState is OrdersLoaded) {
            emit(
              currentState.copyWith(
                orders: currentState.orders + data.items,
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
      failure: (failure) => emit(OrderError(failure.message)),
    );
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  /// Always REPLACES orders — never appends.
  Future<void> changePage(
    int page, {
    String search = "",
    String? status,
    String? paymentStatus,
    int? outletId,
    int? customerId,
    int? employeeId,
    String? orderDateFrom,
    String? orderDateTo,
    String? estimatedCompletionFrom,
    String? estimatedCompletionTo,
    double? totalAmountMin,
    double? totalAmountMax,
    String sortBy = 'orderDate',
    String sortDirection = 'desc',
  }) {
    final current = state;
    if (current is! OrdersLoaded) return Future.value();
    return changePageGeneric<Order>(
      page: page,
      currentPage: current.currentPage,
      lastPage: current.lastPage,
      request: () => _getAllUsecase(
        page: page,
        perPage: current.perPage,
        search: search,
        status: status,
        paymentStatus: paymentStatus,
        outletId: outletId,
        customerId: customerId,
        employeeId: employeeId,
        orderDateFrom: orderDateFrom,
        orderDateTo: orderDateTo,
        estimatedCompletionFrom: estimatedCompletionFrom,
        estimatedCompletionTo: estimatedCompletionTo,
        totalAmountMin: totalAmountMin,
        totalAmountMax: totalAmountMax,
        sortBy: sortBy,
        sortDirection: sortDirection,
      ),
      markPageLoading: () => current.copyWith(isPageLoading: true),
      buildLoaded: (data) => OrdersLoaded(
        orders: data.items,
        hasReachedMax: data.hasReachedMax,
        currentPage: data.currentPage,
        lastPage: data.lastPage,
        total: data.total,
        from: data.from,
        to: data.to,
        perPage: data.perPage,
        isPageLoading: false,
      ),
      buildError: (f) => OrderError(f.message),
    );
  }

  Future<void> getById(int id) async {
    emit(const OrderLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (order) => emit(OrderDetailLoaded(order: order)),
      failure: (failure) => emit(OrderDetailError(failure.message)),
    );
  }

  Future<Order?> fetchOrderSilently(int id) async {
    final result = await _getByIdUsecase(id);
    return result.when(success: (order) => order, failure: (_) => null);
  }

  Future<void> store(StoreParams params, {required int outletId}) async {
    emit(const OrderLoading());

    final result = await _storeUsecase(params);

    result.when(
      success: (order) async {
        await clearDraft(
          customerId: params.customerId,
          outletId: outletId,
          employeeId: params.employeeId,
        );
        emit(OrderActionSuccess('Order berhasil dibuat', order: order));
      },
      failure: (failure) async {
        if (failure is NetworkFailure || failure is ServerFailure) {
          final draftResult = await _getDraftUsecase(
            GetDraftParams(
              customerId: params.customerId,
              outletId: outletId,
              employeeId: params.employeeId,
            ),
          );
          draftResult.when(
            success: (draft) {
              if (draft != null) {
                final failedDraft = draft.copyWith(
                  status: 'submit_failed',
                  lastError: failure.message,
                );
                _saveDraftUsecase(failedDraft);
              }
            },
            failure: (_) {},
          );
        }
        emit(OrderFailure(failure));
      },
    );
  }

  Future<void> update(UpdateParams params) async {
    emit(const OrderLoading());

    final result = await _updateUsecase(params);

    result.when(
      success: (order) =>
          emit(OrderActionSuccess('Order berhasil diperbarui', order: order)),
      failure: (failure) => emit(OrderFailure(failure)),
    );
  }

  Future<void> complete(int orderId) async {
    emit(const OrderLoading());
    final result = await _completeUsecase(
      orderId,
      clientRequestId: IdempotencyKey.generate(),
    );
    result.when(
      success: (order) => emit(
        OrderActionSuccess('Pesanan berhasil diselesaikan', order: order),
      ),
      failure: (failure) => emit(OrderFailure(failure)),
    );
  }

  Future<void> accept(int orderId) async {
    emit(const OrderLoading());
    final result = await _acceptUsecase(
      orderId,
      clientRequestId: IdempotencyKey.generate(),
    );
    result.when(
      success: (order) =>
          emit(OrderActionSuccess('Pesanan berhasil diterima', order: order)),
      failure: (failure) => emit(OrderFailure(failure)),
    );
  }

  Future<void> reject(RejectParams params) async {
    emit(const OrderLoading());
    final result = await _rejectUsecase(
      params,
      clientRequestId: IdempotencyKey.generate(),
    );
    result.when(
      success: (order) =>
          emit(OrderActionSuccess('Pesanan berhasil ditolak', order: order)),
      failure: (failure) => emit(OrderFailure(failure)),
    );
  }

  Future<void> weigh(WeighParams params, {required int outletId}) async {
    emit(const OrderLoading());
    final result = await _weighUsecase(params);
    result.when(
      success: (order) {
        clearWeighingDraft(
          orderId: params.orderId,
          employeeId: params.employeeId,
          outletId: order.outletId,
        );
        emit(OrderActionSuccess('Penimbangan berhasil disimpan', order: order));
      },
      failure: (failure) async {
        if (failure is NetworkFailure || failure is ServerFailure) {
          final draftResult = await _getWeighingDraftUsecase(
            GetWeighingDraftParams(
              orderId: params.orderId,
              employeeId: params.employeeId,
              outletId: outletId,
            ),
          );
          draftResult.when(
            success: (draft) {
              if (draft != null) {
                final failedDraft = draft.copyWith(
                  status: 'submit_failed',
                  lastError: failure.message,
                );
                _saveWeighingDraftUsecase(failedDraft);
              }
            },
            failure: (_) {},
          );
        }
        emit(OrderFailure(failure));
      },
    );
  }

  Future<void> start(int orderId) async {
    emit(const OrderLoading());
    final result = await _startUsecase(
      orderId,
      clientRequestId: IdempotencyKey.generate(),
    );
    result.when(
      success: (order) =>
          emit(OrderActionSuccess('Pesanan berhasil dimulai', order: order)),
      failure: (failure) => emit(OrderFailure(failure)),
    );
  }

  Future<void> loadDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  }) async {
    final params = GetDraftParams(
      customerId: customerId,
      outletId: outletId,
      employeeId: employeeId,
    );
    final result = await _getDraftUsecase(params);

    result.when(
      success: (draft) => emit(OrderDraftLoaded(draft: draft)),
      failure: (failure) => emit(const OrderDraftLoaded(draft: null)),
    );
  }

  Future<void> saveDraft(OrderDraft draft) async {
    await _saveDraftUsecase(draft);
  }

  Future<void> clearDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  }) async {
    final params = ClearDraftParams(
      customerId: customerId,
      outletId: outletId,
      employeeId: employeeId,
    );
    await _clearDraftUsecase(params);
  }

  Future<void> loadWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  }) async {
    final params = GetWeighingDraftParams(
      orderId: orderId,
      employeeId: employeeId,
      outletId: outletId,
    );
    final result = await _getWeighingDraftUsecase(params);

    result.when(
      success: (draft) => emit(OrderWeighingDraftLoaded(draft: draft)),
      failure: (failure) => emit(const OrderWeighingDraftLoaded(draft: null)),
    );
  }

  Future<void> saveWeighingDraft(WeighingDraft draft) async {
    await _saveWeighingDraftUsecase(draft);
  }

  Future<void> clearWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  }) async {
    final params = ClearWeighingDraftParams(
      orderId: orderId,
      employeeId: employeeId,
      outletId: outletId,
    );
    await _clearWeighingDraftUsecase(params);
  }

  Future<int> getNewOrderCount() async {
    final result = await _getNewOrderCountUsecase();
    return result.when(success: (count) => count, failure: (_) => 0);
  }
}
