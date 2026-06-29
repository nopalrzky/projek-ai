// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OrderModel _$OrderModelFromJson(Map<String, dynamic> json) {
  return _OrderModel.fromJson(json);
}

/// @nodoc
mixin _$OrderModel {
  int get id => throw _privateConstructorUsedError;
  String get orderNumber => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get statusLabel => throw _privateConstructorUsedError;
  String? get statusBadgeVariant => throw _privateConstructorUsedError;
  int get completionPercentage => throw _privateConstructorUsedError;
  String get paymentStatus => throw _privateConstructorUsedError;
  String? get paymentStatusLabel => throw _privateConstructorUsedError;
  String? get paymentStatusBadgeVariant => throw _privateConstructorUsedError;
  String? get deliveryType => throw _privateConstructorUsedError;
  String? get deliveryTypeLabel => throw _privateConstructorUsedError;
  bool get canPay => throw _privateConstructorUsedError;
  bool get canScheduleDelivery => throw _privateConstructorUsedError;
  bool get requiresPaymentBeforeDelivery => throw _privateConstructorUsedError;
  String? get source => throw _privateConstructorUsedError;
  String? get sourceLabel => throw _privateConstructorUsedError;
  String? get paymentMethod => throw _privateConstructorUsedError;
  int get customerId => throw _privateConstructorUsedError;
  int? get customerAccountId => throw _privateConstructorUsedError;
  int get employeeId => throw _privateConstructorUsedError;
  int get outletId => throw _privateConstructorUsedError;
  int? get customerAddressId => throw _privateConstructorUsedError;
  int? get updatedBy => throw _privateConstructorUsedError;
  CustomerModel? get customer => throw _privateConstructorUsedError;
  CustomerAccountModel? get customerAccount =>
      throw _privateConstructorUsedError;
  EmployeeModel? get employee => throw _privateConstructorUsedError;
  OutletModel? get outlet => throw _privateConstructorUsedError;
  dynamic get customerAddress => throw _privateConstructorUsedError;
  EmployeeModel? get statusUpdater => throw _privateConstructorUsedError;
  List<dynamic> get commissionLogs => throw _privateConstructorUsedError;
  OrderReviewModel? get review => throw _privateConstructorUsedError;
  bool get hasReview => throw _privateConstructorUsedError;
  double get subtotal => throw _privateConstructorUsedError;
  double get pickupFee => throw _privateConstructorUsedError;
  String? get formattedPickupFee => throw _privateConstructorUsedError;
  double get deliveryFee => throw _privateConstructorUsedError;
  String? get formattedDeliveryFee => throw _privateConstructorUsedError;
  double get discountAmount => throw _privateConstructorUsedError;
  double get taxAmount => throw _privateConstructorUsedError;
  double get totalAmount => throw _privateConstructorUsedError;
  double get paidAmount => throw _privateConstructorUsedError;
  double get remainingAmount => throw _privateConstructorUsedError;
  String? get formattedSubtotal => throw _privateConstructorUsedError;
  String? get formattedDiscountAmount => throw _privateConstructorUsedError;
  String? get formattedTaxAmount => throw _privateConstructorUsedError;
  String? get formattedTotalAmount => throw _privateConstructorUsedError;
  String? get formattedPaidAmount => throw _privateConstructorUsedError;
  String? get formattedRemainingAmount => throw _privateConstructorUsedError;
  String? get midtransOrderId => throw _privateConstructorUsedError;
  String? get midtransTransactionId => throw _privateConstructorUsedError;
  String? get qrUrl => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get orderDate => throw _privateConstructorUsedError;
  String? get formattedOrderDate => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get estimatedCompletion => throw _privateConstructorUsedError;
  String? get formattedEstimatedCompletion =>
      throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get actualCompletion => throw _privateConstructorUsedError;
  String? get formattedActualCompletion => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get pickupDate => throw _privateConstructorUsedError;
  String? get formattedPickupDate => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get deliveryDate => throw _privateConstructorUsedError;
  String? get formattedDeliveryDate => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get deliverySchedule => throw _privateConstructorUsedError;
  String? get formattedDeliverySchedule => throw _privateConstructorUsedError;
  String? get deliveryAddress => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get lastStatusUpdate => throw _privateConstructorUsedError;
  String? get formattedLastStatusUpdate => throw _privateConstructorUsedError;
  String? get pickupType => throw _privateConstructorUsedError;
  String? get pickupAddress => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get pickupSchedule => throw _privateConstructorUsedError;
  String? get formattedPickupSchedule => throw _privateConstructorUsedError;
  String? get notes => throw _privateConstructorUsedError;
  String? get internalNotes => throw _privateConstructorUsedError;
  dynamic get specialInstructions => throw _privateConstructorUsedError;
  List<OrderItemModel>? get orderItems => throw _privateConstructorUsedError;
  int get orderItemsCount => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  String? get formattedCreatedAt => throw _privateConstructorUsedError;
  String? get formattedUpdatedAt => throw _privateConstructorUsedError;
  @JsonKey(fromJson: toDateTime)
  DateTime? get deletedAt => throw _privateConstructorUsedError;

  /// Serializes this OrderModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OrderModelCopyWith<OrderModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderModelCopyWith<$Res> {
  factory $OrderModelCopyWith(
    OrderModel value,
    $Res Function(OrderModel) then,
  ) = _$OrderModelCopyWithImpl<$Res, OrderModel>;
  @useResult
  $Res call({
    int id,
    String orderNumber,
    String status,
    String? statusLabel,
    String? statusBadgeVariant,
    int completionPercentage,
    String paymentStatus,
    String? paymentStatusLabel,
    String? paymentStatusBadgeVariant,
    String? deliveryType,
    String? deliveryTypeLabel,
    bool canPay,
    bool canScheduleDelivery,
    bool requiresPaymentBeforeDelivery,
    String? source,
    String? sourceLabel,
    String? paymentMethod,
    int customerId,
    int? customerAccountId,
    int employeeId,
    int outletId,
    int? customerAddressId,
    int? updatedBy,
    CustomerModel? customer,
    CustomerAccountModel? customerAccount,
    EmployeeModel? employee,
    OutletModel? outlet,
    dynamic customerAddress,
    EmployeeModel? statusUpdater,
    List<dynamic> commissionLogs,
    OrderReviewModel? review,
    bool hasReview,
    double subtotal,
    double pickupFee,
    String? formattedPickupFee,
    double deliveryFee,
    String? formattedDeliveryFee,
    double discountAmount,
    double taxAmount,
    double totalAmount,
    double paidAmount,
    double remainingAmount,
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
    int orderItemsCount,
    @JsonKey(fromJson: toDateTime) DateTime? createdAt,
    @JsonKey(fromJson: toDateTime) DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
    @JsonKey(fromJson: toDateTime) DateTime? deletedAt,
  });

  $CustomerModelCopyWith<$Res>? get customer;
  $CustomerAccountModelCopyWith<$Res>? get customerAccount;
  $EmployeeModelCopyWith<$Res>? get employee;
  $OutletModelCopyWith<$Res>? get outlet;
  $EmployeeModelCopyWith<$Res>? get statusUpdater;
  $OrderReviewModelCopyWith<$Res>? get review;
}

/// @nodoc
class _$OrderModelCopyWithImpl<$Res, $Val extends OrderModel>
    implements $OrderModelCopyWith<$Res> {
  _$OrderModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderNumber = null,
    Object? status = null,
    Object? statusLabel = freezed,
    Object? statusBadgeVariant = freezed,
    Object? completionPercentage = null,
    Object? paymentStatus = null,
    Object? paymentStatusLabel = freezed,
    Object? paymentStatusBadgeVariant = freezed,
    Object? deliveryType = freezed,
    Object? deliveryTypeLabel = freezed,
    Object? canPay = null,
    Object? canScheduleDelivery = null,
    Object? requiresPaymentBeforeDelivery = null,
    Object? source = freezed,
    Object? sourceLabel = freezed,
    Object? paymentMethod = freezed,
    Object? customerId = null,
    Object? customerAccountId = freezed,
    Object? employeeId = null,
    Object? outletId = null,
    Object? customerAddressId = freezed,
    Object? updatedBy = freezed,
    Object? customer = freezed,
    Object? customerAccount = freezed,
    Object? employee = freezed,
    Object? outlet = freezed,
    Object? customerAddress = freezed,
    Object? statusUpdater = freezed,
    Object? commissionLogs = null,
    Object? review = freezed,
    Object? hasReview = null,
    Object? subtotal = null,
    Object? pickupFee = null,
    Object? formattedPickupFee = freezed,
    Object? deliveryFee = null,
    Object? formattedDeliveryFee = freezed,
    Object? discountAmount = null,
    Object? taxAmount = null,
    Object? totalAmount = null,
    Object? paidAmount = null,
    Object? remainingAmount = null,
    Object? formattedSubtotal = freezed,
    Object? formattedDiscountAmount = freezed,
    Object? formattedTaxAmount = freezed,
    Object? formattedTotalAmount = freezed,
    Object? formattedPaidAmount = freezed,
    Object? formattedRemainingAmount = freezed,
    Object? midtransOrderId = freezed,
    Object? midtransTransactionId = freezed,
    Object? qrUrl = freezed,
    Object? orderDate = freezed,
    Object? formattedOrderDate = freezed,
    Object? estimatedCompletion = freezed,
    Object? formattedEstimatedCompletion = freezed,
    Object? actualCompletion = freezed,
    Object? formattedActualCompletion = freezed,
    Object? pickupDate = freezed,
    Object? formattedPickupDate = freezed,
    Object? deliveryDate = freezed,
    Object? formattedDeliveryDate = freezed,
    Object? deliverySchedule = freezed,
    Object? formattedDeliverySchedule = freezed,
    Object? deliveryAddress = freezed,
    Object? lastStatusUpdate = freezed,
    Object? formattedLastStatusUpdate = freezed,
    Object? pickupType = freezed,
    Object? pickupAddress = freezed,
    Object? pickupSchedule = freezed,
    Object? formattedPickupSchedule = freezed,
    Object? notes = freezed,
    Object? internalNotes = freezed,
    Object? specialInstructions = freezed,
    Object? orderItems = freezed,
    Object? orderItemsCount = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? formattedCreatedAt = freezed,
    Object? formattedUpdatedAt = freezed,
    Object? deletedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            orderNumber: null == orderNumber
                ? _value.orderNumber
                : orderNumber // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            statusLabel: freezed == statusLabel
                ? _value.statusLabel
                : statusLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            statusBadgeVariant: freezed == statusBadgeVariant
                ? _value.statusBadgeVariant
                : statusBadgeVariant // ignore: cast_nullable_to_non_nullable
                      as String?,
            completionPercentage: null == completionPercentage
                ? _value.completionPercentage
                : completionPercentage // ignore: cast_nullable_to_non_nullable
                      as int,
            paymentStatus: null == paymentStatus
                ? _value.paymentStatus
                : paymentStatus // ignore: cast_nullable_to_non_nullable
                      as String,
            paymentStatusLabel: freezed == paymentStatusLabel
                ? _value.paymentStatusLabel
                : paymentStatusLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            paymentStatusBadgeVariant: freezed == paymentStatusBadgeVariant
                ? _value.paymentStatusBadgeVariant
                : paymentStatusBadgeVariant // ignore: cast_nullable_to_non_nullable
                      as String?,
            deliveryType: freezed == deliveryType
                ? _value.deliveryType
                : deliveryType // ignore: cast_nullable_to_non_nullable
                      as String?,
            deliveryTypeLabel: freezed == deliveryTypeLabel
                ? _value.deliveryTypeLabel
                : deliveryTypeLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            canPay: null == canPay
                ? _value.canPay
                : canPay // ignore: cast_nullable_to_non_nullable
                      as bool,
            canScheduleDelivery: null == canScheduleDelivery
                ? _value.canScheduleDelivery
                : canScheduleDelivery // ignore: cast_nullable_to_non_nullable
                      as bool,
            requiresPaymentBeforeDelivery: null == requiresPaymentBeforeDelivery
                ? _value.requiresPaymentBeforeDelivery
                : requiresPaymentBeforeDelivery // ignore: cast_nullable_to_non_nullable
                      as bool,
            source: freezed == source
                ? _value.source
                : source // ignore: cast_nullable_to_non_nullable
                      as String?,
            sourceLabel: freezed == sourceLabel
                ? _value.sourceLabel
                : sourceLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            paymentMethod: freezed == paymentMethod
                ? _value.paymentMethod
                : paymentMethod // ignore: cast_nullable_to_non_nullable
                      as String?,
            customerId: null == customerId
                ? _value.customerId
                : customerId // ignore: cast_nullable_to_non_nullable
                      as int,
            customerAccountId: freezed == customerAccountId
                ? _value.customerAccountId
                : customerAccountId // ignore: cast_nullable_to_non_nullable
                      as int?,
            employeeId: null == employeeId
                ? _value.employeeId
                : employeeId // ignore: cast_nullable_to_non_nullable
                      as int,
            outletId: null == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int,
            customerAddressId: freezed == customerAddressId
                ? _value.customerAddressId
                : customerAddressId // ignore: cast_nullable_to_non_nullable
                      as int?,
            updatedBy: freezed == updatedBy
                ? _value.updatedBy
                : updatedBy // ignore: cast_nullable_to_non_nullable
                      as int?,
            customer: freezed == customer
                ? _value.customer
                : customer // ignore: cast_nullable_to_non_nullable
                      as CustomerModel?,
            customerAccount: freezed == customerAccount
                ? _value.customerAccount
                : customerAccount // ignore: cast_nullable_to_non_nullable
                      as CustomerAccountModel?,
            employee: freezed == employee
                ? _value.employee
                : employee // ignore: cast_nullable_to_non_nullable
                      as EmployeeModel?,
            outlet: freezed == outlet
                ? _value.outlet
                : outlet // ignore: cast_nullable_to_non_nullable
                      as OutletModel?,
            customerAddress: freezed == customerAddress
                ? _value.customerAddress
                : customerAddress // ignore: cast_nullable_to_non_nullable
                      as dynamic,
            statusUpdater: freezed == statusUpdater
                ? _value.statusUpdater
                : statusUpdater // ignore: cast_nullable_to_non_nullable
                      as EmployeeModel?,
            commissionLogs: null == commissionLogs
                ? _value.commissionLogs
                : commissionLogs // ignore: cast_nullable_to_non_nullable
                      as List<dynamic>,
            review: freezed == review
                ? _value.review
                : review // ignore: cast_nullable_to_non_nullable
                      as OrderReviewModel?,
            hasReview: null == hasReview
                ? _value.hasReview
                : hasReview // ignore: cast_nullable_to_non_nullable
                      as bool,
            subtotal: null == subtotal
                ? _value.subtotal
                : subtotal // ignore: cast_nullable_to_non_nullable
                      as double,
            pickupFee: null == pickupFee
                ? _value.pickupFee
                : pickupFee // ignore: cast_nullable_to_non_nullable
                      as double,
            formattedPickupFee: freezed == formattedPickupFee
                ? _value.formattedPickupFee
                : formattedPickupFee // ignore: cast_nullable_to_non_nullable
                      as String?,
            deliveryFee: null == deliveryFee
                ? _value.deliveryFee
                : deliveryFee // ignore: cast_nullable_to_non_nullable
                      as double,
            formattedDeliveryFee: freezed == formattedDeliveryFee
                ? _value.formattedDeliveryFee
                : formattedDeliveryFee // ignore: cast_nullable_to_non_nullable
                      as String?,
            discountAmount: null == discountAmount
                ? _value.discountAmount
                : discountAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            taxAmount: null == taxAmount
                ? _value.taxAmount
                : taxAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            totalAmount: null == totalAmount
                ? _value.totalAmount
                : totalAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            paidAmount: null == paidAmount
                ? _value.paidAmount
                : paidAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            remainingAmount: null == remainingAmount
                ? _value.remainingAmount
                : remainingAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            formattedSubtotal: freezed == formattedSubtotal
                ? _value.formattedSubtotal
                : formattedSubtotal // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedDiscountAmount: freezed == formattedDiscountAmount
                ? _value.formattedDiscountAmount
                : formattedDiscountAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedTaxAmount: freezed == formattedTaxAmount
                ? _value.formattedTaxAmount
                : formattedTaxAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedTotalAmount: freezed == formattedTotalAmount
                ? _value.formattedTotalAmount
                : formattedTotalAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedPaidAmount: freezed == formattedPaidAmount
                ? _value.formattedPaidAmount
                : formattedPaidAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedRemainingAmount: freezed == formattedRemainingAmount
                ? _value.formattedRemainingAmount
                : formattedRemainingAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            midtransOrderId: freezed == midtransOrderId
                ? _value.midtransOrderId
                : midtransOrderId // ignore: cast_nullable_to_non_nullable
                      as String?,
            midtransTransactionId: freezed == midtransTransactionId
                ? _value.midtransTransactionId
                : midtransTransactionId // ignore: cast_nullable_to_non_nullable
                      as String?,
            qrUrl: freezed == qrUrl
                ? _value.qrUrl
                : qrUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            orderDate: freezed == orderDate
                ? _value.orderDate
                : orderDate // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedOrderDate: freezed == formattedOrderDate
                ? _value.formattedOrderDate
                : formattedOrderDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            estimatedCompletion: freezed == estimatedCompletion
                ? _value.estimatedCompletion
                : estimatedCompletion // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedEstimatedCompletion:
                freezed == formattedEstimatedCompletion
                ? _value.formattedEstimatedCompletion
                : formattedEstimatedCompletion // ignore: cast_nullable_to_non_nullable
                      as String?,
            actualCompletion: freezed == actualCompletion
                ? _value.actualCompletion
                : actualCompletion // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedActualCompletion: freezed == formattedActualCompletion
                ? _value.formattedActualCompletion
                : formattedActualCompletion // ignore: cast_nullable_to_non_nullable
                      as String?,
            pickupDate: freezed == pickupDate
                ? _value.pickupDate
                : pickupDate // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedPickupDate: freezed == formattedPickupDate
                ? _value.formattedPickupDate
                : formattedPickupDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            deliveryDate: freezed == deliveryDate
                ? _value.deliveryDate
                : deliveryDate // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedDeliveryDate: freezed == formattedDeliveryDate
                ? _value.formattedDeliveryDate
                : formattedDeliveryDate // ignore: cast_nullable_to_non_nullable
                      as String?,
            deliverySchedule: freezed == deliverySchedule
                ? _value.deliverySchedule
                : deliverySchedule // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedDeliverySchedule: freezed == formattedDeliverySchedule
                ? _value.formattedDeliverySchedule
                : formattedDeliverySchedule // ignore: cast_nullable_to_non_nullable
                      as String?,
            deliveryAddress: freezed == deliveryAddress
                ? _value.deliveryAddress
                : deliveryAddress // ignore: cast_nullable_to_non_nullable
                      as String?,
            lastStatusUpdate: freezed == lastStatusUpdate
                ? _value.lastStatusUpdate
                : lastStatusUpdate // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedLastStatusUpdate: freezed == formattedLastStatusUpdate
                ? _value.formattedLastStatusUpdate
                : formattedLastStatusUpdate // ignore: cast_nullable_to_non_nullable
                      as String?,
            pickupType: freezed == pickupType
                ? _value.pickupType
                : pickupType // ignore: cast_nullable_to_non_nullable
                      as String?,
            pickupAddress: freezed == pickupAddress
                ? _value.pickupAddress
                : pickupAddress // ignore: cast_nullable_to_non_nullable
                      as String?,
            pickupSchedule: freezed == pickupSchedule
                ? _value.pickupSchedule
                : pickupSchedule // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedPickupSchedule: freezed == formattedPickupSchedule
                ? _value.formattedPickupSchedule
                : formattedPickupSchedule // ignore: cast_nullable_to_non_nullable
                      as String?,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            internalNotes: freezed == internalNotes
                ? _value.internalNotes
                : internalNotes // ignore: cast_nullable_to_non_nullable
                      as String?,
            specialInstructions: freezed == specialInstructions
                ? _value.specialInstructions
                : specialInstructions // ignore: cast_nullable_to_non_nullable
                      as dynamic,
            orderItems: freezed == orderItems
                ? _value.orderItems
                : orderItems // ignore: cast_nullable_to_non_nullable
                      as List<OrderItemModel>?,
            orderItemsCount: null == orderItemsCount
                ? _value.orderItemsCount
                : orderItemsCount // ignore: cast_nullable_to_non_nullable
                      as int,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedCreatedAt: freezed == formattedCreatedAt
                ? _value.formattedCreatedAt
                : formattedCreatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedUpdatedAt: freezed == formattedUpdatedAt
                ? _value.formattedUpdatedAt
                : formattedUpdatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            deletedAt: freezed == deletedAt
                ? _value.deletedAt
                : deletedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CustomerModelCopyWith<$Res>? get customer {
    if (_value.customer == null) {
      return null;
    }

    return $CustomerModelCopyWith<$Res>(_value.customer!, (value) {
      return _then(_value.copyWith(customer: value) as $Val);
    });
  }

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CustomerAccountModelCopyWith<$Res>? get customerAccount {
    if (_value.customerAccount == null) {
      return null;
    }

    return $CustomerAccountModelCopyWith<$Res>(_value.customerAccount!, (
      value,
    ) {
      return _then(_value.copyWith(customerAccount: value) as $Val);
    });
  }

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $EmployeeModelCopyWith<$Res>? get employee {
    if (_value.employee == null) {
      return null;
    }

    return $EmployeeModelCopyWith<$Res>(_value.employee!, (value) {
      return _then(_value.copyWith(employee: value) as $Val);
    });
  }

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $OutletModelCopyWith<$Res>? get outlet {
    if (_value.outlet == null) {
      return null;
    }

    return $OutletModelCopyWith<$Res>(_value.outlet!, (value) {
      return _then(_value.copyWith(outlet: value) as $Val);
    });
  }

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $EmployeeModelCopyWith<$Res>? get statusUpdater {
    if (_value.statusUpdater == null) {
      return null;
    }

    return $EmployeeModelCopyWith<$Res>(_value.statusUpdater!, (value) {
      return _then(_value.copyWith(statusUpdater: value) as $Val);
    });
  }

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $OrderReviewModelCopyWith<$Res>? get review {
    if (_value.review == null) {
      return null;
    }

    return $OrderReviewModelCopyWith<$Res>(_value.review!, (value) {
      return _then(_value.copyWith(review: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$OrderModelImplCopyWith<$Res>
    implements $OrderModelCopyWith<$Res> {
  factory _$$OrderModelImplCopyWith(
    _$OrderModelImpl value,
    $Res Function(_$OrderModelImpl) then,
  ) = __$$OrderModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    String orderNumber,
    String status,
    String? statusLabel,
    String? statusBadgeVariant,
    int completionPercentage,
    String paymentStatus,
    String? paymentStatusLabel,
    String? paymentStatusBadgeVariant,
    String? deliveryType,
    String? deliveryTypeLabel,
    bool canPay,
    bool canScheduleDelivery,
    bool requiresPaymentBeforeDelivery,
    String? source,
    String? sourceLabel,
    String? paymentMethod,
    int customerId,
    int? customerAccountId,
    int employeeId,
    int outletId,
    int? customerAddressId,
    int? updatedBy,
    CustomerModel? customer,
    CustomerAccountModel? customerAccount,
    EmployeeModel? employee,
    OutletModel? outlet,
    dynamic customerAddress,
    EmployeeModel? statusUpdater,
    List<dynamic> commissionLogs,
    OrderReviewModel? review,
    bool hasReview,
    double subtotal,
    double pickupFee,
    String? formattedPickupFee,
    double deliveryFee,
    String? formattedDeliveryFee,
    double discountAmount,
    double taxAmount,
    double totalAmount,
    double paidAmount,
    double remainingAmount,
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
    int orderItemsCount,
    @JsonKey(fromJson: toDateTime) DateTime? createdAt,
    @JsonKey(fromJson: toDateTime) DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
    @JsonKey(fromJson: toDateTime) DateTime? deletedAt,
  });

  @override
  $CustomerModelCopyWith<$Res>? get customer;
  @override
  $CustomerAccountModelCopyWith<$Res>? get customerAccount;
  @override
  $EmployeeModelCopyWith<$Res>? get employee;
  @override
  $OutletModelCopyWith<$Res>? get outlet;
  @override
  $EmployeeModelCopyWith<$Res>? get statusUpdater;
  @override
  $OrderReviewModelCopyWith<$Res>? get review;
}

/// @nodoc
class __$$OrderModelImplCopyWithImpl<$Res>
    extends _$OrderModelCopyWithImpl<$Res, _$OrderModelImpl>
    implements _$$OrderModelImplCopyWith<$Res> {
  __$$OrderModelImplCopyWithImpl(
    _$OrderModelImpl _value,
    $Res Function(_$OrderModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderNumber = null,
    Object? status = null,
    Object? statusLabel = freezed,
    Object? statusBadgeVariant = freezed,
    Object? completionPercentage = null,
    Object? paymentStatus = null,
    Object? paymentStatusLabel = freezed,
    Object? paymentStatusBadgeVariant = freezed,
    Object? deliveryType = freezed,
    Object? deliveryTypeLabel = freezed,
    Object? canPay = null,
    Object? canScheduleDelivery = null,
    Object? requiresPaymentBeforeDelivery = null,
    Object? source = freezed,
    Object? sourceLabel = freezed,
    Object? paymentMethod = freezed,
    Object? customerId = null,
    Object? customerAccountId = freezed,
    Object? employeeId = null,
    Object? outletId = null,
    Object? customerAddressId = freezed,
    Object? updatedBy = freezed,
    Object? customer = freezed,
    Object? customerAccount = freezed,
    Object? employee = freezed,
    Object? outlet = freezed,
    Object? customerAddress = freezed,
    Object? statusUpdater = freezed,
    Object? commissionLogs = null,
    Object? review = freezed,
    Object? hasReview = null,
    Object? subtotal = null,
    Object? pickupFee = null,
    Object? formattedPickupFee = freezed,
    Object? deliveryFee = null,
    Object? formattedDeliveryFee = freezed,
    Object? discountAmount = null,
    Object? taxAmount = null,
    Object? totalAmount = null,
    Object? paidAmount = null,
    Object? remainingAmount = null,
    Object? formattedSubtotal = freezed,
    Object? formattedDiscountAmount = freezed,
    Object? formattedTaxAmount = freezed,
    Object? formattedTotalAmount = freezed,
    Object? formattedPaidAmount = freezed,
    Object? formattedRemainingAmount = freezed,
    Object? midtransOrderId = freezed,
    Object? midtransTransactionId = freezed,
    Object? qrUrl = freezed,
    Object? orderDate = freezed,
    Object? formattedOrderDate = freezed,
    Object? estimatedCompletion = freezed,
    Object? formattedEstimatedCompletion = freezed,
    Object? actualCompletion = freezed,
    Object? formattedActualCompletion = freezed,
    Object? pickupDate = freezed,
    Object? formattedPickupDate = freezed,
    Object? deliveryDate = freezed,
    Object? formattedDeliveryDate = freezed,
    Object? deliverySchedule = freezed,
    Object? formattedDeliverySchedule = freezed,
    Object? deliveryAddress = freezed,
    Object? lastStatusUpdate = freezed,
    Object? formattedLastStatusUpdate = freezed,
    Object? pickupType = freezed,
    Object? pickupAddress = freezed,
    Object? pickupSchedule = freezed,
    Object? formattedPickupSchedule = freezed,
    Object? notes = freezed,
    Object? internalNotes = freezed,
    Object? specialInstructions = freezed,
    Object? orderItems = freezed,
    Object? orderItemsCount = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? formattedCreatedAt = freezed,
    Object? formattedUpdatedAt = freezed,
    Object? deletedAt = freezed,
  }) {
    return _then(
      _$OrderModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        orderNumber: null == orderNumber
            ? _value.orderNumber
            : orderNumber // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        statusLabel: freezed == statusLabel
            ? _value.statusLabel
            : statusLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        statusBadgeVariant: freezed == statusBadgeVariant
            ? _value.statusBadgeVariant
            : statusBadgeVariant // ignore: cast_nullable_to_non_nullable
                  as String?,
        completionPercentage: null == completionPercentage
            ? _value.completionPercentage
            : completionPercentage // ignore: cast_nullable_to_non_nullable
                  as int,
        paymentStatus: null == paymentStatus
            ? _value.paymentStatus
            : paymentStatus // ignore: cast_nullable_to_non_nullable
                  as String,
        paymentStatusLabel: freezed == paymentStatusLabel
            ? _value.paymentStatusLabel
            : paymentStatusLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        paymentStatusBadgeVariant: freezed == paymentStatusBadgeVariant
            ? _value.paymentStatusBadgeVariant
            : paymentStatusBadgeVariant // ignore: cast_nullable_to_non_nullable
                  as String?,
        deliveryType: freezed == deliveryType
            ? _value.deliveryType
            : deliveryType // ignore: cast_nullable_to_non_nullable
                  as String?,
        deliveryTypeLabel: freezed == deliveryTypeLabel
            ? _value.deliveryTypeLabel
            : deliveryTypeLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        canPay: null == canPay
            ? _value.canPay
            : canPay // ignore: cast_nullable_to_non_nullable
                  as bool,
        canScheduleDelivery: null == canScheduleDelivery
            ? _value.canScheduleDelivery
            : canScheduleDelivery // ignore: cast_nullable_to_non_nullable
                  as bool,
        requiresPaymentBeforeDelivery: null == requiresPaymentBeforeDelivery
            ? _value.requiresPaymentBeforeDelivery
            : requiresPaymentBeforeDelivery // ignore: cast_nullable_to_non_nullable
                  as bool,
        source: freezed == source
            ? _value.source
            : source // ignore: cast_nullable_to_non_nullable
                  as String?,
        sourceLabel: freezed == sourceLabel
            ? _value.sourceLabel
            : sourceLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        paymentMethod: freezed == paymentMethod
            ? _value.paymentMethod
            : paymentMethod // ignore: cast_nullable_to_non_nullable
                  as String?,
        customerId: null == customerId
            ? _value.customerId
            : customerId // ignore: cast_nullable_to_non_nullable
                  as int,
        customerAccountId: freezed == customerAccountId
            ? _value.customerAccountId
            : customerAccountId // ignore: cast_nullable_to_non_nullable
                  as int?,
        employeeId: null == employeeId
            ? _value.employeeId
            : employeeId // ignore: cast_nullable_to_non_nullable
                  as int,
        outletId: null == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int,
        customerAddressId: freezed == customerAddressId
            ? _value.customerAddressId
            : customerAddressId // ignore: cast_nullable_to_non_nullable
                  as int?,
        updatedBy: freezed == updatedBy
            ? _value.updatedBy
            : updatedBy // ignore: cast_nullable_to_non_nullable
                  as int?,
        customer: freezed == customer
            ? _value.customer
            : customer // ignore: cast_nullable_to_non_nullable
                  as CustomerModel?,
        customerAccount: freezed == customerAccount
            ? _value.customerAccount
            : customerAccount // ignore: cast_nullable_to_non_nullable
                  as CustomerAccountModel?,
        employee: freezed == employee
            ? _value.employee
            : employee // ignore: cast_nullable_to_non_nullable
                  as EmployeeModel?,
        outlet: freezed == outlet
            ? _value.outlet
            : outlet // ignore: cast_nullable_to_non_nullable
                  as OutletModel?,
        customerAddress: freezed == customerAddress
            ? _value.customerAddress
            : customerAddress // ignore: cast_nullable_to_non_nullable
                  as dynamic,
        statusUpdater: freezed == statusUpdater
            ? _value.statusUpdater
            : statusUpdater // ignore: cast_nullable_to_non_nullable
                  as EmployeeModel?,
        commissionLogs: null == commissionLogs
            ? _value._commissionLogs
            : commissionLogs // ignore: cast_nullable_to_non_nullable
                  as List<dynamic>,
        review: freezed == review
            ? _value.review
            : review // ignore: cast_nullable_to_non_nullable
                  as OrderReviewModel?,
        hasReview: null == hasReview
            ? _value.hasReview
            : hasReview // ignore: cast_nullable_to_non_nullable
                  as bool,
        subtotal: null == subtotal
            ? _value.subtotal
            : subtotal // ignore: cast_nullable_to_non_nullable
                  as double,
        pickupFee: null == pickupFee
            ? _value.pickupFee
            : pickupFee // ignore: cast_nullable_to_non_nullable
                  as double,
        formattedPickupFee: freezed == formattedPickupFee
            ? _value.formattedPickupFee
            : formattedPickupFee // ignore: cast_nullable_to_non_nullable
                  as String?,
        deliveryFee: null == deliveryFee
            ? _value.deliveryFee
            : deliveryFee // ignore: cast_nullable_to_non_nullable
                  as double,
        formattedDeliveryFee: freezed == formattedDeliveryFee
            ? _value.formattedDeliveryFee
            : formattedDeliveryFee // ignore: cast_nullable_to_non_nullable
                  as String?,
        discountAmount: null == discountAmount
            ? _value.discountAmount
            : discountAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        taxAmount: null == taxAmount
            ? _value.taxAmount
            : taxAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        totalAmount: null == totalAmount
            ? _value.totalAmount
            : totalAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        paidAmount: null == paidAmount
            ? _value.paidAmount
            : paidAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        remainingAmount: null == remainingAmount
            ? _value.remainingAmount
            : remainingAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        formattedSubtotal: freezed == formattedSubtotal
            ? _value.formattedSubtotal
            : formattedSubtotal // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedDiscountAmount: freezed == formattedDiscountAmount
            ? _value.formattedDiscountAmount
            : formattedDiscountAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedTaxAmount: freezed == formattedTaxAmount
            ? _value.formattedTaxAmount
            : formattedTaxAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedTotalAmount: freezed == formattedTotalAmount
            ? _value.formattedTotalAmount
            : formattedTotalAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedPaidAmount: freezed == formattedPaidAmount
            ? _value.formattedPaidAmount
            : formattedPaidAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedRemainingAmount: freezed == formattedRemainingAmount
            ? _value.formattedRemainingAmount
            : formattedRemainingAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        midtransOrderId: freezed == midtransOrderId
            ? _value.midtransOrderId
            : midtransOrderId // ignore: cast_nullable_to_non_nullable
                  as String?,
        midtransTransactionId: freezed == midtransTransactionId
            ? _value.midtransTransactionId
            : midtransTransactionId // ignore: cast_nullable_to_non_nullable
                  as String?,
        qrUrl: freezed == qrUrl
            ? _value.qrUrl
            : qrUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        orderDate: freezed == orderDate
            ? _value.orderDate
            : orderDate // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedOrderDate: freezed == formattedOrderDate
            ? _value.formattedOrderDate
            : formattedOrderDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        estimatedCompletion: freezed == estimatedCompletion
            ? _value.estimatedCompletion
            : estimatedCompletion // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedEstimatedCompletion: freezed == formattedEstimatedCompletion
            ? _value.formattedEstimatedCompletion
            : formattedEstimatedCompletion // ignore: cast_nullable_to_non_nullable
                  as String?,
        actualCompletion: freezed == actualCompletion
            ? _value.actualCompletion
            : actualCompletion // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedActualCompletion: freezed == formattedActualCompletion
            ? _value.formattedActualCompletion
            : formattedActualCompletion // ignore: cast_nullable_to_non_nullable
                  as String?,
        pickupDate: freezed == pickupDate
            ? _value.pickupDate
            : pickupDate // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedPickupDate: freezed == formattedPickupDate
            ? _value.formattedPickupDate
            : formattedPickupDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        deliveryDate: freezed == deliveryDate
            ? _value.deliveryDate
            : deliveryDate // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedDeliveryDate: freezed == formattedDeliveryDate
            ? _value.formattedDeliveryDate
            : formattedDeliveryDate // ignore: cast_nullable_to_non_nullable
                  as String?,
        deliverySchedule: freezed == deliverySchedule
            ? _value.deliverySchedule
            : deliverySchedule // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedDeliverySchedule: freezed == formattedDeliverySchedule
            ? _value.formattedDeliverySchedule
            : formattedDeliverySchedule // ignore: cast_nullable_to_non_nullable
                  as String?,
        deliveryAddress: freezed == deliveryAddress
            ? _value.deliveryAddress
            : deliveryAddress // ignore: cast_nullable_to_non_nullable
                  as String?,
        lastStatusUpdate: freezed == lastStatusUpdate
            ? _value.lastStatusUpdate
            : lastStatusUpdate // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedLastStatusUpdate: freezed == formattedLastStatusUpdate
            ? _value.formattedLastStatusUpdate
            : formattedLastStatusUpdate // ignore: cast_nullable_to_non_nullable
                  as String?,
        pickupType: freezed == pickupType
            ? _value.pickupType
            : pickupType // ignore: cast_nullable_to_non_nullable
                  as String?,
        pickupAddress: freezed == pickupAddress
            ? _value.pickupAddress
            : pickupAddress // ignore: cast_nullable_to_non_nullable
                  as String?,
        pickupSchedule: freezed == pickupSchedule
            ? _value.pickupSchedule
            : pickupSchedule // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedPickupSchedule: freezed == formattedPickupSchedule
            ? _value.formattedPickupSchedule
            : formattedPickupSchedule // ignore: cast_nullable_to_non_nullable
                  as String?,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        internalNotes: freezed == internalNotes
            ? _value.internalNotes
            : internalNotes // ignore: cast_nullable_to_non_nullable
                  as String?,
        specialInstructions: freezed == specialInstructions
            ? _value.specialInstructions
            : specialInstructions // ignore: cast_nullable_to_non_nullable
                  as dynamic,
        orderItems: freezed == orderItems
            ? _value._orderItems
            : orderItems // ignore: cast_nullable_to_non_nullable
                  as List<OrderItemModel>?,
        orderItemsCount: null == orderItemsCount
            ? _value.orderItemsCount
            : orderItemsCount // ignore: cast_nullable_to_non_nullable
                  as int,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedCreatedAt: freezed == formattedCreatedAt
            ? _value.formattedCreatedAt
            : formattedCreatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedUpdatedAt: freezed == formattedUpdatedAt
            ? _value.formattedUpdatedAt
            : formattedUpdatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        deletedAt: freezed == deletedAt
            ? _value.deletedAt
            : deletedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderModelImpl extends _OrderModel {
  const _$OrderModelImpl({
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
    final List<dynamic> commissionLogs = const [],
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
    @JsonKey(fromJson: toDateTime) this.orderDate,
    this.formattedOrderDate,
    @JsonKey(fromJson: toDateTime) this.estimatedCompletion,
    this.formattedEstimatedCompletion,
    @JsonKey(fromJson: toDateTime) this.actualCompletion,
    this.formattedActualCompletion,
    @JsonKey(fromJson: toDateTime) this.pickupDate,
    this.formattedPickupDate,
    @JsonKey(fromJson: toDateTime) this.deliveryDate,
    this.formattedDeliveryDate,
    @JsonKey(fromJson: toDateTime) this.deliverySchedule,
    this.formattedDeliverySchedule,
    this.deliveryAddress,
    @JsonKey(fromJson: toDateTime) this.lastStatusUpdate,
    this.formattedLastStatusUpdate,
    this.pickupType,
    this.pickupAddress,
    @JsonKey(fromJson: toDateTime) this.pickupSchedule,
    this.formattedPickupSchedule,
    this.notes,
    this.internalNotes,
    this.specialInstructions,
    final List<OrderItemModel>? orderItems,
    this.orderItemsCount = 0,
    @JsonKey(fromJson: toDateTime) this.createdAt,
    @JsonKey(fromJson: toDateTime) this.updatedAt,
    this.formattedCreatedAt,
    this.formattedUpdatedAt,
    @JsonKey(fromJson: toDateTime) this.deletedAt,
  }) : _commissionLogs = commissionLogs,
       _orderItems = orderItems,
       super._();

  factory _$OrderModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderModelImplFromJson(json);

  @override
  final int id;
  @override
  final String orderNumber;
  @override
  final String status;
  @override
  final String? statusLabel;
  @override
  final String? statusBadgeVariant;
  @override
  @JsonKey()
  final int completionPercentage;
  @override
  final String paymentStatus;
  @override
  final String? paymentStatusLabel;
  @override
  final String? paymentStatusBadgeVariant;
  @override
  final String? deliveryType;
  @override
  final String? deliveryTypeLabel;
  @override
  @JsonKey()
  final bool canPay;
  @override
  @JsonKey()
  final bool canScheduleDelivery;
  @override
  @JsonKey()
  final bool requiresPaymentBeforeDelivery;
  @override
  final String? source;
  @override
  final String? sourceLabel;
  @override
  final String? paymentMethod;
  @override
  final int customerId;
  @override
  final int? customerAccountId;
  @override
  final int employeeId;
  @override
  final int outletId;
  @override
  final int? customerAddressId;
  @override
  final int? updatedBy;
  @override
  final CustomerModel? customer;
  @override
  final CustomerAccountModel? customerAccount;
  @override
  final EmployeeModel? employee;
  @override
  final OutletModel? outlet;
  @override
  final dynamic customerAddress;
  @override
  final EmployeeModel? statusUpdater;
  final List<dynamic> _commissionLogs;
  @override
  @JsonKey()
  List<dynamic> get commissionLogs {
    if (_commissionLogs is EqualUnmodifiableListView) return _commissionLogs;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_commissionLogs);
  }

  @override
  final OrderReviewModel? review;
  @override
  @JsonKey()
  final bool hasReview;
  @override
  @JsonKey()
  final double subtotal;
  @override
  @JsonKey()
  final double pickupFee;
  @override
  final String? formattedPickupFee;
  @override
  @JsonKey()
  final double deliveryFee;
  @override
  final String? formattedDeliveryFee;
  @override
  @JsonKey()
  final double discountAmount;
  @override
  @JsonKey()
  final double taxAmount;
  @override
  @JsonKey()
  final double totalAmount;
  @override
  @JsonKey()
  final double paidAmount;
  @override
  @JsonKey()
  final double remainingAmount;
  @override
  final String? formattedSubtotal;
  @override
  final String? formattedDiscountAmount;
  @override
  final String? formattedTaxAmount;
  @override
  final String? formattedTotalAmount;
  @override
  final String? formattedPaidAmount;
  @override
  final String? formattedRemainingAmount;
  @override
  final String? midtransOrderId;
  @override
  final String? midtransTransactionId;
  @override
  final String? qrUrl;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? orderDate;
  @override
  final String? formattedOrderDate;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? estimatedCompletion;
  @override
  final String? formattedEstimatedCompletion;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? actualCompletion;
  @override
  final String? formattedActualCompletion;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? pickupDate;
  @override
  final String? formattedPickupDate;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? deliveryDate;
  @override
  final String? formattedDeliveryDate;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? deliverySchedule;
  @override
  final String? formattedDeliverySchedule;
  @override
  final String? deliveryAddress;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? lastStatusUpdate;
  @override
  final String? formattedLastStatusUpdate;
  @override
  final String? pickupType;
  @override
  final String? pickupAddress;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? pickupSchedule;
  @override
  final String? formattedPickupSchedule;
  @override
  final String? notes;
  @override
  final String? internalNotes;
  @override
  final dynamic specialInstructions;
  final List<OrderItemModel>? _orderItems;
  @override
  List<OrderItemModel>? get orderItems {
    final value = _orderItems;
    if (value == null) return null;
    if (_orderItems is EqualUnmodifiableListView) return _orderItems;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  @JsonKey()
  final int orderItemsCount;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? createdAt;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? updatedAt;
  @override
  final String? formattedCreatedAt;
  @override
  final String? formattedUpdatedAt;
  @override
  @JsonKey(fromJson: toDateTime)
  final DateTime? deletedAt;

  @override
  String toString() {
    return 'OrderModel(id: $id, orderNumber: $orderNumber, status: $status, statusLabel: $statusLabel, statusBadgeVariant: $statusBadgeVariant, completionPercentage: $completionPercentage, paymentStatus: $paymentStatus, paymentStatusLabel: $paymentStatusLabel, paymentStatusBadgeVariant: $paymentStatusBadgeVariant, deliveryType: $deliveryType, deliveryTypeLabel: $deliveryTypeLabel, canPay: $canPay, canScheduleDelivery: $canScheduleDelivery, requiresPaymentBeforeDelivery: $requiresPaymentBeforeDelivery, source: $source, sourceLabel: $sourceLabel, paymentMethod: $paymentMethod, customerId: $customerId, customerAccountId: $customerAccountId, employeeId: $employeeId, outletId: $outletId, customerAddressId: $customerAddressId, updatedBy: $updatedBy, customer: $customer, customerAccount: $customerAccount, employee: $employee, outlet: $outlet, customerAddress: $customerAddress, statusUpdater: $statusUpdater, commissionLogs: $commissionLogs, review: $review, hasReview: $hasReview, subtotal: $subtotal, pickupFee: $pickupFee, formattedPickupFee: $formattedPickupFee, deliveryFee: $deliveryFee, formattedDeliveryFee: $formattedDeliveryFee, discountAmount: $discountAmount, taxAmount: $taxAmount, totalAmount: $totalAmount, paidAmount: $paidAmount, remainingAmount: $remainingAmount, formattedSubtotal: $formattedSubtotal, formattedDiscountAmount: $formattedDiscountAmount, formattedTaxAmount: $formattedTaxAmount, formattedTotalAmount: $formattedTotalAmount, formattedPaidAmount: $formattedPaidAmount, formattedRemainingAmount: $formattedRemainingAmount, midtransOrderId: $midtransOrderId, midtransTransactionId: $midtransTransactionId, qrUrl: $qrUrl, orderDate: $orderDate, formattedOrderDate: $formattedOrderDate, estimatedCompletion: $estimatedCompletion, formattedEstimatedCompletion: $formattedEstimatedCompletion, actualCompletion: $actualCompletion, formattedActualCompletion: $formattedActualCompletion, pickupDate: $pickupDate, formattedPickupDate: $formattedPickupDate, deliveryDate: $deliveryDate, formattedDeliveryDate: $formattedDeliveryDate, deliverySchedule: $deliverySchedule, formattedDeliverySchedule: $formattedDeliverySchedule, deliveryAddress: $deliveryAddress, lastStatusUpdate: $lastStatusUpdate, formattedLastStatusUpdate: $formattedLastStatusUpdate, pickupType: $pickupType, pickupAddress: $pickupAddress, pickupSchedule: $pickupSchedule, formattedPickupSchedule: $formattedPickupSchedule, notes: $notes, internalNotes: $internalNotes, specialInstructions: $specialInstructions, orderItems: $orderItems, orderItemsCount: $orderItemsCount, createdAt: $createdAt, updatedAt: $updatedAt, formattedCreatedAt: $formattedCreatedAt, formattedUpdatedAt: $formattedUpdatedAt, deletedAt: $deletedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.orderNumber, orderNumber) ||
                other.orderNumber == orderNumber) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.statusLabel, statusLabel) ||
                other.statusLabel == statusLabel) &&
            (identical(other.statusBadgeVariant, statusBadgeVariant) ||
                other.statusBadgeVariant == statusBadgeVariant) &&
            (identical(other.completionPercentage, completionPercentage) ||
                other.completionPercentage == completionPercentage) &&
            (identical(other.paymentStatus, paymentStatus) ||
                other.paymentStatus == paymentStatus) &&
            (identical(other.paymentStatusLabel, paymentStatusLabel) ||
                other.paymentStatusLabel == paymentStatusLabel) &&
            (identical(
                  other.paymentStatusBadgeVariant,
                  paymentStatusBadgeVariant,
                ) ||
                other.paymentStatusBadgeVariant == paymentStatusBadgeVariant) &&
            (identical(other.deliveryType, deliveryType) ||
                other.deliveryType == deliveryType) &&
            (identical(other.deliveryTypeLabel, deliveryTypeLabel) ||
                other.deliveryTypeLabel == deliveryTypeLabel) &&
            (identical(other.canPay, canPay) || other.canPay == canPay) &&
            (identical(other.canScheduleDelivery, canScheduleDelivery) ||
                other.canScheduleDelivery == canScheduleDelivery) &&
            (identical(
                  other.requiresPaymentBeforeDelivery,
                  requiresPaymentBeforeDelivery,
                ) ||
                other.requiresPaymentBeforeDelivery ==
                    requiresPaymentBeforeDelivery) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.sourceLabel, sourceLabel) ||
                other.sourceLabel == sourceLabel) &&
            (identical(other.paymentMethod, paymentMethod) ||
                other.paymentMethod == paymentMethod) &&
            (identical(other.customerId, customerId) ||
                other.customerId == customerId) &&
            (identical(other.customerAccountId, customerAccountId) ||
                other.customerAccountId == customerAccountId) &&
            (identical(other.employeeId, employeeId) ||
                other.employeeId == employeeId) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.customerAddressId, customerAddressId) ||
                other.customerAddressId == customerAddressId) &&
            (identical(other.updatedBy, updatedBy) ||
                other.updatedBy == updatedBy) &&
            (identical(other.customer, customer) ||
                other.customer == customer) &&
            (identical(other.customerAccount, customerAccount) ||
                other.customerAccount == customerAccount) &&
            (identical(other.employee, employee) ||
                other.employee == employee) &&
            (identical(other.outlet, outlet) || other.outlet == outlet) &&
            const DeepCollectionEquality().equals(
              other.customerAddress,
              customerAddress,
            ) &&
            (identical(other.statusUpdater, statusUpdater) ||
                other.statusUpdater == statusUpdater) &&
            const DeepCollectionEquality().equals(
              other._commissionLogs,
              _commissionLogs,
            ) &&
            (identical(other.review, review) || other.review == review) &&
            (identical(other.hasReview, hasReview) ||
                other.hasReview == hasReview) &&
            (identical(other.subtotal, subtotal) ||
                other.subtotal == subtotal) &&
            (identical(other.pickupFee, pickupFee) ||
                other.pickupFee == pickupFee) &&
            (identical(other.formattedPickupFee, formattedPickupFee) ||
                other.formattedPickupFee == formattedPickupFee) &&
            (identical(other.deliveryFee, deliveryFee) ||
                other.deliveryFee == deliveryFee) &&
            (identical(other.formattedDeliveryFee, formattedDeliveryFee) ||
                other.formattedDeliveryFee == formattedDeliveryFee) &&
            (identical(other.discountAmount, discountAmount) ||
                other.discountAmount == discountAmount) &&
            (identical(other.taxAmount, taxAmount) ||
                other.taxAmount == taxAmount) &&
            (identical(other.totalAmount, totalAmount) ||
                other.totalAmount == totalAmount) &&
            (identical(other.paidAmount, paidAmount) ||
                other.paidAmount == paidAmount) &&
            (identical(other.remainingAmount, remainingAmount) ||
                other.remainingAmount == remainingAmount) &&
            (identical(other.formattedSubtotal, formattedSubtotal) ||
                other.formattedSubtotal == formattedSubtotal) &&
            (identical(
                  other.formattedDiscountAmount,
                  formattedDiscountAmount,
                ) ||
                other.formattedDiscountAmount == formattedDiscountAmount) &&
            (identical(other.formattedTaxAmount, formattedTaxAmount) ||
                other.formattedTaxAmount == formattedTaxAmount) &&
            (identical(other.formattedTotalAmount, formattedTotalAmount) ||
                other.formattedTotalAmount == formattedTotalAmount) &&
            (identical(other.formattedPaidAmount, formattedPaidAmount) ||
                other.formattedPaidAmount == formattedPaidAmount) &&
            (identical(
                  other.formattedRemainingAmount,
                  formattedRemainingAmount,
                ) ||
                other.formattedRemainingAmount == formattedRemainingAmount) &&
            (identical(other.midtransOrderId, midtransOrderId) ||
                other.midtransOrderId == midtransOrderId) &&
            (identical(other.midtransTransactionId, midtransTransactionId) ||
                other.midtransTransactionId == midtransTransactionId) &&
            (identical(other.qrUrl, qrUrl) || other.qrUrl == qrUrl) &&
            (identical(other.orderDate, orderDate) ||
                other.orderDate == orderDate) &&
            (identical(other.formattedOrderDate, formattedOrderDate) ||
                other.formattedOrderDate == formattedOrderDate) &&
            (identical(other.estimatedCompletion, estimatedCompletion) ||
                other.estimatedCompletion == estimatedCompletion) &&
            (identical(
                  other.formattedEstimatedCompletion,
                  formattedEstimatedCompletion,
                ) ||
                other.formattedEstimatedCompletion ==
                    formattedEstimatedCompletion) &&
            (identical(other.actualCompletion, actualCompletion) ||
                other.actualCompletion == actualCompletion) &&
            (identical(
                  other.formattedActualCompletion,
                  formattedActualCompletion,
                ) ||
                other.formattedActualCompletion == formattedActualCompletion) &&
            (identical(other.pickupDate, pickupDate) ||
                other.pickupDate == pickupDate) &&
            (identical(other.formattedPickupDate, formattedPickupDate) ||
                other.formattedPickupDate == formattedPickupDate) &&
            (identical(other.deliveryDate, deliveryDate) ||
                other.deliveryDate == deliveryDate) &&
            (identical(other.formattedDeliveryDate, formattedDeliveryDate) ||
                other.formattedDeliveryDate == formattedDeliveryDate) &&
            (identical(other.deliverySchedule, deliverySchedule) ||
                other.deliverySchedule == deliverySchedule) &&
            (identical(
                  other.formattedDeliverySchedule,
                  formattedDeliverySchedule,
                ) ||
                other.formattedDeliverySchedule == formattedDeliverySchedule) &&
            (identical(other.deliveryAddress, deliveryAddress) ||
                other.deliveryAddress == deliveryAddress) &&
            (identical(other.lastStatusUpdate, lastStatusUpdate) ||
                other.lastStatusUpdate == lastStatusUpdate) &&
            (identical(
                  other.formattedLastStatusUpdate,
                  formattedLastStatusUpdate,
                ) ||
                other.formattedLastStatusUpdate == formattedLastStatusUpdate) &&
            (identical(other.pickupType, pickupType) ||
                other.pickupType == pickupType) &&
            (identical(other.pickupAddress, pickupAddress) ||
                other.pickupAddress == pickupAddress) &&
            (identical(other.pickupSchedule, pickupSchedule) ||
                other.pickupSchedule == pickupSchedule) &&
            (identical(
                  other.formattedPickupSchedule,
                  formattedPickupSchedule,
                ) ||
                other.formattedPickupSchedule == formattedPickupSchedule) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.internalNotes, internalNotes) ||
                other.internalNotes == internalNotes) &&
            const DeepCollectionEquality().equals(
              other.specialInstructions,
              specialInstructions,
            ) &&
            const DeepCollectionEquality().equals(
              other._orderItems,
              _orderItems,
            ) &&
            (identical(other.orderItemsCount, orderItemsCount) ||
                other.orderItemsCount == orderItemsCount) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.formattedCreatedAt, formattedCreatedAt) ||
                other.formattedCreatedAt == formattedCreatedAt) &&
            (identical(other.formattedUpdatedAt, formattedUpdatedAt) ||
                other.formattedUpdatedAt == formattedUpdatedAt) &&
            (identical(other.deletedAt, deletedAt) ||
                other.deletedAt == deletedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
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
    const DeepCollectionEquality().hash(customerAddress),
    statusUpdater,
    const DeepCollectionEquality().hash(_commissionLogs),
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
    const DeepCollectionEquality().hash(specialInstructions),
    const DeepCollectionEquality().hash(_orderItems),
    orderItemsCount,
    createdAt,
    updatedAt,
    formattedCreatedAt,
    formattedUpdatedAt,
    deletedAt,
  ]);

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderModelImplCopyWith<_$OrderModelImpl> get copyWith =>
      __$$OrderModelImplCopyWithImpl<_$OrderModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderModelImplToJson(this);
  }
}

abstract class _OrderModel extends OrderModel {
  const factory _OrderModel({
    required final int id,
    required final String orderNumber,
    required final String status,
    final String? statusLabel,
    final String? statusBadgeVariant,
    final int completionPercentage,
    required final String paymentStatus,
    final String? paymentStatusLabel,
    final String? paymentStatusBadgeVariant,
    final String? deliveryType,
    final String? deliveryTypeLabel,
    final bool canPay,
    final bool canScheduleDelivery,
    final bool requiresPaymentBeforeDelivery,
    final String? source,
    final String? sourceLabel,
    final String? paymentMethod,
    required final int customerId,
    final int? customerAccountId,
    required final int employeeId,
    required final int outletId,
    final int? customerAddressId,
    final int? updatedBy,
    final CustomerModel? customer,
    final CustomerAccountModel? customerAccount,
    final EmployeeModel? employee,
    final OutletModel? outlet,
    final dynamic customerAddress,
    final EmployeeModel? statusUpdater,
    final List<dynamic> commissionLogs,
    final OrderReviewModel? review,
    final bool hasReview,
    final double subtotal,
    final double pickupFee,
    final String? formattedPickupFee,
    final double deliveryFee,
    final String? formattedDeliveryFee,
    final double discountAmount,
    final double taxAmount,
    final double totalAmount,
    final double paidAmount,
    final double remainingAmount,
    final String? formattedSubtotal,
    final String? formattedDiscountAmount,
    final String? formattedTaxAmount,
    final String? formattedTotalAmount,
    final String? formattedPaidAmount,
    final String? formattedRemainingAmount,
    final String? midtransOrderId,
    final String? midtransTransactionId,
    final String? qrUrl,
    @JsonKey(fromJson: toDateTime) final DateTime? orderDate,
    final String? formattedOrderDate,
    @JsonKey(fromJson: toDateTime) final DateTime? estimatedCompletion,
    final String? formattedEstimatedCompletion,
    @JsonKey(fromJson: toDateTime) final DateTime? actualCompletion,
    final String? formattedActualCompletion,
    @JsonKey(fromJson: toDateTime) final DateTime? pickupDate,
    final String? formattedPickupDate,
    @JsonKey(fromJson: toDateTime) final DateTime? deliveryDate,
    final String? formattedDeliveryDate,
    @JsonKey(fromJson: toDateTime) final DateTime? deliverySchedule,
    final String? formattedDeliverySchedule,
    final String? deliveryAddress,
    @JsonKey(fromJson: toDateTime) final DateTime? lastStatusUpdate,
    final String? formattedLastStatusUpdate,
    final String? pickupType,
    final String? pickupAddress,
    @JsonKey(fromJson: toDateTime) final DateTime? pickupSchedule,
    final String? formattedPickupSchedule,
    final String? notes,
    final String? internalNotes,
    final dynamic specialInstructions,
    final List<OrderItemModel>? orderItems,
    final int orderItemsCount,
    @JsonKey(fromJson: toDateTime) final DateTime? createdAt,
    @JsonKey(fromJson: toDateTime) final DateTime? updatedAt,
    final String? formattedCreatedAt,
    final String? formattedUpdatedAt,
    @JsonKey(fromJson: toDateTime) final DateTime? deletedAt,
  }) = _$OrderModelImpl;
  const _OrderModel._() : super._();

  factory _OrderModel.fromJson(Map<String, dynamic> json) =
      _$OrderModelImpl.fromJson;

  @override
  int get id;
  @override
  String get orderNumber;
  @override
  String get status;
  @override
  String? get statusLabel;
  @override
  String? get statusBadgeVariant;
  @override
  int get completionPercentage;
  @override
  String get paymentStatus;
  @override
  String? get paymentStatusLabel;
  @override
  String? get paymentStatusBadgeVariant;
  @override
  String? get deliveryType;
  @override
  String? get deliveryTypeLabel;
  @override
  bool get canPay;
  @override
  bool get canScheduleDelivery;
  @override
  bool get requiresPaymentBeforeDelivery;
  @override
  String? get source;
  @override
  String? get sourceLabel;
  @override
  String? get paymentMethod;
  @override
  int get customerId;
  @override
  int? get customerAccountId;
  @override
  int get employeeId;
  @override
  int get outletId;
  @override
  int? get customerAddressId;
  @override
  int? get updatedBy;
  @override
  CustomerModel? get customer;
  @override
  CustomerAccountModel? get customerAccount;
  @override
  EmployeeModel? get employee;
  @override
  OutletModel? get outlet;
  @override
  dynamic get customerAddress;
  @override
  EmployeeModel? get statusUpdater;
  @override
  List<dynamic> get commissionLogs;
  @override
  OrderReviewModel? get review;
  @override
  bool get hasReview;
  @override
  double get subtotal;
  @override
  double get pickupFee;
  @override
  String? get formattedPickupFee;
  @override
  double get deliveryFee;
  @override
  String? get formattedDeliveryFee;
  @override
  double get discountAmount;
  @override
  double get taxAmount;
  @override
  double get totalAmount;
  @override
  double get paidAmount;
  @override
  double get remainingAmount;
  @override
  String? get formattedSubtotal;
  @override
  String? get formattedDiscountAmount;
  @override
  String? get formattedTaxAmount;
  @override
  String? get formattedTotalAmount;
  @override
  String? get formattedPaidAmount;
  @override
  String? get formattedRemainingAmount;
  @override
  String? get midtransOrderId;
  @override
  String? get midtransTransactionId;
  @override
  String? get qrUrl;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get orderDate;
  @override
  String? get formattedOrderDate;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get estimatedCompletion;
  @override
  String? get formattedEstimatedCompletion;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get actualCompletion;
  @override
  String? get formattedActualCompletion;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get pickupDate;
  @override
  String? get formattedPickupDate;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get deliveryDate;
  @override
  String? get formattedDeliveryDate;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get deliverySchedule;
  @override
  String? get formattedDeliverySchedule;
  @override
  String? get deliveryAddress;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get lastStatusUpdate;
  @override
  String? get formattedLastStatusUpdate;
  @override
  String? get pickupType;
  @override
  String? get pickupAddress;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get pickupSchedule;
  @override
  String? get formattedPickupSchedule;
  @override
  String? get notes;
  @override
  String? get internalNotes;
  @override
  dynamic get specialInstructions;
  @override
  List<OrderItemModel>? get orderItems;
  @override
  int get orderItemsCount;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get createdAt;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get updatedAt;
  @override
  String? get formattedCreatedAt;
  @override
  String? get formattedUpdatedAt;
  @override
  @JsonKey(fromJson: toDateTime)
  DateTime? get deletedAt;

  /// Create a copy of OrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OrderModelImplCopyWith<_$OrderModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
