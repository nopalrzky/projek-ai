// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'active_order_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ActiveOrderModel _$ActiveOrderModelFromJson(Map<String, dynamic> json) {
  return _ActiveOrderModel.fromJson(json);
}

/// @nodoc
mixin _$ActiveOrderModel {
  int get orderId => throw _privateConstructorUsedError;
  String get invoice => throw _privateConstructorUsedError;
  String get customerName => throw _privateConstructorUsedError;
  String get serviceName => throw _privateConstructorUsedError;
  String get quantity => throw _privateConstructorUsedError;
  String get currentProcess => throw _privateConstructorUsedError;
  String? get startedAt => throw _privateConstructorUsedError;

  /// Serializes this ActiveOrderModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ActiveOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ActiveOrderModelCopyWith<ActiveOrderModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ActiveOrderModelCopyWith<$Res> {
  factory $ActiveOrderModelCopyWith(
    ActiveOrderModel value,
    $Res Function(ActiveOrderModel) then,
  ) = _$ActiveOrderModelCopyWithImpl<$Res, ActiveOrderModel>;
  @useResult
  $Res call({
    int orderId,
    String invoice,
    String customerName,
    String serviceName,
    String quantity,
    String currentProcess,
    String? startedAt,
  });
}

/// @nodoc
class _$ActiveOrderModelCopyWithImpl<$Res, $Val extends ActiveOrderModel>
    implements $ActiveOrderModelCopyWith<$Res> {
  _$ActiveOrderModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ActiveOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? orderId = null,
    Object? invoice = null,
    Object? customerName = null,
    Object? serviceName = null,
    Object? quantity = null,
    Object? currentProcess = null,
    Object? startedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            orderId: null == orderId
                ? _value.orderId
                : orderId // ignore: cast_nullable_to_non_nullable
                      as int,
            invoice: null == invoice
                ? _value.invoice
                : invoice // ignore: cast_nullable_to_non_nullable
                      as String,
            customerName: null == customerName
                ? _value.customerName
                : customerName // ignore: cast_nullable_to_non_nullable
                      as String,
            serviceName: null == serviceName
                ? _value.serviceName
                : serviceName // ignore: cast_nullable_to_non_nullable
                      as String,
            quantity: null == quantity
                ? _value.quantity
                : quantity // ignore: cast_nullable_to_non_nullable
                      as String,
            currentProcess: null == currentProcess
                ? _value.currentProcess
                : currentProcess // ignore: cast_nullable_to_non_nullable
                      as String,
            startedAt: freezed == startedAt
                ? _value.startedAt
                : startedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ActiveOrderModelImplCopyWith<$Res>
    implements $ActiveOrderModelCopyWith<$Res> {
  factory _$$ActiveOrderModelImplCopyWith(
    _$ActiveOrderModelImpl value,
    $Res Function(_$ActiveOrderModelImpl) then,
  ) = __$$ActiveOrderModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int orderId,
    String invoice,
    String customerName,
    String serviceName,
    String quantity,
    String currentProcess,
    String? startedAt,
  });
}

/// @nodoc
class __$$ActiveOrderModelImplCopyWithImpl<$Res>
    extends _$ActiveOrderModelCopyWithImpl<$Res, _$ActiveOrderModelImpl>
    implements _$$ActiveOrderModelImplCopyWith<$Res> {
  __$$ActiveOrderModelImplCopyWithImpl(
    _$ActiveOrderModelImpl _value,
    $Res Function(_$ActiveOrderModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ActiveOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? orderId = null,
    Object? invoice = null,
    Object? customerName = null,
    Object? serviceName = null,
    Object? quantity = null,
    Object? currentProcess = null,
    Object? startedAt = freezed,
  }) {
    return _then(
      _$ActiveOrderModelImpl(
        orderId: null == orderId
            ? _value.orderId
            : orderId // ignore: cast_nullable_to_non_nullable
                  as int,
        invoice: null == invoice
            ? _value.invoice
            : invoice // ignore: cast_nullable_to_non_nullable
                  as String,
        customerName: null == customerName
            ? _value.customerName
            : customerName // ignore: cast_nullable_to_non_nullable
                  as String,
        serviceName: null == serviceName
            ? _value.serviceName
            : serviceName // ignore: cast_nullable_to_non_nullable
                  as String,
        quantity: null == quantity
            ? _value.quantity
            : quantity // ignore: cast_nullable_to_non_nullable
                  as String,
        currentProcess: null == currentProcess
            ? _value.currentProcess
            : currentProcess // ignore: cast_nullable_to_non_nullable
                  as String,
        startedAt: freezed == startedAt
            ? _value.startedAt
            : startedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ActiveOrderModelImpl extends _ActiveOrderModel {
  const _$ActiveOrderModelImpl({
    required this.orderId,
    required this.invoice,
    required this.customerName,
    required this.serviceName,
    required this.quantity,
    required this.currentProcess,
    this.startedAt,
  }) : super._();

  factory _$ActiveOrderModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ActiveOrderModelImplFromJson(json);

  @override
  final int orderId;
  @override
  final String invoice;
  @override
  final String customerName;
  @override
  final String serviceName;
  @override
  final String quantity;
  @override
  final String currentProcess;
  @override
  final String? startedAt;

  @override
  String toString() {
    return 'ActiveOrderModel(orderId: $orderId, invoice: $invoice, customerName: $customerName, serviceName: $serviceName, quantity: $quantity, currentProcess: $currentProcess, startedAt: $startedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ActiveOrderModelImpl &&
            (identical(other.orderId, orderId) || other.orderId == orderId) &&
            (identical(other.invoice, invoice) || other.invoice == invoice) &&
            (identical(other.customerName, customerName) ||
                other.customerName == customerName) &&
            (identical(other.serviceName, serviceName) ||
                other.serviceName == serviceName) &&
            (identical(other.quantity, quantity) ||
                other.quantity == quantity) &&
            (identical(other.currentProcess, currentProcess) ||
                other.currentProcess == currentProcess) &&
            (identical(other.startedAt, startedAt) ||
                other.startedAt == startedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    orderId,
    invoice,
    customerName,
    serviceName,
    quantity,
    currentProcess,
    startedAt,
  );

  /// Create a copy of ActiveOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ActiveOrderModelImplCopyWith<_$ActiveOrderModelImpl> get copyWith =>
      __$$ActiveOrderModelImplCopyWithImpl<_$ActiveOrderModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ActiveOrderModelImplToJson(this);
  }
}

abstract class _ActiveOrderModel extends ActiveOrderModel {
  const factory _ActiveOrderModel({
    required final int orderId,
    required final String invoice,
    required final String customerName,
    required final String serviceName,
    required final String quantity,
    required final String currentProcess,
    final String? startedAt,
  }) = _$ActiveOrderModelImpl;
  const _ActiveOrderModel._() : super._();

  factory _ActiveOrderModel.fromJson(Map<String, dynamic> json) =
      _$ActiveOrderModelImpl.fromJson;

  @override
  int get orderId;
  @override
  String get invoice;
  @override
  String get customerName;
  @override
  String get serviceName;
  @override
  String get quantity;
  @override
  String get currentProcess;
  @override
  String? get startedAt;

  /// Create a copy of ActiveOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ActiveOrderModelImplCopyWith<_$ActiveOrderModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
