import 'package:equatable/equatable.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../../../courier_schedule/domain/entities/courier_schedule.dart';
import '../../../customer_address/domain/entities/customer_address.dart';

class OrderState extends Equatable {
  final List<Order> orders;
  final bool isFetchingOrders;
  final bool isFetchingOrderDetail;
  final bool isSubmittingOrder;
  final bool isCancellingOrder;
  final bool isPayingOrder;
  final bool isSchedulingDelivery;
  final bool isCompletingOrder;
  final bool isSubmittingReview;
  final bool paymentSuccess;
  final bool schedulingSuccess;
  final bool completionSuccess;
  final bool reviewSuccess;
  final String? errorMessage;
  final Order? lastCreatedOrder;
  final Order? selectedOrder;
  final String? midtransPaymentUrl;
  final int currentPage;
  final bool hasReachedMax;

  final String pickupType;
  final String deliveryType;
  final String paymentMethod;
  final CustomerAddress? selectedAddress;
  final DateTime? selectedDate;
  final CourierSchedule? selectedSchedule;
  final String? notes;

  const OrderState({
    this.orders = const [],
    this.isFetchingOrders = false,
    this.isFetchingOrderDetail = false,
    this.isSubmittingOrder = false,
    this.isCancellingOrder = false,
    this.isPayingOrder = false,
    this.isSchedulingDelivery = false,
    this.isCompletingOrder = false,
    this.isSubmittingReview = false,
    this.paymentSuccess = false,
    this.schedulingSuccess = false,
    this.completionSuccess = false,
    this.reviewSuccess = false,
    this.errorMessage,
    this.lastCreatedOrder,
    this.selectedOrder,
    this.midtransPaymentUrl,
    this.currentPage = 1,
    this.hasReachedMax = false,
    this.pickupType = 'courier',
    this.deliveryType = 'delivery',
    this.paymentMethod = 'cod',
    this.selectedAddress,
    this.selectedDate,
    this.selectedSchedule,
    this.notes,
  });

  OrderState copyWith({
    List<Order>? orders,
    bool? isFetchingOrders,
    bool? isFetchingOrderDetail,
    bool? isSubmittingOrder,
    bool? isCancellingOrder,
    bool? isPayingOrder,
    bool? isSchedulingDelivery,
    bool? isCompletingOrder,
    bool? isSubmittingReview,
    bool? paymentSuccess,
    bool? schedulingSuccess,
    bool? completionSuccess,
    bool? reviewSuccess,
    String? errorMessage,
    Order? lastCreatedOrder,
    Order? selectedOrder,
    String? midtransPaymentUrl,
    int? currentPage,
    bool? hasReachedMax,
    String? pickupType,
    String? deliveryType,
    String? paymentMethod,
    CustomerAddress? selectedAddress,
    DateTime? selectedDate,
    CourierSchedule? selectedSchedule,
    String? notes,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
      isFetchingOrders: isFetchingOrders ?? this.isFetchingOrders,
      isFetchingOrderDetail:
          isFetchingOrderDetail ?? this.isFetchingOrderDetail,
      isSubmittingOrder: isSubmittingOrder ?? this.isSubmittingOrder,
      isCancellingOrder: isCancellingOrder ?? this.isCancellingOrder,
      isPayingOrder: isPayingOrder ?? this.isPayingOrder,
      isSchedulingDelivery: isSchedulingDelivery ?? this.isSchedulingDelivery,
      isCompletingOrder: isCompletingOrder ?? this.isCompletingOrder,
      isSubmittingReview: isSubmittingReview ?? this.isSubmittingReview,
      paymentSuccess: paymentSuccess ?? false,
      schedulingSuccess: schedulingSuccess ?? false,
      completionSuccess: completionSuccess ?? false,
      reviewSuccess: reviewSuccess ?? false,
      errorMessage: errorMessage,
      lastCreatedOrder: lastCreatedOrder ?? this.lastCreatedOrder,
      selectedOrder: selectedOrder ?? this.selectedOrder,
      midtransPaymentUrl: midtransPaymentUrl,
      currentPage: currentPage ?? this.currentPage,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      pickupType: pickupType ?? this.pickupType,
      deliveryType: deliveryType ?? this.deliveryType,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      selectedAddress: selectedAddress ?? this.selectedAddress,
      selectedDate: selectedDate ?? this.selectedDate,
      selectedSchedule: selectedSchedule ?? this.selectedSchedule,
      notes: notes ?? this.notes,
    );
  }

  @override
  List<Object?> get props => [
    orders,
    isFetchingOrders,
    isFetchingOrderDetail,
    isSubmittingOrder,
    isCancellingOrder,
    isPayingOrder,
    isSchedulingDelivery,
    isCompletingOrder,
    isSubmittingReview,
    paymentSuccess,
    schedulingSuccess,
    completionSuccess,
    reviewSuccess,
    errorMessage,
    lastCreatedOrder,
    selectedOrder,
    midtransPaymentUrl,
    currentPage,
    hasReachedMax,
    pickupType,
    deliveryType,
    paymentMethod,
    selectedAddress,
    selectedDate,
    selectedSchedule,
    notes,
  ];
}
