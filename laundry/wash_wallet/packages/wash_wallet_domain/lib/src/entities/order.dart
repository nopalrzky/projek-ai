import 'package:equatable/equatable.dart';
import 'customer.dart';
import 'employee.dart';
import 'outlet.dart';
import 'order_item.dart';

class Order extends Equatable {
  final int id;
  final String orderNumber;
  final String status;
  final String? statusLabel;
  final String? statusBadgeVariant;
  final int completionPercentage;
  final String paymentStatus;
  final String? paymentStatusLabel;
  final String? paymentStatusBadgeVariant;
  final String? deliveryType;
  final String? deliveryTypeLabel;
  final bool canPay;
  final bool canScheduleDelivery;
  final bool requiresPaymentBeforeDelivery;
  final String? source;
  final String? sourceLabel;
  final String? paymentMethod;
  final int customerId;
  final int? customerAccountId;
  final int employeeId;
  final int outletId;
  final int? customerAddressId;
  final int? updatedBy;
  final Customer? customer;
  final dynamic customerAccount;
  final Employee? employee;
  final Outlet? outlet;
  final dynamic customerAddress;
  final Employee? statusUpdater;
  final List<dynamic> commissionLogs;
  final dynamic review; // OrderReview di customer app
  final bool hasReview;
  final double subtotal;
  final double pickupFee;
  final String? formattedPickupFee;
  final double deliveryFee;
  final String? formattedDeliveryFee;
  final double discountAmount;
  final double taxAmount;
  final double totalAmount;
  final double paidAmount;
  final double remainingAmount;
  final String? formattedSubtotal;
  final String? formattedDiscountAmount;
  final String? formattedTaxAmount;
  final String? formattedTotalAmount;
  final String? formattedPaidAmount;
  final String? formattedRemainingAmount;
  final String? midtransOrderId;
  final String? midtransTransactionId;
  final String? qrUrl;
  final DateTime? orderDate;
  final String? formattedOrderDate;
  final DateTime? estimatedCompletion;
  final String? formattedEstimatedCompletion;
  final DateTime? actualCompletion;
  final String? formattedActualCompletion;
  final DateTime? pickupDate;
  final String? formattedPickupDate;
  final DateTime? deliveryDate;
  final String? formattedDeliveryDate;
  final DateTime? deliverySchedule;
  final String? formattedDeliverySchedule;
  final String? deliveryAddress;
  final DateTime? lastStatusUpdate;
  final String? formattedLastStatusUpdate;
  final String? pickupType;
  final String? pickupAddress;
  final DateTime? pickupSchedule;
  final String? formattedPickupSchedule;
  final String? notes;
  final String? internalNotes;
  final dynamic specialInstructions;
  final List<OrderItem>? orderItems;
  final int orderItemsCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? formattedCreatedAt;
  final String? formattedUpdatedAt;
  final DateTime? deletedAt;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    this.statusLabel,
    this.statusBadgeVariant,
    this.completionPercentage = 0,
    required this.paymentStatus,
    this.paymentStatusLabel,
    this.paymentStatusBadgeVariant,
    this.deliveryType,
    this.deliveryTypeLabel,
    this.canPay = false,
    this.canScheduleDelivery = false,
    this.requiresPaymentBeforeDelivery = false,
    this.source,
    this.sourceLabel,
    this.paymentMethod,
    required this.customerId,
    this.customerAccountId,
    required this.employeeId,
    required this.outletId,
    this.customerAddressId,
    this.updatedBy,
    this.customer,
    this.customerAccount,
    this.employee,
    this.outlet,
    this.customerAddress,
    this.statusUpdater,
    this.commissionLogs = const [],
    this.review,
    this.hasReview = false,
    this.subtotal = 0,
    this.pickupFee = 0,
    this.formattedPickupFee,
    this.deliveryFee = 0,
    this.formattedDeliveryFee,
    this.discountAmount = 0,
    this.taxAmount = 0,
    this.totalAmount = 0,
    this.paidAmount = 0,
    this.remainingAmount = 0,
    this.formattedSubtotal,
    this.formattedDiscountAmount,
    this.formattedTaxAmount,
    this.formattedTotalAmount,
    this.formattedPaidAmount,
    this.formattedRemainingAmount,
    this.midtransOrderId,
    this.midtransTransactionId,
    this.qrUrl,
    this.orderDate,
    this.formattedOrderDate,
    this.estimatedCompletion,
    this.formattedEstimatedCompletion,
    this.actualCompletion,
    this.formattedActualCompletion,
    this.pickupDate,
    this.formattedPickupDate,
    this.deliveryDate,
    this.formattedDeliveryDate,
    this.deliverySchedule,
    this.formattedDeliverySchedule,
    this.deliveryAddress,
    this.lastStatusUpdate,
    this.formattedLastStatusUpdate,
    this.pickupType,
    this.pickupAddress,
    this.pickupSchedule,
    this.formattedPickupSchedule,
    this.notes,
    this.internalNotes,
    this.specialInstructions,
    this.orderItems,
    this.orderItemsCount = 0,
    this.createdAt,
    this.updatedAt,
    this.formattedCreatedAt,
    this.formattedUpdatedAt,
    this.deletedAt,
  });

  factory Order.fromModel(dynamic model) {
    return Order(
      id: model.id,
      orderNumber: model.orderNumber,
      status: model.status,
      statusLabel: model.statusLabel,
      statusBadgeVariant: model.statusBadgeVariant,
      completionPercentage: model.completionPercentage,
      paymentStatus: model.paymentStatus,
      paymentStatusLabel: model.paymentStatusLabel,
      paymentStatusBadgeVariant: model.paymentStatusBadgeVariant,
      deliveryType: model.deliveryType,
      deliveryTypeLabel: model.deliveryTypeLabel,
      canPay: model.canPay ?? false,
      canScheduleDelivery: model.canScheduleDelivery ?? false,
      requiresPaymentBeforeDelivery: model.requiresPaymentBeforeDelivery ?? false,
      source: model.source,
      sourceLabel: model.sourceLabel,
      paymentMethod: model.paymentMethod,
      customerId: model.customerId,
      customerAccountId: model.customerAccountId,
      employeeId: model.employeeId,
      outletId: model.outletId,
      customerAddressId: model.customerAddressId,
      updatedBy: model.updatedBy,
      customer: model.customer?.toEntity(),
      customerAccount: model.customerAccount?.toEntity(),
      employee: model.employee?.toEntity(),
      outlet: model.outlet?.toEntity(),
      customerAddress: model.customerAddress,
      statusUpdater: model.statusUpdater?.toEntity(),
      commissionLogs: model.commissionLogs ?? const [],
      subtotal: model.subtotal,
      pickupFee: model.pickupFee,
      formattedPickupFee: model.formattedPickupFee,
      deliveryFee: model.deliveryFee,
      formattedDeliveryFee: model.formattedDeliveryFee,
      discountAmount: model.discountAmount,
      taxAmount: model.taxAmount,
      totalAmount: model.totalAmount,
      paidAmount: model.paidAmount,
      remainingAmount: model.remainingAmount,
      formattedSubtotal: model.formattedSubtotal,
      formattedDiscountAmount: model.formattedDiscountAmount,
      formattedTaxAmount: model.formattedTaxAmount,
      formattedTotalAmount: model.formattedTotalAmount,
      formattedPaidAmount: model.formattedPaidAmount,
      formattedRemainingAmount: model.formattedRemainingAmount,
      midtransOrderId: model.midtransOrderId,
      midtransTransactionId: model.midtransTransactionId,
      qrUrl: model.qrUrl,
      orderDate: model.orderDate,
      formattedOrderDate: model.formattedOrderDate,
      estimatedCompletion: model.estimatedCompletion,
      formattedEstimatedCompletion: model.formattedEstimatedCompletion,
      actualCompletion: model.actualCompletion,
      formattedActualCompletion: model.formattedActualCompletion,
      pickupDate: model.pickupDate,
      formattedPickupDate: model.formattedPickupDate,
      deliveryDate: model.deliveryDate,
      formattedDeliveryDate: model.formattedDeliveryDate,
      deliverySchedule: model.deliverySchedule,
      formattedDeliverySchedule: model.formattedDeliverySchedule,
      deliveryAddress: model.deliveryAddress,
      lastStatusUpdate: model.lastStatusUpdate,
      formattedLastStatusUpdate: model.formattedLastStatusUpdate,
      pickupType: model.pickupType,
      pickupAddress: model.pickupAddress,
      pickupSchedule: model.pickupSchedule,
      formattedPickupSchedule: model.formattedPickupSchedule,
      notes: model.notes,
      internalNotes: model.internalNotes,
      specialInstructions: model.specialInstructions,
      orderItems: model.orderItems?.map((e) => OrderItem.fromModel(e)).toList(),
      orderItemsCount: model.orderItemsCount,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      formattedCreatedAt: model.formattedCreatedAt,
      formattedUpdatedAt: model.formattedUpdatedAt,
      deletedAt: model.deletedAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    orderNumber,
    status,
    statusLabel,
    statusBadgeVariant,
    completionPercentage,
    paymentStatus,
    paymentStatusLabel,
    paymentStatusBadgeVariant,
    deliveryType,
    deliveryTypeLabel,
    canPay,
    canScheduleDelivery,
    requiresPaymentBeforeDelivery,
    source,
    sourceLabel,
    paymentMethod,
    customerId,
    customerAccountId,
    employeeId,
    outletId,
    customerAddressId,
    updatedBy,
    customer,
    customerAccount,
    employee,
    outlet,
    customerAddress,
    statusUpdater,
    commissionLogs,
    review,
    hasReview,
    subtotal,
    pickupFee,
    formattedPickupFee,
    deliveryFee,
    formattedDeliveryFee,
    discountAmount,
    taxAmount,
    totalAmount,
    paidAmount,
    remainingAmount,
    formattedSubtotal,
    formattedDiscountAmount,
    formattedTaxAmount,
    formattedTotalAmount,
    formattedPaidAmount,
    formattedRemainingAmount,
    midtransOrderId,
    midtransTransactionId,
    qrUrl,
    orderDate,
    formattedOrderDate,
    estimatedCompletion,
    formattedEstimatedCompletion,
    actualCompletion,
    formattedActualCompletion,
    pickupDate,
    formattedPickupDate,
    deliveryDate,
    formattedDeliveryDate,
    deliverySchedule,
    formattedDeliverySchedule,
    deliveryAddress,
    lastStatusUpdate,
    formattedLastStatusUpdate,
    pickupType,
    pickupAddress,
    pickupSchedule,
    formattedPickupSchedule,
    notes,
    internalNotes,
    specialInstructions,
    orderItems,
    orderItemsCount,
    createdAt,
    updatedAt,
    formattedCreatedAt,
    formattedUpdatedAt,
    deletedAt,
  ];
}
