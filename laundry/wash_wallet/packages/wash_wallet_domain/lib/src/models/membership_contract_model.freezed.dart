// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'membership_contract_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

MembershipContractModel _$MembershipContractModelFromJson(
  Map<String, dynamic> json,
) {
  return _MembershipContractModel.fromJson(json);
}

/// @nodoc
mixin _$MembershipContractModel {
  int get id => throw _privateConstructorUsedError;
  int get customerId => throw _privateConstructorUsedError;
  int get outletId => throw _privateConstructorUsedError;
  int get membershipPlanId => throw _privateConstructorUsedError;
  String? get startAt => throw _privateConstructorUsedError;
  String? get expiredAt => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  int? get replacedById => throw _privateConstructorUsedError;
  int? get upgradeFromId => throw _privateConstructorUsedError;
  double get totalPaid => throw _privateConstructorUsedError;
  String? get formattedTotalPaid => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;
  CustomerModel? get customer => throw _privateConstructorUsedError;
  OutletModel? get outlet => throw _privateConstructorUsedError;
  MembershipPlanModel? get membershipPlan => throw _privateConstructorUsedError;

  /// Serializes this MembershipContractModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MembershipContractModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MembershipContractModelCopyWith<MembershipContractModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MembershipContractModelCopyWith<$Res> {
  factory $MembershipContractModelCopyWith(
    MembershipContractModel value,
    $Res Function(MembershipContractModel) then,
  ) = _$MembershipContractModelCopyWithImpl<$Res, MembershipContractModel>;
  @useResult
  $Res call({
    int id,
    int customerId,
    int outletId,
    int membershipPlanId,
    String? startAt,
    String? expiredAt,
    String status,
    int? replacedById,
    int? upgradeFromId,
    double totalPaid,
    String? formattedTotalPaid,
    String? createdAt,
    String? updatedAt,
    CustomerModel? customer,
    OutletModel? outlet,
    MembershipPlanModel? membershipPlan,
  });

  $CustomerModelCopyWith<$Res>? get customer;
  $OutletModelCopyWith<$Res>? get outlet;
  $MembershipPlanModelCopyWith<$Res>? get membershipPlan;
}

/// @nodoc
class _$MembershipContractModelCopyWithImpl<
  $Res,
  $Val extends MembershipContractModel
>
    implements $MembershipContractModelCopyWith<$Res> {
  _$MembershipContractModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MembershipContractModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? customerId = null,
    Object? outletId = null,
    Object? membershipPlanId = null,
    Object? startAt = freezed,
    Object? expiredAt = freezed,
    Object? status = null,
    Object? replacedById = freezed,
    Object? upgradeFromId = freezed,
    Object? totalPaid = null,
    Object? formattedTotalPaid = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? customer = freezed,
    Object? outlet = freezed,
    Object? membershipPlan = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            customerId: null == customerId
                ? _value.customerId
                : customerId // ignore: cast_nullable_to_non_nullable
                      as int,
            outletId: null == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int,
            membershipPlanId: null == membershipPlanId
                ? _value.membershipPlanId
                : membershipPlanId // ignore: cast_nullable_to_non_nullable
                      as int,
            startAt: freezed == startAt
                ? _value.startAt
                : startAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            expiredAt: freezed == expiredAt
                ? _value.expiredAt
                : expiredAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            replacedById: freezed == replacedById
                ? _value.replacedById
                : replacedById // ignore: cast_nullable_to_non_nullable
                      as int?,
            upgradeFromId: freezed == upgradeFromId
                ? _value.upgradeFromId
                : upgradeFromId // ignore: cast_nullable_to_non_nullable
                      as int?,
            totalPaid: null == totalPaid
                ? _value.totalPaid
                : totalPaid // ignore: cast_nullable_to_non_nullable
                      as double,
            formattedTotalPaid: freezed == formattedTotalPaid
                ? _value.formattedTotalPaid
                : formattedTotalPaid // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            customer: freezed == customer
                ? _value.customer
                : customer // ignore: cast_nullable_to_non_nullable
                      as CustomerModel?,
            outlet: freezed == outlet
                ? _value.outlet
                : outlet // ignore: cast_nullable_to_non_nullable
                      as OutletModel?,
            membershipPlan: freezed == membershipPlan
                ? _value.membershipPlan
                : membershipPlan // ignore: cast_nullable_to_non_nullable
                      as MembershipPlanModel?,
          )
          as $Val,
    );
  }

  /// Create a copy of MembershipContractModel
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

  /// Create a copy of MembershipContractModel
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

  /// Create a copy of MembershipContractModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $MembershipPlanModelCopyWith<$Res>? get membershipPlan {
    if (_value.membershipPlan == null) {
      return null;
    }

    return $MembershipPlanModelCopyWith<$Res>(_value.membershipPlan!, (value) {
      return _then(_value.copyWith(membershipPlan: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$MembershipContractModelImplCopyWith<$Res>
    implements $MembershipContractModelCopyWith<$Res> {
  factory _$$MembershipContractModelImplCopyWith(
    _$MembershipContractModelImpl value,
    $Res Function(_$MembershipContractModelImpl) then,
  ) = __$$MembershipContractModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int customerId,
    int outletId,
    int membershipPlanId,
    String? startAt,
    String? expiredAt,
    String status,
    int? replacedById,
    int? upgradeFromId,
    double totalPaid,
    String? formattedTotalPaid,
    String? createdAt,
    String? updatedAt,
    CustomerModel? customer,
    OutletModel? outlet,
    MembershipPlanModel? membershipPlan,
  });

  @override
  $CustomerModelCopyWith<$Res>? get customer;
  @override
  $OutletModelCopyWith<$Res>? get outlet;
  @override
  $MembershipPlanModelCopyWith<$Res>? get membershipPlan;
}

/// @nodoc
class __$$MembershipContractModelImplCopyWithImpl<$Res>
    extends
        _$MembershipContractModelCopyWithImpl<
          $Res,
          _$MembershipContractModelImpl
        >
    implements _$$MembershipContractModelImplCopyWith<$Res> {
  __$$MembershipContractModelImplCopyWithImpl(
    _$MembershipContractModelImpl _value,
    $Res Function(_$MembershipContractModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MembershipContractModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? customerId = null,
    Object? outletId = null,
    Object? membershipPlanId = null,
    Object? startAt = freezed,
    Object? expiredAt = freezed,
    Object? status = null,
    Object? replacedById = freezed,
    Object? upgradeFromId = freezed,
    Object? totalPaid = null,
    Object? formattedTotalPaid = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? customer = freezed,
    Object? outlet = freezed,
    Object? membershipPlan = freezed,
  }) {
    return _then(
      _$MembershipContractModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        customerId: null == customerId
            ? _value.customerId
            : customerId // ignore: cast_nullable_to_non_nullable
                  as int,
        outletId: null == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int,
        membershipPlanId: null == membershipPlanId
            ? _value.membershipPlanId
            : membershipPlanId // ignore: cast_nullable_to_non_nullable
                  as int,
        startAt: freezed == startAt
            ? _value.startAt
            : startAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        expiredAt: freezed == expiredAt
            ? _value.expiredAt
            : expiredAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        replacedById: freezed == replacedById
            ? _value.replacedById
            : replacedById // ignore: cast_nullable_to_non_nullable
                  as int?,
        upgradeFromId: freezed == upgradeFromId
            ? _value.upgradeFromId
            : upgradeFromId // ignore: cast_nullable_to_non_nullable
                  as int?,
        totalPaid: null == totalPaid
            ? _value.totalPaid
            : totalPaid // ignore: cast_nullable_to_non_nullable
                  as double,
        formattedTotalPaid: freezed == formattedTotalPaid
            ? _value.formattedTotalPaid
            : formattedTotalPaid // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        customer: freezed == customer
            ? _value.customer
            : customer // ignore: cast_nullable_to_non_nullable
                  as CustomerModel?,
        outlet: freezed == outlet
            ? _value.outlet
            : outlet // ignore: cast_nullable_to_non_nullable
                  as OutletModel?,
        membershipPlan: freezed == membershipPlan
            ? _value.membershipPlan
            : membershipPlan // ignore: cast_nullable_to_non_nullable
                  as MembershipPlanModel?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MembershipContractModelImpl extends _MembershipContractModel {
  const _$MembershipContractModelImpl({
    required this.id,
    required this.customerId,
    required this.outletId,
    required this.membershipPlanId,
    this.startAt,
    this.expiredAt,
    required this.status,
    this.replacedById,
    this.upgradeFromId,
    required this.totalPaid,
    this.formattedTotalPaid,
    this.createdAt,
    this.updatedAt,
    this.customer,
    this.outlet,
    this.membershipPlan,
  }) : super._();

  factory _$MembershipContractModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$MembershipContractModelImplFromJson(json);

  @override
  final int id;
  @override
  final int customerId;
  @override
  final int outletId;
  @override
  final int membershipPlanId;
  @override
  final String? startAt;
  @override
  final String? expiredAt;
  @override
  final String status;
  @override
  final int? replacedById;
  @override
  final int? upgradeFromId;
  @override
  final double totalPaid;
  @override
  final String? formattedTotalPaid;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;
  @override
  final CustomerModel? customer;
  @override
  final OutletModel? outlet;
  @override
  final MembershipPlanModel? membershipPlan;

  @override
  String toString() {
    return 'MembershipContractModel(id: $id, customerId: $customerId, outletId: $outletId, membershipPlanId: $membershipPlanId, startAt: $startAt, expiredAt: $expiredAt, status: $status, replacedById: $replacedById, upgradeFromId: $upgradeFromId, totalPaid: $totalPaid, formattedTotalPaid: $formattedTotalPaid, createdAt: $createdAt, updatedAt: $updatedAt, customer: $customer, outlet: $outlet, membershipPlan: $membershipPlan)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MembershipContractModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.customerId, customerId) ||
                other.customerId == customerId) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.membershipPlanId, membershipPlanId) ||
                other.membershipPlanId == membershipPlanId) &&
            (identical(other.startAt, startAt) || other.startAt == startAt) &&
            (identical(other.expiredAt, expiredAt) ||
                other.expiredAt == expiredAt) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.replacedById, replacedById) ||
                other.replacedById == replacedById) &&
            (identical(other.upgradeFromId, upgradeFromId) ||
                other.upgradeFromId == upgradeFromId) &&
            (identical(other.totalPaid, totalPaid) ||
                other.totalPaid == totalPaid) &&
            (identical(other.formattedTotalPaid, formattedTotalPaid) ||
                other.formattedTotalPaid == formattedTotalPaid) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.customer, customer) ||
                other.customer == customer) &&
            (identical(other.outlet, outlet) || other.outlet == outlet) &&
            (identical(other.membershipPlan, membershipPlan) ||
                other.membershipPlan == membershipPlan));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    customerId,
    outletId,
    membershipPlanId,
    startAt,
    expiredAt,
    status,
    replacedById,
    upgradeFromId,
    totalPaid,
    formattedTotalPaid,
    createdAt,
    updatedAt,
    customer,
    outlet,
    membershipPlan,
  );

  /// Create a copy of MembershipContractModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MembershipContractModelImplCopyWith<_$MembershipContractModelImpl>
  get copyWith =>
      __$$MembershipContractModelImplCopyWithImpl<
        _$MembershipContractModelImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MembershipContractModelImplToJson(this);
  }
}

abstract class _MembershipContractModel extends MembershipContractModel {
  const factory _MembershipContractModel({
    required final int id,
    required final int customerId,
    required final int outletId,
    required final int membershipPlanId,
    final String? startAt,
    final String? expiredAt,
    required final String status,
    final int? replacedById,
    final int? upgradeFromId,
    required final double totalPaid,
    final String? formattedTotalPaid,
    final String? createdAt,
    final String? updatedAt,
    final CustomerModel? customer,
    final OutletModel? outlet,
    final MembershipPlanModel? membershipPlan,
  }) = _$MembershipContractModelImpl;
  const _MembershipContractModel._() : super._();

  factory _MembershipContractModel.fromJson(Map<String, dynamic> json) =
      _$MembershipContractModelImpl.fromJson;

  @override
  int get id;
  @override
  int get customerId;
  @override
  int get outletId;
  @override
  int get membershipPlanId;
  @override
  String? get startAt;
  @override
  String? get expiredAt;
  @override
  String get status;
  @override
  int? get replacedById;
  @override
  int? get upgradeFromId;
  @override
  double get totalPaid;
  @override
  String? get formattedTotalPaid;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;
  @override
  CustomerModel? get customer;
  @override
  OutletModel? get outlet;
  @override
  MembershipPlanModel? get membershipPlan;

  /// Create a copy of MembershipContractModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MembershipContractModelImplCopyWith<_$MembershipContractModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
