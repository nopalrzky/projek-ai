// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'membership_context_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

MembershipContextModel _$MembershipContextModelFromJson(
  Map<String, dynamic> json,
) {
  return _MembershipContextModel.fromJson(json);
}

/// @nodoc
mixin _$MembershipContextModel {
  int get membershipContractId => throw _privateConstructorUsedError;
  String get membershipPlanName => throw _privateConstructorUsedError;
  double get discountPercentage => throw _privateConstructorUsedError;
  String? get expiredAt => throw _privateConstructorUsedError;

  /// Serializes this MembershipContextModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MembershipContextModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MembershipContextModelCopyWith<MembershipContextModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MembershipContextModelCopyWith<$Res> {
  factory $MembershipContextModelCopyWith(
    MembershipContextModel value,
    $Res Function(MembershipContextModel) then,
  ) = _$MembershipContextModelCopyWithImpl<$Res, MembershipContextModel>;
  @useResult
  $Res call({
    int membershipContractId,
    String membershipPlanName,
    double discountPercentage,
    String? expiredAt,
  });
}

/// @nodoc
class _$MembershipContextModelCopyWithImpl<
  $Res,
  $Val extends MembershipContextModel
>
    implements $MembershipContextModelCopyWith<$Res> {
  _$MembershipContextModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MembershipContextModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? membershipContractId = null,
    Object? membershipPlanName = null,
    Object? discountPercentage = null,
    Object? expiredAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            membershipContractId: null == membershipContractId
                ? _value.membershipContractId
                : membershipContractId // ignore: cast_nullable_to_non_nullable
                      as int,
            membershipPlanName: null == membershipPlanName
                ? _value.membershipPlanName
                : membershipPlanName // ignore: cast_nullable_to_non_nullable
                      as String,
            discountPercentage: null == discountPercentage
                ? _value.discountPercentage
                : discountPercentage // ignore: cast_nullable_to_non_nullable
                      as double,
            expiredAt: freezed == expiredAt
                ? _value.expiredAt
                : expiredAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MembershipContextModelImplCopyWith<$Res>
    implements $MembershipContextModelCopyWith<$Res> {
  factory _$$MembershipContextModelImplCopyWith(
    _$MembershipContextModelImpl value,
    $Res Function(_$MembershipContextModelImpl) then,
  ) = __$$MembershipContextModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int membershipContractId,
    String membershipPlanName,
    double discountPercentage,
    String? expiredAt,
  });
}

/// @nodoc
class __$$MembershipContextModelImplCopyWithImpl<$Res>
    extends
        _$MembershipContextModelCopyWithImpl<$Res, _$MembershipContextModelImpl>
    implements _$$MembershipContextModelImplCopyWith<$Res> {
  __$$MembershipContextModelImplCopyWithImpl(
    _$MembershipContextModelImpl _value,
    $Res Function(_$MembershipContextModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MembershipContextModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? membershipContractId = null,
    Object? membershipPlanName = null,
    Object? discountPercentage = null,
    Object? expiredAt = freezed,
  }) {
    return _then(
      _$MembershipContextModelImpl(
        membershipContractId: null == membershipContractId
            ? _value.membershipContractId
            : membershipContractId // ignore: cast_nullable_to_non_nullable
                  as int,
        membershipPlanName: null == membershipPlanName
            ? _value.membershipPlanName
            : membershipPlanName // ignore: cast_nullable_to_non_nullable
                  as String,
        discountPercentage: null == discountPercentage
            ? _value.discountPercentage
            : discountPercentage // ignore: cast_nullable_to_non_nullable
                  as double,
        expiredAt: freezed == expiredAt
            ? _value.expiredAt
            : expiredAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MembershipContextModelImpl extends _MembershipContextModel {
  const _$MembershipContextModelImpl({
    required this.membershipContractId,
    required this.membershipPlanName,
    required this.discountPercentage,
    this.expiredAt,
  }) : super._();

  factory _$MembershipContextModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$MembershipContextModelImplFromJson(json);

  @override
  final int membershipContractId;
  @override
  final String membershipPlanName;
  @override
  final double discountPercentage;
  @override
  final String? expiredAt;

  @override
  String toString() {
    return 'MembershipContextModel(membershipContractId: $membershipContractId, membershipPlanName: $membershipPlanName, discountPercentage: $discountPercentage, expiredAt: $expiredAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MembershipContextModelImpl &&
            (identical(other.membershipContractId, membershipContractId) ||
                other.membershipContractId == membershipContractId) &&
            (identical(other.membershipPlanName, membershipPlanName) ||
                other.membershipPlanName == membershipPlanName) &&
            (identical(other.discountPercentage, discountPercentage) ||
                other.discountPercentage == discountPercentage) &&
            (identical(other.expiredAt, expiredAt) ||
                other.expiredAt == expiredAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    membershipContractId,
    membershipPlanName,
    discountPercentage,
    expiredAt,
  );

  /// Create a copy of MembershipContextModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MembershipContextModelImplCopyWith<_$MembershipContextModelImpl>
  get copyWith =>
      __$$MembershipContextModelImplCopyWithImpl<_$MembershipContextModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$MembershipContextModelImplToJson(this);
  }
}

abstract class _MembershipContextModel extends MembershipContextModel {
  const factory _MembershipContextModel({
    required final int membershipContractId,
    required final String membershipPlanName,
    required final double discountPercentage,
    final String? expiredAt,
  }) = _$MembershipContextModelImpl;
  const _MembershipContextModel._() : super._();

  factory _MembershipContextModel.fromJson(Map<String, dynamic> json) =
      _$MembershipContextModelImpl.fromJson;

  @override
  int get membershipContractId;
  @override
  String get membershipPlanName;
  @override
  double get discountPercentage;
  @override
  String? get expiredAt;

  /// Create a copy of MembershipContextModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MembershipContextModelImplCopyWith<_$MembershipContextModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
