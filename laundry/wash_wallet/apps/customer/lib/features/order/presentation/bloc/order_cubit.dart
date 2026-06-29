import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../../courier_schedule/domain/entities/courier_schedule.dart';
import '../../../customer_address/domain/entities/customer_address.dart';
import '../../domain/entities/create_order_params.dart';
import '../../domain/usecases/cancel_usecase.dart';
import '../../domain/usecases/get_all_usecase.dart';
import '../../domain/usecases/get_by_id_usecase.dart';
import '../../domain/usecases/store_usecase.dart';
import '../../domain/usecases/pay_order_usecase.dart';
import '../../domain/usecases/schedule_delivery_usecase.dart';
import '../../domain/entities/schedule_delivery_params.dart';
import '../../domain/usecases/complete_usecase.dart';
import '../../domain/usecases/submit_review_usecase.dart';
import '../../domain/entities/submit_review_params.dart';
import 'order_state.dart';

class OrderCubit extends Cubit<OrderState> {
  final GetAllUsecase _getAllUsecase;
  final StoreUsecase _storeUsecase;
  final CancelUsecase _cancelUsecase;
  final GetByIdUsecase _getByIdUsecase;
  final PayOrderUseCase _payOrderUseCase;
  final ScheduleDeliveryUseCase _scheduleDeliveryUseCase;
  final CompleteUsecase _completeUsecase;
  final SubmitReviewUseCase _submitReviewUseCase;

  OrderCubit({
    required GetAllUsecase getAllUsecase,
    required StoreUsecase storeUsecase,
    required CancelUsecase cancelUsecase,
    required GetByIdUsecase getByIdUsecase,
    required PayOrderUseCase payOrderUseCase,
    required ScheduleDeliveryUseCase scheduleDeliveryUseCase,
    required CompleteUsecase completeUsecase,
    required SubmitReviewUseCase submitReviewUseCase,
  }) : _getAllUsecase = getAllUsecase,
       _storeUsecase = storeUsecase,
       _cancelUsecase = cancelUsecase,
       _getByIdUsecase = getByIdUsecase,
       _payOrderUseCase = payOrderUseCase,
       _scheduleDeliveryUseCase = scheduleDeliveryUseCase,
       _completeUsecase = completeUsecase,
       _submitReviewUseCase = submitReviewUseCase,
       super(const OrderState());

  Future<void> getAll({
    required int customerAccountId,
    int page = 1,
    String? search,
    String? status,
    bool isRefresh = false,
  }) async {
    if (state.hasReachedMax && !isRefresh && page > 1) return;

    if (page == 1 || isRefresh) {
      emit(
        state.copyWith(
          isFetchingOrders: true,
          errorMessage: null,
          hasReachedMax: false,
          currentPage: 1,
        ),
      );
    } else {
      emit(state.copyWith(isFetchingOrders: true, errorMessage: null));
    }

    final result = await _getAllUsecase(
      GetAllOrderParams(
        customerAccountId: customerAccountId,
        page: page,
        search: search,
        status: status,
      ),
    );

    result.when(
      success: (orders) {
        emit(
          state.copyWith(
            isFetchingOrders: false,
            orders: page == 1 || isRefresh
                ? orders
                : [...state.orders, ...orders],
            hasReachedMax: orders.isEmpty || orders.length < 15,
            currentPage: page,
          ),
        );
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isFetchingOrders: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  Future<void> getById(int orderId) async {
    emit(state.copyWith(isFetchingOrderDetail: true, errorMessage: null));

    final result = await _getByIdUsecase(orderId);

    result.when(
      success: (order) {
        emit(
          state.copyWith(isFetchingOrderDetail: false, selectedOrder: order),
        );
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isFetchingOrderDetail: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  void setPickupType(String type) {
    emit(state.copyWith(pickupType: type));
  }

  void setDeliveryType(String type) {
    emit(state.copyWith(deliveryType: type));
  }

  void selectAddress(CustomerAddress address) {
    emit(state.copyWith(selectedAddress: address));
  }

  void selectPaymentMethod(String method) {
    emit(state.copyWith(paymentMethod: method));
  }

  void setNotes(String notes) {
    emit(state.copyWith(notes: notes));
  }

  void normalizeOrderStateForOutlet(Outlet outlet) {
    if (!outlet.isCourierEnabled) {
      emit(state.copyWith(
        pickupType: 'self_dropoff',
        deliveryType: 'pickup',
      ));
    }
  }

  void setDate(DateTime date) {
    emit(state.copyWith(selectedDate: date, selectedSchedule: null));
  }

  void selectSchedule(CourierSchedule schedule) {
    emit(state.copyWith(selectedSchedule: schedule));
  }

  Future<void> createOrder({
    required int customerAccountId,
    required int outletId,
    required Set<int> serviceIds,
    required bool isCourierEnabled,
    required bool canUseCourier,
  }) async {
    if (serviceIds.isEmpty) {
      emit(state.copyWith(errorMessage: 'Keranjang belanja kosong'));
      return;
    }

    final effectivelyCourierEnabled = isCourierEnabled && canUseCourier;

    if (effectivelyCourierEnabled && state.pickupType == 'courier') {
      if (state.selectedAddress == null) {
        emit(state.copyWith(errorMessage: 'Pilih alamat pengambilan'));
        return;
      }
      if (state.selectedDate == null) {
        emit(state.copyWith(errorMessage: 'Pilih tanggal pengambilan'));
        return;
      }
      if (state.selectedSchedule == null) {
        emit(state.copyWith(errorMessage: 'Pilih jam pengambilan'));
        return;
      }
    }

    emit(state.copyWith(isSubmittingOrder: true, errorMessage: null));

    final params = CreateOrderParams(
      customerAccountId: customerAccountId,
      outletId: outletId,
      paymentMethod: effectivelyCourierEnabled ? state.paymentMethod : null,
      pickupType: effectivelyCourierEnabled ? state.pickupType : 'self_dropoff',
      notes: state.notes,
      customerAddressId: effectivelyCourierEnabled ? state.selectedAddress?.id : null,
      pickupScheduleId: effectivelyCourierEnabled ? state.selectedSchedule?.id : null,
      pickupDate: effectivelyCourierEnabled && state.selectedDate != null
          ? DateFormat('yyyy-MM-dd').format(state.selectedDate!)
          : null,
      deliveryType: effectivelyCourierEnabled ? state.deliveryType : 'pickup',
      orderItems: serviceIds
          .map((id) => OrderItemParam(laundryServiceId: id))
          .toList(),
    );

    final result = await _storeUsecase(params);

    result.when(
      success: (order) {
        emit(state.copyWith(isSubmittingOrder: false, lastCreatedOrder: order));
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isSubmittingOrder: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  Future<void> cancelOrder(int orderId) async {
    emit(state.copyWith(isCancellingOrder: true, errorMessage: null));

    final result = await _cancelUsecase(orderId);

    result.when(
      success: (updatedOrder) {
        final List<Order> updatedOrders = state.orders.map((o) {
          return o.id == updatedOrder.id ? updatedOrder : o;
        }).toList();

        emit(state.copyWith(isCancellingOrder: false, orders: updatedOrders));
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isCancellingOrder: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  Future<void> payOrder(int orderId) async {
    emit(state.copyWith(isPayingOrder: true, errorMessage: null));

    final method = state.selectedOrder?.paymentMethod ?? state.paymentMethod;

    final result = await _payOrderUseCase(
      PayOrderParams(
        orderId: orderId,
        paymentMethod: method,
      ),
    );

    result.when(
      success: (updatedOrder) {
        final List<Order> updatedOrders = state.orders.map((o) {
          return o.id == updatedOrder.id ? updatedOrder : o;
        }).toList();

        emit(
          state.copyWith(
            isPayingOrder: false,
            orders: updatedOrders,
            selectedOrder: updatedOrder,
            paymentSuccess: method != 'transfer',
            midtransPaymentUrl: updatedOrder.qrUrl,
          ),
        );
      },
      failure: (failure) {
        emit(
          state.copyWith(isPayingOrder: false, errorMessage: failure.message),
        );
      },
    );
  }

  Future<void> scheduleDelivery({
    required int orderId,
    required int courierScheduleId,
    required DateTime deliveryDate,
    String? deliveryAddress,
  }) async {
    emit(state.copyWith(isSchedulingDelivery: true, errorMessage: null));

    final params = ScheduleDeliveryParams(
      orderId: orderId,
      courierScheduleId: courierScheduleId,
      deliveryDate: deliveryDate,
      deliveryAddress: deliveryAddress,
    );

    final result = await _scheduleDeliveryUseCase(params);

    result.when(
      success: (updatedOrder) {
        final List<Order> updatedOrders = state.orders.map((o) {
          return o.id == updatedOrder.id ? updatedOrder : o;
        }).toList();

        emit(
          state.copyWith(
            isSchedulingDelivery: false,
            orders: updatedOrders,
            selectedOrder: updatedOrder,
            schedulingSuccess: true,
          ),
        );
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isSchedulingDelivery: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  Future<void> completeOrder(int orderId) async {
    emit(state.copyWith(isCompletingOrder: true, errorMessage: null));

    final result = await _completeUsecase(orderId);

    result.when(
      success: (updatedOrder) {
        final List<Order> updatedOrders = state.orders.map((o) {
          return o.id == updatedOrder.id ? updatedOrder : o;
        }).toList();

        emit(
          state.copyWith(
            isCompletingOrder: false,
            orders: updatedOrders,
            selectedOrder: updatedOrder,
            completionSuccess: true,
          ),
        );
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isCompletingOrder: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  Future<void> submitReview(SubmitReviewParams params) async {
    emit(state.copyWith(isSubmittingReview: true, errorMessage: null));

    final result = await _submitReviewUseCase(params);

    result.when(
      success: (updatedOrder) {
        final List<Order> updatedOrders = state.orders.map((o) {
          return o.id == updatedOrder.id ? updatedOrder : o;
        }).toList();

        emit(
          state.copyWith(
            isSubmittingReview: false,
            orders: updatedOrders,
            selectedOrder: updatedOrder,
            reviewSuccess: true,
          ),
        );
      },
      failure: (failure) {
        emit(
          state.copyWith(
            isSubmittingReview: false,
            errorMessage: failure.message,
          ),
        );
      },
    );
  }

  void clearPaymentFlags() {
    emit(state.copyWith(
      paymentSuccess: false,
      midtransPaymentUrl: null,
    ));
  }
}
