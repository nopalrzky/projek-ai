// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order_item_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OrderItemModel _$OrderItemModelFromJson(Map<String, dynamic> json) {
  return _OrderItemModel.fromJson(json);
}

/// @nodoc
mixin _$OrderItemModel {
  int get id => throw _privateConstructorUsedError;
  int get orderId => throw _privateConstructorUsedError;
  int? get laundryServiceId => throw _privateConstructorUsedError;
  String? get categoryName => throw _privateConstructorUsedError;
  String? get laundryServiceName => throw _privateConstructorUsedError;
  String? get unitName => throw _privateConstructorUsedError;
  double get quantity => throw _privateConstructorUsedError;
  double get unitPrice => throw _privateConstructorUsedError;
  double get subtotal => throw _privateConstructorUsedError;
  double get discountAmount => throw _privateConstructorUsedError;
  double get totalAmount => throw _privateConstructorUsedError;
  String? get formattedSubtotal => throw _privateConstructorUsedError;
  String? get formattedDiscountAmount => throw _privateConstructorUsedError;
  String? get formattedTotalAmount => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get statusLabel => throw _privateConstructorUsedError;
  int get completionPercentage => throw _privateConstructorUsedError;
  String? get itemNotes => throw _privateConstructorUsedError;
  bool get canCompleteOrderItem => throw _privateConstructorUsedError;
  String? get completeOrderItemReason => throw _privateConstructorUsedError;
  dynamic get processedBy => throw _privateConstructorUsedError;
  dynamic get processingData => throw _privateConstructorUsedError;
  List<OrderItemProcessModel>? get orderItemProcesses =>
      throw _privateConstructorUsedError;
  String? get startedAt => throw _privateConstructorUsedError;
  String? get completedAt => throw _privateConstructorUsedError;
  String? get formattedStartedAt => throw _privateConstructorUsedError;
  String? get formattedCompletedAt => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  String? get formattedCreatedAt => throw _privateConstructorUsedError;
  String? get formattedUpdatedAt => throw _privateConstructorUsedError;

  /// Serializes this OrderItemModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OrderItemModelCopyWith<OrderItemModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderItemModelCopyWith<$Res> {
  factory $OrderItemModelCopyWith(
    OrderItemModel value,
    $Res Function(OrderItemModel) then,
  ) = _$OrderItemModelCopyWithImpl<$Res, OrderItemModel>;
  @useResult
  $Res call({
    int id,
    int orderId,
    int? laundryServiceId,
    String? categoryName,
    String? laundryServiceName,
    String? unitName,
    double quantity,
    double unitPrice,
    double subtotal,
    double discountAmount,
    double totalAmount,
    String? formattedSubtotal,
    String? formattedDiscountAmount,
    String? formattedTotalAmount,
    String status,
    String? statusLabel,
    int completionPercentage,
    String? itemNotes,
    bool canCompleteOrderItem,
    String? completeOrderItemReason,
    dynamic processedBy,
    dynamic processingData,
    List<OrderItemProcessModel>? orderItemProcesses,
    String? startedAt,
    String? completedAt,
    String? formattedStartedAt,
    String? formattedCompletedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
  });
}

/// @nodoc
class _$OrderItemModelCopyWithImpl<$Res, $Val extends OrderItemModel>
    implements $OrderItemModelCopyWith<$Res> {
  _$OrderItemModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderId = null,
    Object? laundryServiceId = freezed,
    Object? categoryName = freezed,
    Object? laundryServiceName = freezed,
    Object? unitName = freezed,
    Object? quantity = null,
    Object? unitPrice = null,
    Object? subtotal = null,
    Object? discountAmount = null,
    Object? totalAmount = null,
    Object? formattedSubtotal = freezed,
    Object? formattedDiscountAmount = freezed,
    Object? formattedTotalAmount = freezed,
    Object? status = null,
    Object? statusLabel = freezed,
    Object? completionPercentage = null,
    Object? itemNotes = freezed,
    Object? canCompleteOrderItem = null,
    Object? completeOrderItemReason = freezed,
    Object? processedBy = freezed,
    Object? processingData = freezed,
    Object? orderItemProcesses = freezed,
    Object? startedAt = freezed,
    Object? completedAt = freezed,
    Object? formattedStartedAt = freezed,
    Object? formattedCompletedAt = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? formattedCreatedAt = freezed,
    Object? formattedUpdatedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            orderId: null == orderId
                ? _value.orderId
                : orderId // ignore: cast_nullable_to_non_nullable
                      as int,
            laundryServiceId: freezed == laundryServiceId
                ? _value.laundryServiceId
                : laundryServiceId // ignore: cast_nullable_to_non_nullable
                      as int?,
            categoryName: freezed == categoryName
                ? _value.categoryName
                : categoryName // ignore: cast_nullable_to_non_nullable
                      as String?,
            laundryServiceName: freezed == laundryServiceName
                ? _value.laundryServiceName
                : laundryServiceName // ignore: cast_nullable_to_non_nullable
                      as String?,
            unitName: freezed == unitName
                ? _value.unitName
                : unitName // ignore: cast_nullable_to_non_nullable
                      as String?,
            quantity: null == quantity
                ? _value.quantity
                : quantity // ignore: cast_nullable_to_non_nullable
                      as double,
            unitPrice: null == unitPrice
                ? _value.unitPrice
                : unitPrice // ignore: cast_nullable_to_non_nullable
                      as double,
            subtotal: null == subtotal
                ? _value.subtotal
                : subtotal // ignore: cast_nullable_to_non_nullable
                      as double,
            discountAmount: null == discountAmount
                ? _value.discountAmount
                : discountAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            totalAmount: null == totalAmount
                ? _value.totalAmount
                : totalAmount // ignore: cast_nullable_to_non_nullable
                      as double,
            formattedSubtotal: freezed == formattedSubtotal
                ? _value.formattedSubtotal
                : formattedSubtotal // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedDiscountAmount: freezed == formattedDiscountAmount
                ? _value.formattedDiscountAmount
                : formattedDiscountAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedTotalAmount: freezed == formattedTotalAmount
                ? _value.formattedTotalAmount
                : formattedTotalAmount // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            statusLabel: freezed == statusLabel
                ? _value.statusLabel
                : statusLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            completionPercentage: null == completionPercentage
                ? _value.completionPercentage
                : completionPercentage // ignore: cast_nullable_to_non_nullable
                      as int,
            itemNotes: freezed == itemNotes
                ? _value.itemNotes
                : itemNotes // ignore: cast_nullable_to_non_nullable
                      as String?,
            canCompleteOrderItem: null == canCompleteOrderItem
                ? _value.canCompleteOrderItem
                : canCompleteOrderItem // ignore: cast_nullable_to_non_nullable
                      as bool,
            completeOrderItemReason: freezed == completeOrderItemReason
                ? _value.completeOrderItemReason
                : completeOrderItemReason // ignore: cast_nullable_to_non_nullable
                      as String?,
            processedBy: freezed == processedBy
                ? _value.processedBy
                : processedBy // ignore: cast_nullable_to_non_nullable
                      as dynamic,
            processingData: freezed == processingData
                ? _value.processingData
                : processingData // ignore: cast_nullable_to_non_nullable
                      as dynamic,
            orderItemProcesses: freezed == orderItemProcesses
                ? _value.orderItemProcesses
                : orderItemProcesses // ignore: cast_nullable_to_non_nullable
                      as List<OrderItemProcessModel>?,
            startedAt: freezed == startedAt
                ? _value.startedAt
                : startedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            completedAt: freezed == completedAt
                ? _value.completedAt
                : completedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedStartedAt: freezed == formattedStartedAt
                ? _value.formattedStartedAt
                : formattedStartedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            formattedCompletedAt: freezed == formattedCompletedAt
                ? _value.formattedCompletedAt
                : formattedCompletedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
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
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$OrderItemModelImplCopyWith<$Res>
    implements $OrderItemModelCopyWith<$Res> {
  factory _$$OrderItemModelImplCopyWith(
    _$OrderItemModelImpl value,
    $Res Function(_$OrderItemModelImpl) then,
  ) = __$$OrderItemModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int orderId,
    int? laundryServiceId,
    String? categoryName,
    String? laundryServiceName,
    String? unitName,
    double quantity,
    double unitPrice,
    double subtotal,
    double discountAmount,
    double totalAmount,
    String? formattedSubtotal,
    String? formattedDiscountAmount,
    String? formattedTotalAmount,
    String status,
    String? statusLabel,
    int completionPercentage,
    String? itemNotes,
    bool canCompleteOrderItem,
    String? completeOrderItemReason,
    dynamic processedBy,
    dynamic processingData,
    List<OrderItemProcessModel>? orderItemProcesses,
    String? startedAt,
    String? completedAt,
    String? formattedStartedAt,
    String? formattedCompletedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
  });
}

/// @nodoc
class __$$OrderItemModelImplCopyWithImpl<$Res>
    extends _$OrderItemModelCopyWithImpl<$Res, _$OrderItemModelImpl>
    implements _$$OrderItemModelImplCopyWith<$Res> {
  __$$OrderItemModelImplCopyWithImpl(
    _$OrderItemModelImpl _value,
    $Res Function(_$OrderItemModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderId = null,
    Object? laundryServiceId = freezed,
    Object? categoryName = freezed,
    Object? laundryServiceName = freezed,
    Object? unitName = freezed,
    Object? quantity = null,
    Object? unitPrice = null,
    Object? subtotal = null,
    Object? discountAmount = null,
    Object? totalAmount = null,
    Object? formattedSubtotal = freezed,
    Object? formattedDiscountAmount = freezed,
    Object? formattedTotalAmount = freezed,
    Object? status = null,
    Object? statusLabel = freezed,
    Object? completionPercentage = null,
    Object? itemNotes = freezed,
    Object? canCompleteOrderItem = null,
    Object? completeOrderItemReason = freezed,
    Object? processedBy = freezed,
    Object? processingData = freezed,
    Object? orderItemProcesses = freezed,
    Object? startedAt = freezed,
    Object? completedAt = freezed,
    Object? formattedStartedAt = freezed,
    Object? formattedCompletedAt = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? formattedCreatedAt = freezed,
    Object? formattedUpdatedAt = freezed,
  }) {
    return _then(
      _$OrderItemModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        orderId: null == orderId
            ? _value.orderId
            : orderId // ignore: cast_nullable_to_non_nullable
                  as int,
        laundryServiceId: freezed == laundryServiceId
            ? _value.laundryServiceId
            : laundryServiceId // ignore: cast_nullable_to_non_nullable
                  as int?,
        categoryName: freezed == categoryName
            ? _value.categoryName
            : categoryName // ignore: cast_nullable_to_non_nullable
                  as String?,
        laundryServiceName: freezed == laundryServiceName
            ? _value.laundryServiceName
            : laundryServiceName // ignore: cast_nullable_to_non_nullable
                  as String?,
        unitName: freezed == unitName
            ? _value.unitName
            : unitName // ignore: cast_nullable_to_non_nullable
                  as String?,
        quantity: null == quantity
            ? _value.quantity
            : quantity // ignore: cast_nullable_to_non_nullable
                  as double,
        unitPrice: null == unitPrice
            ? _value.unitPrice
            : unitPrice // ignore: cast_nullable_to_non_nullable
                  as double,
        subtotal: null == subtotal
            ? _value.subtotal
            : subtotal // ignore: cast_nullable_to_non_nullable
                  as double,
        discountAmount: null == discountAmount
            ? _value.discountAmount
            : discountAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        totalAmount: null == totalAmount
            ? _value.totalAmount
            : totalAmount // ignore: cast_nullable_to_non_nullable
                  as double,
        formattedSubtotal: freezed == formattedSubtotal
            ? _value.formattedSubtotal
            : formattedSubtotal // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedDiscountAmount: freezed == formattedDiscountAmount
            ? _value.formattedDiscountAmount
            : formattedDiscountAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedTotalAmount: freezed == formattedTotalAmount
            ? _value.formattedTotalAmount
            : formattedTotalAmount // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        statusLabel: freezed == statusLabel
            ? _value.statusLabel
            : statusLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        completionPercentage: null == completionPercentage
            ? _value.completionPercentage
            : completionPercentage // ignore: cast_nullable_to_non_nullable
                  as int,
        itemNotes: freezed == itemNotes
            ? _value.itemNotes
            : itemNotes // ignore: cast_nullable_to_non_nullable
                  as String?,
        canCompleteOrderItem: null == canCompleteOrderItem
            ? _value.canCompleteOrderItem
            : canCompleteOrderItem // ignore: cast_nullable_to_non_nullable
                  as bool,
        completeOrderItemReason: freezed == completeOrderItemReason
            ? _value.completeOrderItemReason
            : completeOrderItemReason // ignore: cast_nullable_to_non_nullable
                  as String?,
        processedBy: freezed == processedBy
            ? _value.processedBy
            : processedBy // ignore: cast_nullable_to_non_nullable
                  as dynamic,
        processingData: freezed == processingData
            ? _value.processingData
            : processingData // ignore: cast_nullable_to_non_nullable
                  as dynamic,
        orderItemProcesses: freezed == orderItemProcesses
            ? _value._orderItemProcesses
            : orderItemProcesses // ignore: cast_nullable_to_non_nullable
                  as List<OrderItemProcessModel>?,
        startedAt: freezed == startedAt
            ? _value.startedAt
            : startedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        completedAt: freezed == completedAt
            ? _value.completedAt
            : completedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedStartedAt: freezed == formattedStartedAt
            ? _value.formattedStartedAt
            : formattedStartedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        formattedCompletedAt: freezed == formattedCompletedAt
            ? _value.formattedCompletedAt
            : formattedCompletedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
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
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderItemModelImpl extends _OrderItemModel {
  const _$OrderItemModelImpl({
    required this.id,
    required this.orderId,
    this.laundryServiceId,
    this.categoryName,
    this.laundryServiceName,
    this.unitName,
    this.quantity = 0,
    this.unitPrice = 0,
    this.subtotal = 0,
    this.discountAmount = 0,
    this.totalAmount = 0,
    this.formattedSubtotal,
    this.formattedDiscountAmount,
    this.formattedTotalAmount,
    required this.status,
    this.statusLabel,
    this.completionPercentage = 0,
    this.itemNotes,
    this.canCompleteOrderItem = false,
    this.completeOrderItemReason,
    this.processedBy,
    this.processingData,
    final List<OrderItemProcessModel>? orderItemProcesses,
    this.startedAt,
    this.completedAt,
    this.formattedStartedAt,
    this.formattedCompletedAt,
    this.createdAt,
    this.updatedAt,
    this.formattedCreatedAt,
    this.formattedUpdatedAt,
  }) : _orderItemProcesses = orderItemProcesses,
       super._();

  factory _$OrderItemModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderItemModelImplFromJson(json);

  @override
  final int id;
  @override
  final int orderId;
  @override
  final int? laundryServiceId;
  @override
  final String? categoryName;
  @override
  final String? laundryServiceName;
  @override
  final String? unitName;
  @override
  @JsonKey()
  final double quantity;
  @override
  @JsonKey()
  final double unitPrice;
  @override
  @JsonKey()
  final double subtotal;
  @override
  @JsonKey()
  final double discountAmount;
  @override
  @JsonKey()
  final double totalAmount;
  @override
  final String? formattedSubtotal;
  @override
  final String? formattedDiscountAmount;
  @override
  final String? formattedTotalAmount;
  @override
  final String status;
  @override
  final String? statusLabel;
  @override
  @JsonKey()
  final int completionPercentage;
  @override
  final String? itemNotes;
  @override
  @JsonKey()
  final bool canCompleteOrderItem;
  @override
  final String? completeOrderItemReason;
  @override
  final dynamic processedBy;
  @override
  final dynamic processingData;
  final List<OrderItemProcessModel>? _orderItemProcesses;
  @override
  List<OrderItemProcessModel>? get orderItemProcesses {
    final value = _orderItemProcesses;
    if (value == null) return null;
    if (_orderItemProcesses is EqualUnmodifiableListView)
      return _orderItemProcesses;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? startedAt;
  @override
  final String? completedAt;
  @override
  final String? formattedStartedAt;
  @override
  final String? formattedCompletedAt;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;
  @override
  final String? formattedCreatedAt;
  @override
  final String? formattedUpdatedAt;

  @override
  String toString() {
    return 'OrderItemModel(id: $id, orderId: $orderId, laundryServiceId: $laundryServiceId, categoryName: $categoryName, laundryServiceName: $laundryServiceName, unitName: $unitName, quantity: $quantity, unitPrice: $unitPrice, subtotal: $subtotal, discountAmount: $discountAmount, totalAmount: $totalAmount, formattedSubtotal: $formattedSubtotal, formattedDiscountAmount: $formattedDiscountAmount, formattedTotalAmount: $formattedTotalAmount, status: $status, statusLabel: $statusLabel, completionPercentage: $completionPercentage, itemNotes: $itemNotes, canCompleteOrderItem: $canCompleteOrderItem, completeOrderItemReason: $completeOrderItemReason, processedBy: $processedBy, processingData: $processingData, orderItemProcesses: $orderItemProcesses, startedAt: $startedAt, completedAt: $completedAt, formattedStartedAt: $formattedStartedAt, formattedCompletedAt: $formattedCompletedAt, createdAt: $createdAt, updatedAt: $updatedAt, formattedCreatedAt: $formattedCreatedAt, formattedUpdatedAt: $formattedUpdatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderItemModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.orderId, orderId) || other.orderId == orderId) &&
            (identical(other.laundryServiceId, laundryServiceId) ||
                other.laundryServiceId == laundryServiceId) &&
            (identical(other.categoryName, categoryName) ||
                other.categoryName == categoryName) &&
            (identical(other.laundryServiceName, laundryServiceName) ||
                other.laundryServiceName == laundryServiceName) &&
            (identical(other.unitName, unitName) ||
                other.unitName == unitName) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.unitPrice, unitPrice) ||
                other.unitPrice == unitPrice) &&
            (identical(other.subtotal, subtotal) ||
                other.subtotal == subtotal) &&
            (identical(other.discountAmount, discountAmount) ||
                other.discountAmount == discountAmount) &&
            (identical(other.totalAmount, totalAmount) ||
                other.totalAmount == totalAmount) &&
            (identical(other.formattedSubtotal, formattedSubtotal) ||
                other.formattedSubtotal == formattedSubtotal) &&
            (identical(
                  other.formattedDiscountAmount,
                  formattedDiscountAmount,
                ) ||
                other.formattedDiscountAmount == formattedDiscountAmount) &&
            (identical(other.formattedTotalAmount, formattedTotalAmount) ||
                other.formattedTotalAmount == formattedTotalAmount) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.statusLabel, statusLabel) ||
                other.statusLabel == statusLabel) &&
            (identical(other.completionPercentage, completionPercentage) ||
                other.completionPercentage == completionPercentage) &&
            (identical(other.itemNotes, itemNotes) ||
                other.itemNotes == itemNotes) &&
            (identical(other.canCompleteOrderItem, canCompleteOrderItem) ||
                other.canCompleteOrderItem == canCompleteOrderItem) &&
            (identical(
                  other.completeOrderItemReason,
                  completeOrderItemReason,
                ) ||
                other.completeOrderItemReason == completeOrderItemReason) &&
            const DeepCollectionEquality().equals(
              other.processedBy,
              processedBy,
            ) &&
            const DeepCollectionEquality().equals(
              other.processingData,
              processingData,
            ) &&
            const DeepCollectionEquality().equals(
              other._orderItemProcesses,
              _orderItemProcesses,
            ) &&
            (identical(other.startedAt, startedAt) ||
                other.startedAt == startedAt) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt) &&
            (identical(other.formattedStartedAt, formattedStartedAt) ||
                other.formattedStartedAt == formattedStartedAt) &&
            (identical(other.formattedCompletedAt, formattedCompletedAt) ||
                other.formattedCompletedAt == formattedCompletedAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.formattedCreatedAt, formattedCreatedAt) ||
                other.formattedCreatedAt == formattedCreatedAt) &&
            (identical(other.formattedUpdatedAt, formattedUpdatedAt) ||
                other.formattedUpdatedAt == formattedUpdatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    orderId,
    laundryServiceId,
    categoryName,
    laundryServiceName,
    unitName,
    quantity,
    unitPrice,
    subtotal,
    discountAmount,
    totalAmount,
    formattedSubtotal,
    formattedDiscountAmount,
    formattedTotalAmount,
    status,
    statusLabel,
    completionPercentage,
    itemNotes,
    canCompleteOrderItem,
    completeOrderItemReason,
    const DeepCollectionEquality().hash(processedBy),
    const DeepCollectionEquality().hash(processingData),
    const DeepCollectionEquality().hash(_orderItemProcesses),
    startedAt,
    completedAt,
    formattedStartedAt,
    formattedCompletedAt,
    createdAt,
    updatedAt,
    formattedCreatedAt,
    formattedUpdatedAt,
  ]);

  /// Create a copy of OrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderItemModelImplCopyWith<_$OrderItemModelImpl> get copyWith =>
      __$$OrderItemModelImplCopyWithImpl<_$OrderItemModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderItemModelImplToJson(this);
  }
}

abstract class _OrderItemModel extends OrderItemModel {
  const factory _OrderItemModel({
    required final int id,
    required final int orderId,
    final int? laundryServiceId,
    final String? categoryName,
    final String? laundryServiceName,
    final String? unitName,
    final double quantity,
    final double unitPrice,
    final double subtotal,
    final double discountAmount,
    final double totalAmount,
    final String? formattedSubtotal,
    final String? formattedDiscountAmount,
    final String? formattedTotalAmount,
    required final String status,
    final String? statusLabel,
    final int completionPercentage,
    final String? itemNotes,
    final bool canCompleteOrderItem,
    final String? completeOrderItemReason,
    final dynamic processedBy,
    final dynamic processingData,
    final List<OrderItemProcessModel>? orderItemProcesses,
    final String? startedAt,
    final String? completedAt,
    final String? formattedStartedAt,
    final String? formattedCompletedAt,
    final DateTime? createdAt,
    final DateTime? updatedAt,
    final String? formattedCreatedAt,
    final String? formattedUpdatedAt,
  }) = _$OrderItemModelImpl;
  const _OrderItemModel._() : super._();

  factory _OrderItemModel.fromJson(Map<String, dynamic> json) =
      _$OrderItemModelImpl.fromJson;

  @override
  int get id;
  @override
  int get orderId;
  @override
  int? get laundryServiceId;
  @override
  String? get categoryName;
  @override
  String? get laundryServiceName;
  @override
  String? get unitName;
  @override
  double get quantity;
  @override
  double get unitPrice;
  @override
  double get subtotal;
  @override
  double get discountAmount;
  @override
  double get totalAmount;
  @override
  String? get formattedSubtotal;
  @override
  String? get formattedDiscountAmount;
  @override
  String? get formattedTotalAmount;
  @override
  String get status;
  @override
  String? get statusLabel;
  @override
  int get completionPercentage;
  @override
  String? get itemNotes;
  @override
  bool get canCompleteOrderItem;
  @override
  String? get completeOrderItemReason;
  @override
  dynamic get processedBy;
  @override
  dynamic get processingData;
  @override
  List<OrderItemProcessModel>? get orderItemProcesses;
  @override
  String? get startedAt;
  @override
  String? get completedAt;
  @override
  String? get formattedStartedAt;
  @override
  String? get formattedCompletedAt;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;
  @override
  String? get formattedCreatedAt;
  @override
  String? get formattedUpdatedAt;

  /// Create a copy of OrderItemModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OrderItemModelImplCopyWith<_$OrderItemModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
