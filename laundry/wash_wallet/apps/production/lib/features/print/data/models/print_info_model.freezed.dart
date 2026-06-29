// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'print_info_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$PrintInfoModel {
  int get orderId => throw _privateConstructorUsedError;
  String get orderNumber => throw _privateConstructorUsedError;
  DateTime get orderDate => throw _privateConstructorUsedError;
  DateTime? get estimatedCompletion => throw _privateConstructorUsedError;
  String get paymentStatus => throw _privateConstructorUsedError;
  double get subtotal => throw _privateConstructorUsedError;
  double get discountAmount => throw _privateConstructorUsedError;
  double get taxAmount => throw _privateConstructorUsedError;
  double get totalAmount => throw _privateConstructorUsedError;
  double get paidAmount => throw _privateConstructorUsedError;
  double get remainingAmount => throw _privateConstructorUsedError;
  String get customerName => throw _privateConstructorUsedError;
  String get customerPhone => throw _privateConstructorUsedError;
  String get outletName => throw _privateConstructorUsedError;
  String get outletAddress => throw _privateConstructorUsedError;
  List<PrintOrderItemModel> get orderItems =>
      throw _privateConstructorUsedError;
  String get cashierName => throw _privateConstructorUsedError;
  PrintCoinInfoModel get receipt => throw _privateConstructorUsedError;
  PrintCoinInfoModel get label => throw _privateConstructorUsedError;

  /// Create a copy of PrintInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PrintInfoModelCopyWith<PrintInfoModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PrintInfoModelCopyWith<$Res> {
  factory $PrintInfoModelCopyWith(
    PrintInfoModel value,
    $Res Function(PrintInfoModel) then,
  ) = _$PrintInfoModelCopyWithImpl<$Res, PrintInfoModel>;
  @useResult
  $Res call({
    int orderId,
    String orderNumber,
    DateTime orderDate,
    DateTime? estimatedCompletion,
    String paymentStatus,
    double subtotal,
    double discountAmount,
    double taxAmount,
    double totalAmount,
    double paidAmount,
    double remainingAmount,
    String customerName,
    String customerPhone,
    String outletName,
    String outletAddress,
    List<PrintOrderItemModel> orderItems,
    String cashierName,
    PrintCoinInfoModel receipt,
    PrintCoinInfoModel label,
  });

  $PrintCoinInfoModelCopyWith<$Res> get receipt;
  $PrintCoinInfoModelCopyWith<$Res> get label;
}

/// @nodoc
class _$PrintInfoModelCopyWithImpl<$Res, $Val extends PrintInfoModel>
    implements $PrintInfoModelCopyWith<$Res> {
  _$PrintInfoModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PrintInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? orderId = null,
    Object? orderNumber = null,
    Object? orderDate = null,
    Object? estimatedCompletion = freezed,
    Object? paymentStatus = null,
    Object? subtotal = null,
    Object? discountAmount = null,
    Object? taxAmount = null,
    Object? totalAmount = null,
    Object? paidAmount = null,
    Object? remainingAmount = null,
    Object? customerName = null,
    Object? customerPhone = null,
    Object? outletName = null,
    Object? outletAddress = null,
    Object? orderItems = null,
    Object? cashierName = null,
    Object? receipt = null,
    Object? label = null,
  }) {
    return _then(
      _value.copyWith(
            orderId: null == orderId
                ? _value.orderId
                : orderId // ignore: cast_nullable_to_non_nullable
                      as int,
            orderNumber: null == orderNumber
                ? _value.orderNumber
                : orderNumber // ignore: cast_nullable_to_non_nullable
                      as String,
            orderDate: null == orderDate
                ? _value.orderDate
                : orderDate // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            estimatedCompletion: freezed == estimatedCompletion
                ? _value.estimatedCompletion
                : estimatedCompletion // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            paymentStatus: null == paymentStatus
                ? _value.paymentStatus
                : paymentStatus // ignore: cast_nullable_to_non_nullable
                      as String,
            subtotal: null == subtotal
                ? _value.subtotal
                : subtotal // ignore: cast_nullable_to_non_nullable
                      as double,
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
            customerName: null == customerName
                ? _value.customerName
                : customerName // ignore: cast_nullable_to_non_nullable
                      as String,
            customerPhone: null == customerPhone
                ? _value.customerPhone
                : customerPhone // ignore: cast_nullable_to_non_nullable
                      as String,
            outletName: null == outletName
                ? _value.outletName
                : outletName // ignore: cast_nullable_to_non_nullable
                      as String,
            outletAddress: null == outletAddress
                ? _value.outletAddress
                : outletAddress // ignore: cast_nullable_to_non_nullable
                      as String,
            orderItems: null == orderItems
                ? _value.orderItems
                : orderItems // ignore: cast_nullable_to_non_nullable
                      as List<PrintOrderItemModel>,
            cashierName: null == cashierName
                ? _value.cashierName
                : cashierName // ignore: cast_nullable_to_non_nullable
                      as String,
            receipt: null == receipt
                ? _value.receipt
                : receipt // ignore: cast_nullable_to_non_nullable
                      as PrintCoinInfoModel,
            label: null == label
                ? _value.label
                : label // ignore: cast_nullable_to_non_nullable
                      as PrintCoinInfoModel,
          )
          as $Val,
    );
  }

  /// Create a copy of PrintInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PrintCoinInfoModelCopyWith<$Res> get receipt {
    return $PrintCoinInfoModelCopyWith<$Res>(_value.receipt, (value) {
      return _then(_value.copyWith(receipt: value) as $Val);
    });
  }

  /// Create a copy of PrintInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $PrintCoinInfoModelCopyWith<$Res> get label {
    return $PrintCoinInfoModelCopyWith<$Res>(_value.label, (value) {
      return _then(_value.copyWith(label: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$PrintInfoModelImplCopyWith<$Res>
    implements $PrintInfoModelCopyWith<$Res> {
  factory _$$PrintInfoModelImplCopyWith(
    _$PrintInfoModelImpl value,
    $Res Function(_$PrintInfoModelImpl) then,
  ) = __$$PrintInfoModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int orderId,
    String orderNumber,
    DateTime orderDate,
    DateTime? estimatedCompletion,
    String paymentStatus,
    double subtotal,
    double discountAmount,
    double taxAmount,
    double totalAmount,
    double paidAmount,
    double remainingAmount,
    String customerName,
    String customerPhone,
    String outletName,
    String outletAddress,
    List<PrintOrderItemModel> orderItems,
    String cashierName,
    PrintCoinInfoModel receipt,
    PrintCoinInfoModel label,
  });

  @override
  $PrintCoinInfoModelCopyWith<$Res> get receipt;
  @override
  $PrintCoinInfoModelCopyWith<$Res> get label;
}

/// @nodoc
class __$$PrintInfoModelImplCopyWithImpl<$Res>
    extends _$PrintInfoModelCopyWithImpl<$Res, _$PrintInfoModelImpl>
    implements _$$PrintInfoModelImplCopyWith<$Res> {
  __$$PrintInfoModelImplCopyWithImpl(
    _$PrintInfoModelImpl _value,
    $Res Function(_$PrintInfoModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PrintInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? orderId = null,
    Object? orderNumber = null,
    Object? orderDate = null,
    Object? estimatedCompletion = freezed,
    Object? paymentStatus = null,
    Object? subtotal = null,
    Object? discountAmount = null,
    Object? taxAmount = null,
    Object? totalAmount = null,
    Object? paidAmount = null,
    Object? remainingAmount = null,
    Object? customerName = null,
    Object? customerPhone = null,
    Object? outletName = null,
    Object? outletAddress = null,
    Object? orderItems = null,
    Object? cashierName = null,
    Object? receipt = null,
    Object? label = null,
  }) {
    return _then(
      _$PrintInfoModelImpl(
        orderId: null == orderId
            ? _value.orderId
            : orderId // ignore: cast_nullable_to_non_nullable
                  as int,
        orderNumber: null == orderNumber
            ? _value.orderNumber
            : orderNumber // ignore: cast_nullable_to_non_nullable
                  as String,
        orderDate: null == orderDate
            ? _value.orderDate
            : orderDate // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        estimatedCompletion: freezed == estimatedCompletion
            ? _value.estimatedCompletion
            : estimatedCompletion // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        paymentStatus: null == paymentStatus
            ? _value.paymentStatus
            : paymentStatus // ignore: cast_nullable_to_non_nullable
                  as String,
        subtotal: null == subtotal
            ? _value.subtotal
            : subtotal // ignore: cast_nullable_to_non_nullable
                  as double,
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
        customerName: null == customerName
            ? _value.customerName
            : customerName // ignore: cast_nullable_to_non_nullable
                  as String,
        customerPhone: null == customerPhone
            ? _value.customerPhone
            : customerPhone // ignore: cast_nullable_to_non_nullable
                  as String,
        outletName: null == outletName
            ? _value.outletName
            : outletName // ignore: cast_nullable_to_non_nullable
                  as String,
        outletAddress: null == outletAddress
            ? _value.outletAddress
            : outletAddress // ignore: cast_nullable_to_non_nullable
                  as String,
        orderItems: null == orderItems
            ? _value._orderItems
            : orderItems // ignore: cast_nullable_to_non_nullable
                  as List<PrintOrderItemModel>,
        cashierName: null == cashierName
            ? _value.cashierName
            : cashierName // ignore: cast_nullable_to_non_nullable
                  as String,
        receipt: null == receipt
            ? _value.receipt
            : receipt // ignore: cast_nullable_to_non_nullable
                  as PrintCoinInfoModel,
        label: null == label
            ? _value.label
            : label // ignore: cast_nullable_to_non_nullable
                  as PrintCoinInfoModel,
      ),
    );
  }
}

/// @nodoc

class _$PrintInfoModelImpl extends _PrintInfoModel {
  const _$PrintInfoModelImpl({
    required this.orderId,
    required this.orderNumber,
    required this.orderDate,
    this.estimatedCompletion,
    required this.paymentStatus,
    required this.subtotal,
    required this.discountAmount,
    required this.taxAmount,
    required this.totalAmount,
    required this.paidAmount,
    required this.remainingAmount,
    required this.customerName,
    required this.customerPhone,
    required this.outletName,
    required this.outletAddress,
    required final List<PrintOrderItemModel> orderItems,
    required this.cashierName,
    required this.receipt,
    required this.label,
  }) : _orderItems = orderItems,
       super._();

  @override
  final int orderId;
  @override
  final String orderNumber;
  @override
  final DateTime orderDate;
  @override
  final DateTime? estimatedCompletion;
  @override
  final String paymentStatus;
  @override
  final double subtotal;
  @override
  final double discountAmount;
  @override
  final double taxAmount;
  @override
  final double totalAmount;
  @override
  final double paidAmount;
  @override
  final double remainingAmount;
  @override
  final String customerName;
  @override
  final String customerPhone;
  @override
  final String outletName;
  @override
  final String outletAddress;
  final List<PrintOrderItemModel> _orderItems;
  @override
  List<PrintOrderItemModel> get orderItems {
    if (_orderItems is EqualUnmodifiableListView) return _orderItems;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_orderItems);
  }

  @override
  final String cashierName;
  @override
  final PrintCoinInfoModel receipt;
  @override
  final PrintCoinInfoModel label;

  @override
  String toString() {
    return 'PrintInfoModel(orderId: $orderId, orderNumber: $orderNumber, orderDate: $orderDate, estimatedCompletion: $estimatedCompletion, paymentStatus: $paymentStatus, subtotal: $subtotal, discountAmount: $discountAmount, taxAmount: $taxAmount, totalAmount: $totalAmount, paidAmount: $paidAmount, remainingAmount: $remainingAmount, customerName: $customerName, customerPhone: $customerPhone, outletName: $outletName, outletAddress: $outletAddress, orderItems: $orderItems, cashierName: $cashierName, receipt: $receipt, label: $label)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PrintInfoModelImpl &&
            (identical(other.orderId, orderId) || other.orderId == orderId) &&
            (identical(other.orderNumber, orderNumber) ||
                other.orderNumber == orderNumber) &&
            (identical(other.orderDate, orderDate) ||
                other.orderDate == orderDate) &&
            (identical(other.estimatedCompletion, estimatedCompletion) ||
                other.estimatedCompletion == estimatedCompletion) &&
            (identical(other.paymentStatus, paymentStatus) ||
                other.paymentStatus == paymentStatus) &&
            (identical(other.subtotal, subtotal) ||
                other.subtotal == subtotal) &&
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
            (identical(other.customerName, customerName) ||
                other.customerName == customerName) &&
            (identical(other.customerPhone, customerPhone) ||
                other.customerPhone == customerPhone) &&
            (identical(other.outletName, outletName) ||
                other.outletName == outletName) &&
            (identical(other.outletAddress, outletAddress) ||
                other.outletAddress == outletAddress) &&
            const DeepCollectionEquality().equals(
              other._orderItems,
              _orderItems,
            ) &&
            (identical(other.cashierName, cashierName) ||
                other.cashierName == cashierName) &&
            (identical(other.receipt, receipt) || other.receipt == receipt) &&
            (identical(other.label, label) || other.label == label));
  }

  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    orderId,
    orderNumber,
    orderDate,
    estimatedCompletion,
    paymentStatus,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    paidAmount,
    remainingAmount,
    customerName,
    customerPhone,
    outletName,
    outletAddress,
    const DeepCollectionEquality().hash(_orderItems),
    cashierName,
    receipt,
    label,
  ]);

  /// Create a copy of PrintInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PrintInfoModelImplCopyWith<_$PrintInfoModelImpl> get copyWith =>
      __$$PrintInfoModelImplCopyWithImpl<_$PrintInfoModelImpl>(
        this,
        _$identity,
      );
}

abstract class _PrintInfoModel extends PrintInfoModel {
  const factory _PrintInfoModel({
    required final int orderId,
    required final String orderNumber,
    required final DateTime orderDate,
    final DateTime? estimatedCompletion,
    required final String paymentStatus,
    required final double subtotal,
    required final double discountAmount,
    required final double taxAmount,
    required final double totalAmount,
    required final double paidAmount,
    required final double remainingAmount,
    required final String customerName,
    required final String customerPhone,
    required final String outletName,
    required final String outletAddress,
    required final List<PrintOrderItemModel> orderItems,
    required final String cashierName,
    required final PrintCoinInfoModel receipt,
    required final PrintCoinInfoModel label,
  }) = _$PrintInfoModelImpl;
  const _PrintInfoModel._() : super._();

  @override
  int get orderId;
  @override
  String get orderNumber;
  @override
  DateTime get orderDate;
  @override
  DateTime? get estimatedCompletion;
  @override
  String get paymentStatus;
  @override
  double get subtotal;
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
  String get customerName;
  @override
  String get customerPhone;
  @override
  String get outletName;
  @override
  String get outletAddress;
  @override
  List<PrintOrderItemModel> get orderItems;
  @override
  String get cashierName;
  @override
  PrintCoinInfoModel get receipt;
  @override
  PrintCoinInfoModel get label;

  /// Create a copy of PrintInfoModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PrintInfoModelImplCopyWith<_$PrintInfoModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
