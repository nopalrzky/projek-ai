// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'priority_order_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PriorityOrderModel _$PriorityOrderModelFromJson(Map<String, dynamic> json) {
  return _PriorityOrderModel.fromJson(json);
}

/// @nodoc
mixin _$PriorityOrderModel {
  int get orderId => throw _privateConstructorUsedError;
  String get invoice => throw _privateConstructorUsedError;
  String get customerName => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get deadline => throw _privateConstructorUsedError;

  /// Serializes this PriorityOrderModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PriorityOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PriorityOrderModelCopyWith<PriorityOrderModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PriorityOrderModelCopyWith<$Res> {
  factory $PriorityOrderModelCopyWith(
    PriorityOrderModel value,
    $Res Function(PriorityOrderModel) then,
  ) = _$PriorityOrderModelCopyWithImpl<$Res, PriorityOrderModel>;
  @useResult
  $Res call({
    int orderId,
    String invoice,
    String customerName,
    String status,
    String? deadline,
  });
}

/// @nodoc
class _$PriorityOrderModelCopyWithImpl<$Res, $Val extends PriorityOrderModel>
    implements $PriorityOrderModelCopyWith<$Res> {
  _$PriorityOrderModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PriorityOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? orderId = null,
    Object? invoice = null,
    Object? customerName = null,
    Object? status = null,
    Object? deadline = freezed,
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
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            deadline: freezed == deadline
                ? _value.deadline
                : deadline // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PriorityOrderModelImplCopyWith<$Res>
    implements $PriorityOrderModelCopyWith<$Res> {
  factory _$$PriorityOrderModelImplCopyWith(
    _$PriorityOrderModelImpl value,
    $Res Function(_$PriorityOrderModelImpl) then,
  ) = __$$PriorityOrderModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int orderId,
    String invoice,
    String customerName,
    String status,
    String? deadline,
  });
}

/// @nodoc
class __$$PriorityOrderModelImplCopyWithImpl<$Res>
    extends _$PriorityOrderModelCopyWithImpl<$Res, _$PriorityOrderModelImpl>
    implements _$$PriorityOrderModelImplCopyWith<$Res> {
  __$$PriorityOrderModelImplCopyWithImpl(
    _$PriorityOrderModelImpl _value,
    $Res Function(_$PriorityOrderModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PriorityOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? orderId = null,
    Object? invoice = null,
    Object? customerName = null,
    Object? status = null,
    Object? deadline = freezed,
  }) {
    return _then(
      _$PriorityOrderModelImpl(
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
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        deadline: freezed == deadline
            ? _value.deadline
            : deadline // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PriorityOrderModelImpl extends _PriorityOrderModel {
  const _$PriorityOrderModelImpl({
    required this.orderId,
    required this.invoice,
    required this.customerName,
    required this.status,
    this.deadline,
  }) : super._();

  factory _$PriorityOrderModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PriorityOrderModelImplFromJson(json);

  @override
  final int orderId;
  @override
  final String invoice;
  @override
  final String customerName;
  @override
  final String status;
  @override
  final String? deadline;

  @override
  String toString() {
    return 'PriorityOrderModel(orderId: $orderId, invoice: $invoice, customerName: $customerName, status: $status, deadline: $deadline)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PriorityOrderModelImpl &&
            (identical(other.orderId, orderId) || other.orderId == orderId) &&
            (identical(other.invoice, invoice) || other.invoice == invoice) &&
            (identical(other.customerName, customerName) ||
                other.customerName == customerName) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.deadline, deadline) ||
                other.deadline == deadline));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    orderId,
    invoice,
    customerName,
    status,
    deadline,
  );

  /// Create a copy of PriorityOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PriorityOrderModelImplCopyWith<_$PriorityOrderModelImpl> get copyWith =>
      __$$PriorityOrderModelImplCopyWithImpl<_$PriorityOrderModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$PriorityOrderModelImplToJson(this);
  }
}

abstract class _PriorityOrderModel extends PriorityOrderModel {
  const factory _PriorityOrderModel({
    required final int orderId,
    required final String invoice,
    required final String customerName,
    required final String status,
    final String? deadline,
  }) = _$PriorityOrderModelImpl;
  const _PriorityOrderModel._() : super._();

  factory _PriorityOrderModel.fromJson(Map<String, dynamic> json) =
      _$PriorityOrderModelImpl.fromJson;

  @override
  int get orderId;
  @override
  String get invoice;
  @override
  String get customerName;
  @override
  String get status;
  @override
  String? get deadline;

  /// Create a copy of PriorityOrderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PriorityOrderModelImplCopyWith<_$PriorityOrderModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
