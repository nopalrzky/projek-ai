import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/start_usecase.dart';
import '../../domain/usecases/complete_usecase.dart';
import '../../domain/usecases/pickup_usecase.dart';
import '../../domain/usecases/confirm_pickup_usecase.dart';
import '../../domain/usecases/confirm_arrived_usecase.dart';
import 'order_state.dart';

class OrderCubit extends Cubit<OrderState>
    with TablePaginationCubitMixin<OrderState> {
  final GetAllUsecase _getAllUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final StartUsecase _startUsecase;
  final CompleteUsecase _completeOrderUsecase;
  final PickupUsecase _pickupUsecase;
  final ConfirmPickupUsecase _confirmPickupUsecase;
  final ConfirmArrivedUsecase _confirmArrivedUsecase;

  OrderCubit({
    required GetAllUsecase getAllUsecase,
    required GetByIdUsecase getByIdUsecase,
    required StartUsecase startUsecase,
    required CompleteUsecase completeUsecase,
    required PickupUsecase pickupUsecase,
    required ConfirmPickupUsecase confirmPickupUsecase,
    required ConfirmArrivedUsecase confirmArrivedUsecase,
  }) : _getAllUsecase = getAllUsecase,
       _getByIdUsecase = getByIdUsecase,
       _startUsecase = startUsecase,
       _completeOrderUsecase = completeUsecase,
       _pickupUsecase = pickupUsecase,
       _confirmPickupUsecase = confirmPickupUsecase,
       _confirmArrivedUsecase = confirmArrivedUsecase,
       super(const OrderInitial());

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

  Future<void> getById(int id) async {
    emit(const OrderDetailLoading());

    final result = await _getByIdUsecase(id);

    result.when(
      success: (order) => emit(OrderDetailLoaded(order: order)),
      failure: (failure) => emit(OrderDetailError(failure.message)),
    );
  }

  Future<void> refresh({
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
    final result = await _getAllUsecase(
      page: 1,
      perPage: 15,
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

    result.when(
      success: (paginatedOrders) => emit(
        OrdersLoaded(
          orders: paginatedOrders.items,
          hasReachedMax: paginatedOrders.hasReachedMax,
          currentPage: paginatedOrders.currentPage,
          lastPage: paginatedOrders.lastPage,
          total: paginatedOrders.total,
          from: paginatedOrders.from,
          to: paginatedOrders.to,
          perPage: paginatedOrders.perPage,
        ),
      ),
      failure: (failure) => emit(OrderError(failure.message)),
    );
  }

  Future<void> start({required int orderId, int? employeeId}) async {
    final result = await _startUsecase(
      orderId: orderId,
      employeeId: employeeId,
    );

    result.when(
      success: (order) => emit(OrderStarted(order: order)),
      failure: (failure) => emit(OrderError(failure.message)),
    );
  }

  Future<void> complete(int id) async {
    final result = await _completeOrderUsecase(id);

    result.when(
      success: (order) => emit(OrderCompleted(order: order)),
      failure: (failure) => emit(OrderError(failure.message)),
    );
  }

  Future<void> getPickupSchedule({
    required List<int> outletIds,
    required DateTime date,
    bool fetchAccepted = true,
    bool fetchInProgress = true,
    bool fetchPickedUp = false,
  }) async {
    emit(const OrderLoading());

    final dateStr =
        "${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}";

    final now = DateTime.now();
    final todayStart = DateTime(now.year, now.month, now.day);
    final selectedDateStart = DateTime(date.year, date.month, date.day);

    Result<PaginatedData<Order>>? scheduledResult;
    Result<PaginatedData<Order>>? inProgressResult;
    Result<PaginatedData<Order>>? pickedUpResult;

    if (fetchAccepted) {
      scheduledResult = await _getAllUsecase(
        status: 'accepted',
        outletIds: outletIds,
        forCourierPickupDate: dateStr,
        sortBy: 'pickupSchedule',
        sortDirection: 'asc',
        perPage: 100,
      );
    }

    if (fetchInProgress) {
      inProgressResult = await _getAllUsecase(
        status: 'picking_up',
        outletIds: outletIds,
        forCourierPickupDate: dateStr,
        sortBy: 'pickupSchedule',
        sortDirection: 'asc',
        perPage: 100,
      );
    }

    if (fetchPickedUp) {
      pickedUpResult = await _getAllUsecase(
        status: 'picked_up',
        outletIds: outletIds,
        forCourierPickupDate: dateStr,
        sortBy: 'pickupSchedule',
        sortDirection: 'asc',
        perPage: 100,
      );
    }

    List<Order> scheduledOrders = [];
    List<Order> overdueOrders = [];
    List<Order> inProgressOrders = [];

    if (fetchAccepted) {
      if (scheduledResult == null || scheduledResult.isFailure) {
        emit(
          OrderError(
            scheduledResult?.failureOrNull?.message ??
                'Failed to fetch scheduled orders',
          ),
        );
        return;
      }

      final allScheduled = scheduledResult.dataOrNull!.items;

      overdueOrders = allScheduled
          .where(
            (o) =>
                o.pickupSchedule != null &&
                o.pickupSchedule!.isBefore(todayStart),
          )
          .toList();

      final nextDay = selectedDateStart.add(const Duration(days: 1));
      scheduledOrders = allScheduled
          .where(
            (o) =>
                o.pickupSchedule != null &&
                !o.pickupSchedule!.isBefore(selectedDateStart) &&
                o.pickupSchedule!.isBefore(nextDay),
          )
          .toList();
    }

    if (fetchInProgress) {
      if (inProgressResult == null || inProgressResult.isFailure) {
        emit(
          OrderError(
            inProgressResult?.failureOrNull?.message ??
                'Failed to fetch in-progress orders',
          ),
        );
        return;
      }

      inProgressOrders = inProgressResult.dataOrNull!.items;
    }

    if (fetchPickedUp) {
      if (pickedUpResult == null || pickedUpResult.isFailure) {
        emit(
          OrderError(
            pickedUpResult?.failureOrNull?.message ??
                'Failed to fetch picked up orders',
          ),
        );
        return;
      }

      inProgressOrders = [...inProgressOrders, ...pickedUpResult.dataOrNull!.items];
      inProgressOrders.sort((a, b) {
        final aSchedule = a.pickupSchedule;
        final bSchedule = b.pickupSchedule;
        if (aSchedule == null && bSchedule == null) return 0;
        if (aSchedule == null) return 1;
        if (bSchedule == null) return -1;
        return aSchedule.compareTo(bSchedule);
      });
    }

    emit(
      PickupScheduleLoaded(
        scheduledOrders: scheduledOrders,
        overdueOrders: overdueOrders,
        inProgressOrders: inProgressOrders,
        selectedDate: date,
        outletIds: outletIds,
      ),
    );
  }

  Future<void> pickup(int orderId) async {
    final result = await _pickupUsecase(orderId);

    result.when(
      success: (order) {
        if (state is PickupScheduleLoaded) {
          final currentState = state as PickupScheduleLoaded;
          getPickupSchedule(
            outletIds: currentState.outletIds,
            date: currentState.selectedDate,
            fetchAccepted: true,
            fetchInProgress: true,
            fetchPickedUp: true,
          );
        } else {
          getPickupSchedule(
            outletIds: [order.outletId],
            date: DateTime.now(),
            fetchAccepted: true,
            fetchInProgress: true,
            fetchPickedUp: true,
          );
        }
      },
      failure: (failure) => emit(OrderError(failure.message)),
    );
  }

  Future<void> confirmPickup(int orderId, String photoPath) async {
    final previousState = state;
    emit(const OrderLoading());
    final result = await _confirmPickupUsecase(
      id: orderId,
      photoPath: photoPath,
    );

    result.when(
      success: (order) {
        if (previousState is PickupScheduleLoaded) {
          getPickupSchedule(
            outletIds: previousState.outletIds,
            date: previousState.selectedDate,
            fetchAccepted: true,
            fetchInProgress: true,
            fetchPickedUp: true,
          );
        } else {
          emit(OrderDetailLoaded(order: order));
        }
      },
      failure: (failure) => emit(OrderError(failure.message)),
    );
  }

  Future<void> confirmArrived(int orderId, String? photoPath) async {
    final previousState = state;
    emit(const OrderLoading());
    final result = await _confirmArrivedUsecase(
      id: orderId,
      photoPath: photoPath,
    );

    result.when(
      success: (order) {
        if (previousState is PickupScheduleLoaded) {
          getPickupSchedule(
            outletIds: previousState.outletIds,
            date: previousState.selectedDate,
            fetchAccepted: true,
            fetchInProgress: true,
            fetchPickedUp: true,
          );
        } else {
          emit(OrderDetailLoaded(order: order));
        }
      },
      failure: (failure) => emit(OrderError(failure.message)),
    );
  }

  void reset() {
    emit(const OrderInitial());
  }

  /// Called exclusively by [AppPagination.onPageChanged] on tablet.
  ///
  /// Always REPLACES the current list (never appends), and temporarily marks
  /// [OrdersLoaded.isPageLoading] so the pagination bar is disabled while
  /// the new page is loading.
  Future<void> changePage(
    int page, {
    String search = '',
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
}