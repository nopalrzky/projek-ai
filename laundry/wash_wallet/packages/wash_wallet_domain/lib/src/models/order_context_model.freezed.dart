// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order_context_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OrderContextModel _$OrderContextModelFromJson(Map<String, dynamic> json) {
  return _OrderContextModel.fromJson(json);
}

/// @nodoc
mixin _$OrderContextModel {
  CustomerModel get customer => throw _privateConstructorUsedError;
  MembershipContextModel? get membership => throw _privateConstructorUsedError;
  List<QuotaContextModel> get quotas => throw _privateConstructorUsedError;

  /// Serializes this OrderContextModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OrderContextModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OrderContextModelCopyWith<OrderContextModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderContextModelCopyWith<$Res> {
  factory $OrderContextModelCopyWith(
    OrderContextModel value,
    $Res Function(OrderContextModel) then,
  ) = _$OrderContextModelCopyWithImpl<$Res, OrderContextModel>;
  @useResult
  $Res call({
    CustomerModel customer,
    MembershipContextModel? membership,
    List<QuotaContextModel> quotas,
  });

  $CustomerModelCopyWith<$Res> get customer;
  $MembershipContextModelCopyWith<$Res>? get membership;
}

/// @nodoc
class _$OrderContextModelCopyWithImpl<$Res, $Val extends OrderContextModel>
    implements $OrderContextModelCopyWith<$Res> {
  _$OrderContextModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OrderContextModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? customer = null,
    Object? membership = freezed,
    Object? quotas = null,
  }) {
    return _then(
      _value.copyWith(
            customer: null == customer
                ? _value.customer
                : customer // ignore: cast_nullable_to_non_nullable
                      as CustomerModel,
            membership: freezed == membership
                ? _value.membership
                : membership // ignore: cast_nullable_to_non_nullable
                      as MembershipContextModel?,
            quotas: null == quotas
                ? _value.quotas
                : quotas // ignore: cast_nullable_to_non_nullable
                      as List<QuotaContextModel>,
          )
          as $Val,
    );
  }

  /// Create a copy of OrderContextModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CustomerModelCopyWith<$Res> get customer {
    return $CustomerModelCopyWith<$Res>(_value.customer, (value) {
      return _then(_value.copyWith(customer: value) as $Val);
    });
  }

  /// Create a copy of OrderContextModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $MembershipContextModelCopyWith<$Res>? get membership {
    if (_value.membership == null) {
      return null;
    }

    return $MembershipContextModelCopyWith<$Res>(_value.membership!, (value) {
      return _then(_value.copyWith(membership: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$OrderContextModelImplCopyWith<$Res>
    implements $OrderContextModelCopyWith<$Res> {
  factory _$$OrderContextModelImplCopyWith(
    _$OrderContextModelImpl value,
    $Res Function(_$OrderContextModelImpl) then,
  ) = __$$OrderContextModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    CustomerModel customer,
    MembershipContextModel? membership,
    List<QuotaContextModel> quotas,
  });

  @override
  $CustomerModelCopyWith<$Res> get customer;
  @override
  $MembershipContextModelCopyWith<$Res>? get membership;
}

/// @nodoc
class __$$OrderContextModelImplCopyWithImpl<$Res>
    extends _$OrderContextModelCopyWithImpl<$Res, _$OrderContextModelImpl>
    implements _$$OrderContextModelImplCopyWith<$Res> {
  __$$OrderContextModelImplCopyWithImpl(
    _$OrderContextModelImpl _value,
    $Res Function(_$OrderContextModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OrderContextModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? customer = null,
    Object? membership = freezed,
    Object? quotas = null,
  }) {
    return _then(
      _$OrderContextModelImpl(
        customer: null == customer
            ? _value.customer
            : customer // ignore: cast_nullable_to_non_nullable
                  as CustomerModel,
        membership: freezed == membership
            ? _value.membership
            : membership // ignore: cast_nullable_to_non_nullable
                  as MembershipContextModel?,
        quotas: null == quotas
            ? _value._quotas
            : quotas // ignore: cast_nullable_to_non_nullable
                  as List<QuotaContextModel>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderContextModelImpl extends _OrderContextModel {
  const _$OrderContextModelImpl({
    required this.customer,
    this.membership,
    required final List<QuotaContextModel> quotas,
  }) : _quotas = quotas,
       super._();

  factory _$OrderContextModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderContextModelImplFromJson(json);

  @override
  final CustomerModel customer;
  @override
  final MembershipContextModel? membership;
  final List<QuotaContextModel> _quotas;
  @override
  List<QuotaContextModel> get quotas {
    if (_quotas is EqualUnmodifiableListView) return _quotas;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_quotas);
  }

  @override
  String toString() {
    return 'OrderContextModel(customer: $customer, membership: $membership, quotas: $quotas)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderContextModelImpl &&
            (identical(other.customer, customer) ||
                other.customer == customer) &&
            (identical(other.membership, membership) ||
                other.membership == membership) &&
            const DeepCollectionEquality().equals(other._quotas, _quotas));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    customer,
    membership,
    const DeepCollectionEquality().hash(_quotas),
  );

  /// Create a copy of OrderContextModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderContextModelImplCopyWith<_$OrderContextModelImpl> get copyWith =>
      __$$OrderContextModelImplCopyWithImpl<_$OrderContextModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderContextModelImplToJson(this);
  }
}

abstract class _OrderContextModel extends OrderContextModel {
  const factory _OrderContextModel({
    required final CustomerModel customer,
    final MembershipContextModel? membership,
    required final List<QuotaContextModel> quotas,
  }) = _$OrderContextModelImpl;
  const _OrderContextModel._() : super._();

  factory _OrderContextModel.fromJson(Map<String, dynamic> json) =
      _$OrderContextModelImpl.fromJson;

  @override
  CustomerModel get customer;
  @override
  MembershipContextModel? get membership;
  @override
  List<QuotaContextModel> get quotas;

  /// Create a copy of OrderContextModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OrderContextModelImplCopyWith<_$OrderContextModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
