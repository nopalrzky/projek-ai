// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'customer_quota_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

CustomerQuotaModel _$CustomerQuotaModelFromJson(Map<String, dynamic> json) {
  return _CustomerQuotaModel.fromJson(json);
}

/// @nodoc
mixin _$CustomerQuotaModel {
  int get id => throw _privateConstructorUsedError;
  int get customerSubscriptionId => throw _privateConstructorUsedError;
  int get laundryServiceId => throw _privateConstructorUsedError;
  String? get laundryServiceName => throw _privateConstructorUsedError;
  String? get unit => throw _privateConstructorUsedError;
  double get totalQuota => throw _privateConstructorUsedError;
  double get remainingQuota => throw _privateConstructorUsedError;

  /// Serializes this CustomerQuotaModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CustomerQuotaModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CustomerQuotaModelCopyWith<CustomerQuotaModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CustomerQuotaModelCopyWith<$Res> {
  factory $CustomerQuotaModelCopyWith(
    CustomerQuotaModel value,
    $Res Function(CustomerQuotaModel) then,
  ) = _$CustomerQuotaModelCopyWithImpl<$Res, CustomerQuotaModel>;
  @useResult
  $Res call({
    int id,
    int customerSubscriptionId,
    int laundryServiceId,
    String? laundryServiceName,
    String? unit,
    double totalQuota,
    double remainingQuota,
  });
}

/// @nodoc
class _$CustomerQuotaModelCopyWithImpl<$Res, $Val extends CustomerQuotaModel>
    implements $CustomerQuotaModelCopyWith<$Res> {
  _$CustomerQuotaModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CustomerQuotaModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? customerSubscriptionId = null,
    Object? laundryServiceId = null,
    Object? laundryServiceName = freezed,
    Object? unit = freezed,
    Object? totalQuota = null,
    Object? remainingQuota = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            customerSubscriptionId: null == customerSubscriptionId
                ? _value.customerSubscriptionId
                : customerSubscriptionId // ignore: cast_nullable_to_non_nullable
                      as int,
            laundryServiceId: null == laundryServiceId
                ? _value.laundryServiceId
                : laundryServiceId // ignore: cast_nullable_to_non_nullable
                      as int,
            laundryServiceName: freezed == laundryServiceName
                ? _value.laundryServiceName
                : laundryServiceName // ignore: cast_nullable_to_non_nullable
                      as String?,
            unit: freezed == unit
                ? _value.unit
                : unit // ignore: cast_nullable_to_non_nullable
                      as String?,
            totalQuota: null == totalQuota
                ? _value.totalQuota
                : totalQuota // ignore: cast_nullable_to_non_nullable
                      as double,
            remainingQuota: null == remainingQuota
                ? _value.remainingQuota
                : remainingQuota // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CustomerQuotaModelImplCopyWith<$Res>
    implements $CustomerQuotaModelCopyWith<$Res> {
  factory _$$CustomerQuotaModelImplCopyWith(
    _$CustomerQuotaModelImpl value,
    $Res Function(_$CustomerQuotaModelImpl) then,
  ) = __$$CustomerQuotaModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int customerSubscriptionId,
    int laundryServiceId,
    String? laundryServiceName,
    String? unit,
    double totalQuota,
    double remainingQuota,
  });
}

/// @nodoc
class __$$CustomerQuotaModelImplCopyWithImpl<$Res>
    extends _$CustomerQuotaModelCopyWithImpl<$Res, _$CustomerQuotaModelImpl>
    implements _$$CustomerQuotaModelImplCopyWith<$Res> {
  __$$CustomerQuotaModelImplCopyWithImpl(
    _$CustomerQuotaModelImpl _value,
    $Res Function(_$CustomerQuotaModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CustomerQuotaModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? customerSubscriptionId = null,
    Object? laundryServiceId = null,
    Object? laundryServiceName = freezed,
    Object? unit = freezed,
    Object? totalQuota = null,
    Object? remainingQuota = null,
  }) {
    return _then(
      _$CustomerQuotaModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        customerSubscriptionId: null == customerSubscriptionId
            ? _value.customerSubscriptionId
            : customerSubscriptionId // ignore: cast_nullable_to_non_nullable
                  as int,
        laundryServiceId: null == laundryServiceId
            ? _value.laundryServiceId
            : laundryServiceId // ignore: cast_nullable_to_non_nullable
                  as int,
        laundryServiceName: freezed == laundryServiceName
            ? _value.laundryServiceName
            : laundryServiceName // ignore: cast_nullable_to_non_nullable
                  as String?,
        unit: freezed == unit
            ? _value.unit
            : unit // ignore: cast_nullable_to_non_nullable
                  as String?,
        totalQuota: null == totalQuota
            ? _value.totalQuota
            : totalQuota // ignore: cast_nullable_to_non_nullable
                  as double,
        remainingQuota: null == remainingQuota
            ? _value.remainingQuota
            : remainingQuota // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CustomerQuotaModelImpl extends _CustomerQuotaModel {
  const _$CustomerQuotaModelImpl({
    required this.id,
    required this.customerSubscriptionId,
    required this.laundryServiceId,
    this.laundryServiceName,
    this.unit,
    required this.totalQuota,
    required this.remainingQuota,
  }) : super._();

  factory _$CustomerQuotaModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CustomerQuotaModelImplFromJson(json);

  @override
  final int id;
  @override
  final int customerSubscriptionId;
  @override
  final int laundryServiceId;
  @override
  final String? laundryServiceName;
  @override
  final String? unit;
  @override
  final double totalQuota;
  @override
  final double remainingQuota;

  @override
  String toString() {
    return 'CustomerQuotaModel(id: $id, customerSubscriptionId: $customerSubscriptionId, laundryServiceId: $laundryServiceId, laundryServiceName: $laundryServiceName, unit: $unit, totalQuota: $totalQuota, remainingQuota: $remainingQuota)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CustomerQuotaModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.customerSubscriptionId, customerSubscriptionId) ||
                other.customerSubscriptionId == customerSubscriptionId) &&
            (identical(other.laundryServiceId, laundryServiceId) ||
                other.laundryServiceId == laundryServiceId) &&
            (identical(other.laundryServiceName, laundryServiceName) ||
                other.laundryServiceName == laundryServiceName) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.totalQuota, totalQuota) ||
                other.totalQuota == totalQuota) &&
            (identical(other.remainingQuota, remainingQuota) ||
                other.remainingQuota == remainingQuota));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    customerSubscriptionId,
    laundryServiceId,
    laundryServiceName,
    unit,
    totalQuota,
    remainingQuota,
  );

  /// Create a copy of CustomerQuotaModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CustomerQuotaModelImplCopyWith<_$CustomerQuotaModelImpl> get copyWith =>
      __$$CustomerQuotaModelImplCopyWithImpl<_$CustomerQuotaModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CustomerQuotaModelImplToJson(this);
  }
}

abstract class _CustomerQuotaModel extends CustomerQuotaModel {
  const factory _CustomerQuotaModel({
    required final int id,
    required final int customerSubscriptionId,
    required final int laundryServiceId,
    final String? laundryServiceName,
    final String? unit,
    required final double totalQuota,
    required final double remainingQuota,
  }) = _$CustomerQuotaModelImpl;
  const _CustomerQuotaModel._() : super._();

  factory _CustomerQuotaModel.fromJson(Map<String, dynamic> json) =
      _$CustomerQuotaModelImpl.fromJson;

  @override
  int get id;
  @override
  int get customerSubscriptionId;
  @override
  int get laundryServiceId;
  @override
  String? get laundryServiceName;
  @override
  String? get unit;
  @override
  double get totalQuota;
  @override
  double get remainingQuota;

  /// Create a copy of CustomerQuotaModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CustomerQuotaModelImplCopyWith<_$CustomerQuotaModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
