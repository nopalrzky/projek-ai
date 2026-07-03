// ignore_for_file: invalid_annotation_target
import '../../wash_wallet_domain.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'order_model.freezed.dart';
part 'order_model.g.dart';

@freezed
class OrderModel with _$OrderModel {
  const factory OrderModel({
    required int id,
    required String orderNumber,
    required String status,
    String? statusLabel,
    String? statusBadgeVariant,
    @Default(0) int completionPercentage,
    required String paymentStatus,
    String? paymentStatusLabel,
    String? paymentStatusBadgeVariant,
    String? deliveryType,
    String? deliveryTypeLabel,
    @Default(false) bool canPay,
    @Default(false) bool canScheduleDelivery,
    @Default(false) bool requiresPaymentBeforeDelivery,
    String? source,
    String? sourceLabel,
    String? paymentMethod,
    required int customerId,
    int? customerAccountId,
    required int employeeId,
    required int outletId,
    int? customerAddressId,
    int? updatedBy,

    CustomerModel? customer,
    CustomerAccountModel? customerAccount,
    EmployeeModel? employee,
    OutletModel? outlet,
    dynamic customerAddress,
    EmployeeModel? statusUpdater,
    @Default([]) List<dynamic> commissionLogs,
    OrderReviewModel? review,
    @Default(false) bool hasReview,

    @Default(0) double subtotal,
    @Default(0) double pickupFee,
    String? formattedPickupFee,
    @Default(0) double deliveryFee,
    String? formattedDeliveryFee,
    @Default(0) double discountAmount,
    @Default(0) double taxAmount,
    @Default(0) double totalAmount,
    @Default(0) double paidAmount,
    @Default(0) double remainingAmount,

    String? formattedSubtotal,
    String? formattedDiscountAmount,
    String? formattedTaxAmount,
    String? formattedTotalAmount,
    String? formattedPaidAmount,
    String? formattedRemainingAmount,
    String? midtransOrderId,
    String? midtransTransactionId,
    String? qrUrl,

    @JsonKey(fromJson: toDateTime) DateTime? orderDate,
    String? formattedOrderDate,
    @JsonKey(fromJson: toDateTime) DateTime? estimatedCompletion,
    String? formattedEstimatedCompletion,
    @JsonKey(fromJson: toDateTime) DateTime? actualCompletion,
    String? formattedActualCompletion,
    @JsonKey(fromJson: toDateTime) DateTime? pickupDate,
    String? formattedPickupDate,
    @JsonKey(fromJson: toDateTime) DateTime? deliveryDate,
    String? formattedDeliveryDate,
    @JsonKey(fromJson: toDateTime) DateTime? deliverySchedule,
    String? formattedDeliverySchedule,
    String? deliveryAddress,
    @JsonKey(fromJson: toDateTime) DateTime? lastStatusUpdate,
    String? formattedLastStatusUpdate,
    String? pickupType,
    String? pickupAddress,
    @JsonKey(fromJson: toDateTime) DateTime? pickupSchedule,
    String? formattedPickupSchedule,

    String? notes,
    String? internalNotes,
    dynamic specialInstructions,

    List<OrderItemModel>? orderItems,
    @Default(0) int orderItemsCount,

    @JsonKey(fromJson: toDateTime) DateTime? createdAt,
    @JsonKey(fromJson: toDateTime) DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
    @JsonKey(fromJson: toDateTime) DateTime? deletedAt,
  }) = _OrderModel;

  const OrderModel._();

  factory OrderModel.fromJson(Map<String, dynamic> json) =>
      _$OrderModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['orderNumber'] = json['orderNumber'] ?? json['order_number'];
    normalized['status'] = json['status'] ?? 'pending';
    normalized['completionPercentage'] = toInt(
      json['completionPercentage'] ?? json['completion_percentage'],
    );
    normalized['paymentStatus'] =
        json['paymentStatus'] ?? json['payment_status'];
    normalized['deliveryType'] = json['deliveryType'] ?? json['delivery_type'];
    normalized['canPay'] = json['canPay'] ?? false;
    normalized['canScheduleDelivery'] = json['canScheduleDelivery'] ?? false;
    normalized['requiresPaymentBeforeDelivery'] =
        json['requiresPaymentBeforeDelivery'] ?? false;
    normalized['source'] = json['source'];
    normalized['sourceLabel'] = json['sourceLabel'] ?? json['source_label'];
    normalized['paymentMethod'] =
        json['paymentMethod'] ?? json['payment_method'];
    normalized['customerId'] = toInt(json['customerId'] ?? json['customer_id']);
    normalized['customerAccountId'] = toInt(
      json['customerAccountId'] ?? json['customer_account_id'],
    );
    normalized['employeeId'] = toInt(json['employeeId'] ?? json['employee_id']);
    normalized['outletId'] = toInt(json['outletId'] ?? json['outlet_id']);
    normalized['customerAddressId'] = toInt(
      json['customerAddressId'] ?? json['customer_address_id'],
    );
    normalized['updatedBy'] = toInt(json['updatedBy'] ?? json['updated_by']);
    if (normalized['outletId'] == 0)
      normalized['outletId'] = 1; // Default to 1 if missing for safety
    normalized['subtotal'] = toDouble(json['subtotal']);
    normalized['pickupFee'] = toDouble(json['pickupFee'] ?? json['pickup_fee']);
    normalized['formattedPickupFee'] =
        json['formattedPickupFee'] ?? json['formatted_pickup_fee'];
    normalized['deliveryFee'] = toDouble(
      json['deliveryFee'] ?? json['delivery_fee'],
    );
    normalized['formattedDeliveryFee'] =
        json['formattedDeliveryFee'] ?? json['formatted_delivery_fee'];
    normalized['discountAmount'] = toDouble(
      json['discountAmount'] ?? json['discount_amount'],
    );
    normalized['taxAmount'] = toDouble(json['taxAmount'] ?? json['tax_amount']);
    normalized['totalAmount'] = toDouble(
      json['totalAmount'] ?? json['total_amount'],
    );
    normalized['paidAmount'] = toDouble(
      json['paidAmount'] ?? json['paid_amount'],
    );
    normalized['remainingAmount'] = toDouble(
      json['remainingAmount'] ?? json['remaining_amount'],
    );
    normalized['orderItemsCount'] = toInt(
      json['orderItemsCount'] ?? json['order_items_count'],
    );
    normalized['pickupAddress'] =
        json['pickupAddress'] ?? json['pickup_address'];
    normalized['pickupSchedule'] =
        json['pickupSchedule'] ?? json['pickup_schedule'];
    normalized['formattedPickupSchedule'] =
        json['formattedPickupSchedule'] ?? json['formatted_pickup_schedule'];
    normalized['pickupType'] = json['pickupType'] ?? json['pickup_type'];
    normalized['deliveryDate'] = json['deliveryDate'] ?? json['delivery_date'];
    normalized['deliverySchedule'] =
        json['deliverySchedule'] ?? json['delivery_schedule'];
    normalized['deliveryAddress'] =
        json['deliveryAddress'] ?? json['delivery_address'];
    normalized['midtransOrderId'] =
        json['midtransOrderId'] ?? json['midtrans_order_id'];
    normalized['midtransTransactionId'] =
        json['midtransTransactionId'] ?? json['midtrans_transaction_id'];
    normalized['qrUrl'] = json['qrUrl'] ?? json['qr_url'];

    // Parse nested models if needed
    if (json['customerAccount'] != null) {
      normalized['customerAccount'] = _parseNestedEntity(
        json['customerAccount'],
        CustomerAccountModel.fromJson,
      );
    }
    if (json['statusUpdater'] != null) {
      normalized['statusUpdater'] = _parseNestedEntity(
        json['statusUpdater'],
        EmployeeModel.fromJson,
      );
    }
    if (json['review'] != null) {
      normalized['review'] = _parseNestedEntity(
        json['review'],
        OrderReviewModel.fromJson,
      );
    }

    return normalized;
  }

  factory OrderModel.fromEntity(Order entity) => OrderModel(
    id: entity.id,
    orderNumber: entity.orderNumber,
    status: entity.status,
    statusLabel: entity.statusLabel,
    statusBadgeVariant: entity.statusBadgeVariant,
    completionPercentage: entity.completionPercentage,
    paymentStatus: entity.paymentStatus,
    paymentStatusLabel: entity.paymentStatusLabel,
    paymentStatusBadgeVariant: entity.paymentStatusBadgeVariant,
    deliveryType: entity.deliveryType,
    deliveryTypeLabel: entity.deliveryTypeLabel,
    canPay: entity.canPay,
    canScheduleDelivery: entity.canScheduleDelivery,
    requiresPaymentBeforeDelivery: entity.requiresPaymentBeforeDelivery,
    source: entity.source,
    sourceLabel: entity.sourceLabel,
    paymentMethod: entity.paymentMethod,
    customerId: entity.customerId,
    customerAccountId: entity.customerAccountId,
    employeeId: entity.employeeId,
    outletId: entity.outletId,
    customerAddressId: entity.customerAddressId,
    updatedBy: entity.updatedBy,
    customer: entity.customer != null
        ? CustomerModel.fromEntity(entity.customer!)
        : null,
    customerAccount: entity.customerAccount != null
        ? CustomerAccountModel.fromEntity(entity.customerAccount!)
        : null,
    employee: entity.employee != null
        ? EmployeeModel.fromEntity(entity.employee!)
        : null,
    outlet: entity.outlet != null
        ? OutletModel.fromEntity(entity.outlet!)
        : null,
    customerAddress: entity.customerAddress,
    statusUpdater: entity.statusUpdater != null
        ? EmployeeModel.fromEntity(entity.statusUpdater!)
        : null,
    commissionLogs: entity.commissionLogs,
    review: entity.review != null
        ? OrderReviewModel.fromEntity(entity.review as OrderReview)
        : null,
    hasReview: entity.hasReview,
    subtotal: entity.subtotal,
    pickupFee: entity.pickupFee,
    formattedPickupFee: entity.formattedPickupFee,
    deliveryFee: entity.deliveryFee,
    formattedDeliveryFee: entity.formattedDeliveryFee,
    discountAmount: entity.discountAmount,
    taxAmount: entity.taxAmount,
    totalAmount: entity.totalAmount,
    paidAmount: entity.paidAmount,
    remainingAmount: entity.remainingAmount,
    formattedSubtotal: entity.formattedSubtotal,
    formattedDiscountAmount: entity.formattedDiscountAmount,
    formattedTaxAmount: entity.formattedTaxAmount,
    formattedTotalAmount: entity.formattedTotalAmount,
    formattedPaidAmount: entity.formattedPaidAmount,
    formattedRemainingAmount: entity.formattedRemainingAmount,
    midtransOrderId: entity.midtransOrderId,
    midtransTransactionId: entity.midtransTransactionId,
    qrUrl: entity.qrUrl,
    orderDate: entity.orderDate,
    formattedOrderDate: entity.formattedOrderDate,
    estimatedCompletion: entity.estimatedCompletion,
    formattedEstimatedCompletion: entity.formattedEstimatedCompletion,
    actualCompletion: entity.actualCompletion,
    formattedActualCompletion: entity.formattedActualCompletion,
    pickupDate: entity.pickupDate,
    formattedPickupDate: entity.formattedPickupDate,
    deliveryDate: entity.deliveryDate,
    formattedDeliveryDate: entity.formattedDeliveryDate,
    deliverySchedule: entity.deliverySchedule,
    formattedDeliverySchedule: entity.formattedDeliverySchedule,
    deliveryAddress: entity.deliveryAddress,
    lastStatusUpdate: entity.lastStatusUpdate,
    formattedLastStatusUpdate: entity.formattedLastStatusUpdate,
    pickupType: entity.pickupType,
    pickupAddress: entity.pickupAddress,
    pickupSchedule: entity.pickupSchedule,
    formattedPickupSchedule: entity.formattedPickupSchedule,
    notes: entity.notes,
    internalNotes: entity.internalNotes,
    specialInstructions: entity.specialInstructions,
    orderItems: entity.orderItems
        ?.map((item) => OrderItemModel.fromEntity(item))
        .toList(),
    orderItemsCount: entity.orderItemsCount,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    formattedCreatedAt: entity.formattedCreatedAt,
    formattedUpdatedAt: entity.formattedUpdatedAt,
    deletedAt: entity.deletedAt,
  );
}

extension OrderModelX on OrderModel {
  Order toEntity() => Order(
    id: id,
    orderNumber: orderNumber,
    status: status,
    statusLabel: statusLabel,
    statusBadgeVariant: statusBadgeVariant,
    completionPercentage: completionPercentage,
    paymentStatus: paymentStatus,
    paymentStatusLabel: paymentStatusLabel,
    paymentStatusBadgeVariant: paymentStatusBadgeVariant,
    deliveryType: deliveryType,
    deliveryTypeLabel: deliveryTypeLabel,
    canPay: canPay,
    canScheduleDelivery: canScheduleDelivery,
    requiresPaymentBeforeDelivery: requiresPaymentBeforeDelivery,
    source: source,
    sourceLabel: sourceLabel,
    paymentMethod: paymentMethod,
    customerId: customerId,
    customerAccountId: customerAccountId,
    employeeId: employeeId,
    outletId: outletId,
    customerAddressId: customerAddressId,
    updatedBy: updatedBy,
    customer: customer?.toEntity(),
    customerAccount: customerAccount?.toEntity(),
    employee: employee?.toEntity(),
    outlet: outlet?.toEntity(),
    customerAddress: customerAddress,
    statusUpdater: statusUpdater?.toEntity(),
    commissionLogs: commissionLogs,
    review: review?.toEntity(),
    hasReview: hasReview,
    subtotal: subtotal,
    pickupFee: pickupFee,
    formattedPickupFee: formattedPickupFee,
    deliveryFee: deliveryFee,
    formattedDeliveryFee: formattedDeliveryFee,
    discountAmount: discountAmount,
    taxAmount: taxAmount,
    totalAmount: totalAmount,
    paidAmount: paidAmount,
    remainingAmount: remainingAmount,
    formattedSubtotal: formattedSubtotal,
    formattedDiscountAmount: formattedDiscountAmount,
    formattedTaxAmount: formattedTaxAmount,
    formattedTotalAmount: formattedTotalAmount,
    formattedPaidAmount: formattedPaidAmount,
    formattedRemainingAmount: formattedRemainingAmount,
    midtransOrderId: midtransOrderId,
    midtransTransactionId: midtransTransactionId,
    qrUrl: qrUrl,
    orderDate: orderDate,
    formattedOrderDate: formattedOrderDate,
    estimatedCompletion: estimatedCompletion,
    formattedEstimatedCompletion: formattedEstimatedCompletion,
    actualCompletion: actualCompletion,
    formattedActualCompletion: formattedActualCompletion,
    pickupDate: pickupDate,
    formattedPickupDate: formattedPickupDate,
    deliveryDate: deliveryDate,
    formattedDeliveryDate: formattedDeliveryDate,
    deliverySchedule: deliverySchedule,
    formattedDeliverySchedule: formattedDeliverySchedule,
    deliveryAddress: deliveryAddress,
    lastStatusUpdate: lastStatusUpdate,
    formattedLastStatusUpdate: formattedLastStatusUpdate,
    pickupType: pickupType,
    pickupAddress: pickupAddress,
    pickupSchedule: pickupSchedule,
    formattedPickupSchedule: formattedPickupSchedule,
    notes: notes,
    internalNotes: internalNotes,
    specialInstructions: specialInstructions,
    orderItems: orderItems?.map((e) => e.toEntity()).toList(),
    orderItemsCount: orderItemsCount,
    createdAt: createdAt,
    updatedAt: updatedAt,
    formattedCreatedAt: formattedCreatedAt,
    formattedUpdatedAt: formattedUpdatedAt,
    deletedAt: deletedAt,
  );
}

T? _parseNestedEntity<T>(
  dynamic value,
  T Function(Map<String, dynamic>) parser,
) {
  if (value == null) return null;
  if (value is T) return value;
  if (value is Map<String, dynamic>) {
    try {
      return parser(value);
    } catch (_) {
      return null;
    }
  }
  if (value is Map) {
    try {
      return parser(Map<String, dynamic>.from(value));
    } catch (_) {
      return null;
    }
  }
  return null;
}
