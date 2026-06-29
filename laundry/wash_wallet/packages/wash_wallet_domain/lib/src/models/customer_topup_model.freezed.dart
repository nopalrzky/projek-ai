// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'customer_topup_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

CustomerTopupModel _$CustomerTopupModelFromJson(Map<String, dynamic> json) {
  return _CustomerTopupModel.fromJson(json);
}

/// @nodoc
mixin _$CustomerTopupModel {
  int get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'customer_account_id')
  int get customerAccountId => throw _privateConstructorUsedError;
  int get amount => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_status')
  String get paymentStatus => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_method')
  String get paymentMethod => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_provider')
  String get paymentProvider => throw _privateConstructorUsedError;
  @JsonKey(name: 'payment_data')
  Map<String, dynamic>? get paymentData => throw _privateConstructorUsedError;
  @JsonKey(name: 'midtrans_order_id')
  String? get midtransOrderId => throw _privateConstructorUsedError;
  @JsonKey(name: 'expired_at')
  DateTime? get expiredAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this CustomerTopupModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CustomerTopupModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CustomerTopupModelCopyWith<CustomerTopupModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CustomerTopupModelCopyWith<$Res> {
  factory $CustomerTopupModelCopyWith(
    CustomerTopupModel value,
    $Res Function(CustomerTopupModel) then,
  ) = _$CustomerTopupModelCopyWithImpl<$Res, CustomerTopupModel>;
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'customer_account_id') int customerAccountId,
    int amount,
    String status,
    @JsonKey(name: 'payment_status') String paymentStatus,
    @JsonKey(name: 'payment_method') String paymentMethod,
    @JsonKey(name: 'payment_provider') String paymentProvider,
    @JsonKey(name: 'payment_data') Map<String, dynamic>? paymentData,
    @JsonKey(name: 'midtrans_order_id') String? midtransOrderId,
    @JsonKey(name: 'expired_at') DateTime? expiredAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  });
}

/// @nodoc
class _$CustomerTopupModelCopyWithImpl<$Res, $Val extends CustomerTopupModel>
    implements $CustomerTopupModelCopyWith<$Res> {
  _$CustomerTopupModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CustomerTopupModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? customerAccountId = null,
    Object? amount = null,
    Object? status = null,
    Object? paymentStatus = null,
    Object? paymentMethod = null,
    Object? paymentProvider = null,
    Object? paymentData = freezed,
    Object? midtransOrderId = freezed,
    Object? expiredAt = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            customerAccountId: null == customerAccountId
                ? _value.customerAccountId
                : customerAccountId // ignore: cast_nullable_to_non_nullable
                      as int,
            amount: null == amount
                ? _value.amount
                : amount // ignore: cast_nullable_to_non_nullable
                      as int,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            paymentStatus: null == paymentStatus
                ? _value.paymentStatus
                : paymentStatus // ignore: cast_nullable_to_non_nullable
                      as String,
            paymentMethod: null == paymentMethod
                ? _value.paymentMethod
                : paymentMethod // ignore: cast_nullable_to_non_nullable
                      as String,
            paymentProvider: null == paymentProvider
                ? _value.paymentProvider
                : paymentProvider // ignore: cast_nullable_to_non_nullable
                      as String,
            paymentData: freezed == paymentData
                ? _value.paymentData
                : paymentData // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            midtransOrderId: freezed == midtransOrderId
                ? _value.midtransOrderId
                : midtransOrderId // ignore: cast_nullable_to_non_nullable
                      as String?,
            expiredAt: freezed == expiredAt
                ? _value.expiredAt
                : expiredAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CustomerTopupModelImplCopyWith<$Res>
    implements $CustomerTopupModelCopyWith<$Res> {
  factory _$$CustomerTopupModelImplCopyWith(
    _$CustomerTopupModelImpl value,
    $Res Function(_$CustomerTopupModelImpl) then,
  ) = __$$CustomerTopupModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    @JsonKey(name: 'customer_account_id') int customerAccountId,
    int amount,
    String status,
    @JsonKey(name: 'payment_status') String paymentStatus,
    @JsonKey(name: 'payment_method') String paymentMethod,
    @JsonKey(name: 'payment_provider') String paymentProvider,
    @JsonKey(name: 'payment_data') Map<String, dynamic>? paymentData,
    @JsonKey(name: 'midtrans_order_id') String? midtransOrderId,
    @JsonKey(name: 'expired_at') DateTime? expiredAt,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  });
}

/// @nodoc
class __$$CustomerTopupModelImplCopyWithImpl<$Res>
    extends _$CustomerTopupModelCopyWithImpl<$Res, _$CustomerTopupModelImpl>
    implements _$$CustomerTopupModelImplCopyWith<$Res> {
  __$$CustomerTopupModelImplCopyWithImpl(
    _$CustomerTopupModelImpl _value,
    $Res Function(_$CustomerTopupModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CustomerTopupModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? customerAccountId = null,
    Object? amount = null,
    Object? status = null,
    Object? paymentStatus = null,
    Object? paymentMethod = null,
    Object? paymentProvider = null,
    Object? paymentData = freezed,
    Object? midtransOrderId = freezed,
    Object? expiredAt = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(
      _$CustomerTopupModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        customerAccountId: null == customerAccountId
            ? _value.customerAccountId
            : customerAccountId // ignore: cast_nullable_to_non_nullable
                  as int,
        amount: null == amount
            ? _value.amount
            : amount // ignore: cast_nullable_to_non_nullable
                  as int,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        paymentStatus: null == paymentStatus
            ? _value.paymentStatus
            : paymentStatus // ignore: cast_nullable_to_non_nullable
                  as String,
        paymentMethod: null == paymentMethod
            ? _value.paymentMethod
            : paymentMethod // ignore: cast_nullable_to_non_nullable
                  as String,
        paymentProvider: null == paymentProvider
            ? _value.paymentProvider
            : paymentProvider // ignore: cast_nullable_to_non_nullable
                  as String,
        paymentData: freezed == paymentData
            ? _value._paymentData
            : paymentData // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        midtransOrderId: freezed == midtransOrderId
            ? _value.midtransOrderId
            : midtransOrderId // ignore: cast_nullable_to_non_nullable
                  as String?,
        expiredAt: freezed == expiredAt
            ? _value.expiredAt
            : expiredAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CustomerTopupModelImpl implements _CustomerTopupModel {
  const _$CustomerTopupModelImpl({
    required this.id,
    @JsonKey(name: 'customer_account_id') required this.customerAccountId,
    required this.amount,
    required this.status,
    @JsonKey(name: 'payment_status') required this.paymentStatus,
    @JsonKey(name: 'payment_method') required this.paymentMethod,
    @JsonKey(name: 'payment_provider') required this.paymentProvider,
    @JsonKey(name: 'payment_data') final Map<String, dynamic>? paymentData,
    @JsonKey(name: 'midtrans_order_id') this.midtransOrderId,
    @JsonKey(name: 'expired_at') this.expiredAt,
    @JsonKey(name: 'created_at') this.createdAt,
    @JsonKey(name: 'updated_at') this.updatedAt,
  }) : _paymentData = paymentData;

  factory _$CustomerTopupModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CustomerTopupModelImplFromJson(json);

  @override
  final int id;
  @override
  @JsonKey(name: 'customer_account_id')
  final int customerAccountId;
  @override
  final int amount;
  @override
  final String status;
  @override
  @JsonKey(name: 'payment_status')
  final String paymentStatus;
  @override
  @JsonKey(name: 'payment_method')
  final String paymentMethod;
  @override
  @JsonKey(name: 'payment_provider')
  final String paymentProvider;
  final Map<String, dynamic>? _paymentData;
  @override
  @JsonKey(name: 'payment_data')
  Map<String, dynamic>? get paymentData {
    final value = _paymentData;
    if (value == null) return null;
    if (_paymentData is EqualUnmodifiableMapView) return _paymentData;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  @JsonKey(name: 'midtrans_order_id')
  final String? midtransOrderId;
  @override
  @JsonKey(name: 'expired_at')
  final DateTime? expiredAt;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @override
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'CustomerTopupModel(id: $id, customerAccountId: $customerAccountId, amount: $amount, status: $status, paymentStatus: $paymentStatus, paymentMethod: $paymentMethod, paymentProvider: $paymentProvider, paymentData: $paymentData, midtransOrderId: $midtransOrderId, expiredAt: $expiredAt, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CustomerTopupModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.customerAccountId, customerAccountId) ||
                other.customerAccountId == customerAccountId) &&
            (identical(other.amount, amount) || other.amount == amount) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.paymentStatus, paymentStatus) ||
                other.paymentStatus == paymentStatus) &&
            (identical(other.paymentMethod, paymentMethod) ||
                other.paymentMethod == paymentMethod) &&
            (identical(other.paymentProvider, paymentProvider) ||
                other.paymentProvider == paymentProvider) &&
            const DeepCollectionEquality().equals(
              other._paymentData,
              _paymentData,
            ) &&
            (identical(other.midtransOrderId, midtransOrderId) ||
                other.midtransOrderId == midtransOrderId) &&
            (identical(other.expiredAt, expiredAt) ||
                other.expiredAt == expiredAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    customerAccountId,
    amount,
    status,
    paymentStatus,
    paymentMethod,
    paymentProvider,
    const DeepCollectionEquality().hash(_paymentData),
    midtransOrderId,
    expiredAt,
    createdAt,
    updatedAt,
  );

  /// Create a copy of CustomerTopupModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CustomerTopupModelImplCopyWith<_$CustomerTopupModelImpl> get copyWith =>
      __$$CustomerTopupModelImplCopyWithImpl<_$CustomerTopupModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CustomerTopupModelImplToJson(this);
  }
}

abstract class _CustomerTopupModel implements CustomerTopupModel {
  const factory _CustomerTopupModel({
    required final int id,
    @JsonKey(name: 'customer_account_id') required final int customerAccountId,
    required final int amount,
    required final String status,
    @JsonKey(name: 'payment_status') required final String paymentStatus,
    @JsonKey(name: 'payment_method') required final String paymentMethod,
    @JsonKey(name: 'payment_provider') required final String paymentProvider,
    @JsonKey(name: 'payment_data') final Map<String, dynamic>? paymentData,
    @JsonKey(name: 'midtrans_order_id') final String? midtransOrderId,
    @JsonKey(name: 'expired_at') final DateTime? expiredAt,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
    @JsonKey(name: 'updated_at') final DateTime? updatedAt,
  }) = _$CustomerTopupModelImpl;

  factory _CustomerTopupModel.fromJson(Map<String, dynamic> json) =
      _$CustomerTopupModelImpl.fromJson;

  @override
  int get id;
  @override
  @JsonKey(name: 'customer_account_id')
  int get customerAccountId;
  @override
  int get amount;
  @override
  String get status;
  @override
  @JsonKey(name: 'payment_status')
  String get paymentStatus;
  @override
  @JsonKey(name: 'payment_method')
  String get paymentMethod;
  @override
  @JsonKey(name: 'payment_provider')
  String get paymentProvider;
  @override
  @JsonKey(name: 'payment_data')
  Map<String, dynamic>? get paymentData;
  @override
  @JsonKey(name: 'midtrans_order_id')
  String? get midtransOrderId;
  @override
  @JsonKey(name: 'expired_at')
  DateTime? get expiredAt;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;
  @override
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt;

  /// Create a copy of CustomerTopupModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CustomerTopupModelImplCopyWith<_$CustomerTopupModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
