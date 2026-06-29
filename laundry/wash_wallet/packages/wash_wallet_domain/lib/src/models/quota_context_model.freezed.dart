// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quota_context_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

QuotaContextModel _$QuotaContextModelFromJson(Map<String, dynamic> json) {
  return _QuotaContextModel.fromJson(json);
}

/// @nodoc
mixin _$QuotaContextModel {
  int get laundryServiceId => throw _privateConstructorUsedError;
  String get laundryServiceName => throw _privateConstructorUsedError;
  String get unit => throw _privateConstructorUsedError;
  double get totalQuota => throw _privateConstructorUsedError;
  double get remainingQuota => throw _privateConstructorUsedError;

  /// Serializes this QuotaContextModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of QuotaContextModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $QuotaContextModelCopyWith<QuotaContextModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $QuotaContextModelCopyWith<$Res> {
  factory $QuotaContextModelCopyWith(
    QuotaContextModel value,
    $Res Function(QuotaContextModel) then,
  ) = _$QuotaContextModelCopyWithImpl<$Res, QuotaContextModel>;
  @useResult
  $Res call({
    int laundryServiceId,
    String laundryServiceName,
    String unit,
    double totalQuota,
    double remainingQuota,
  });
}

/// @nodoc
class _$QuotaContextModelCopyWithImpl<$Res, $Val extends QuotaContextModel>
    implements $QuotaContextModelCopyWith<$Res> {
  _$QuotaContextModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of QuotaContextModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? laundryServiceId = null,
    Object? laundryServiceName = null,
    Object? unit = null,
    Object? totalQuota = null,
    Object? remainingQuota = null,
  }) {
    return _then(
      _value.copyWith(
            laundryServiceId: null == laundryServiceId
                ? _value.laundryServiceId
                : laundryServiceId // ignore: cast_nullable_to_non_nullable
                      as int,
            laundryServiceName: null == laundryServiceName
                ? _value.laundryServiceName
                : laundryServiceName // ignore: cast_nullable_to_non_nullable
                      as String,
            unit: null == unit
                ? _value.unit
                : unit // ignore: cast_nullable_to_non_nullable
                      as String,
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
abstract class _$$QuotaContextModelImplCopyWith<$Res>
    implements $QuotaContextModelCopyWith<$Res> {
  factory _$$QuotaContextModelImplCopyWith(
    _$QuotaContextModelImpl value,
    $Res Function(_$QuotaContextModelImpl) then,
  ) = __$$QuotaContextModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int laundryServiceId,
    String laundryServiceName,
    String unit,
    double totalQuota,
    double remainingQuota,
  });
}

/// @nodoc
class __$$QuotaContextModelImplCopyWithImpl<$Res>
    extends _$QuotaContextModelCopyWithImpl<$Res, _$QuotaContextModelImpl>
    implements _$$QuotaContextModelImplCopyWith<$Res> {
  __$$QuotaContextModelImplCopyWithImpl(
    _$QuotaContextModelImpl _value,
    $Res Function(_$QuotaContextModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of QuotaContextModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? laundryServiceId = null,
    Object? laundryServiceName = null,
    Object? unit = null,
    Object? totalQuota = null,
    Object? remainingQuota = null,
  }) {
    return _then(
      _$QuotaContextModelImpl(
        laundryServiceId: null == laundryServiceId
            ? _value.laundryServiceId
            : laundryServiceId // ignore: cast_nullable_to_non_nullable
                  as int,
        laundryServiceName: null == laundryServiceName
            ? _value.laundryServiceName
            : laundryServiceName // ignore: cast_nullable_to_non_nullable
                  as String,
        unit: null == unit
            ? _value.unit
            : unit // ignore: cast_nullable_to_non_nullable
                  as String,
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
class _$QuotaContextModelImpl extends _QuotaContextModel {
  const _$QuotaContextModelImpl({
    required this.laundryServiceId,
    required this.laundryServiceName,
    required this.unit,
    required this.totalQuota,
    required this.remainingQuota,
  }) : super._();

  factory _$QuotaContextModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$QuotaContextModelImplFromJson(json);

  @override
  final int laundryServiceId;
  @override
  final String laundryServiceName;
  @override
  final String unit;
  @override
  final double totalQuota;
  @override
  final double remainingQuota;

  @override
  String toString() {
    return 'QuotaContextModel(laundryServiceId: $laundryServiceId, laundryServiceName: $laundryServiceName, unit: $unit, totalQuota: $totalQuota, remainingQuota: $remainingQuota)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$QuotaContextModelImpl &&
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
    laundryServiceId,
    laundryServiceName,
    unit,
    totalQuota,
    remainingQuota,
  );

  /// Create a copy of QuotaContextModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$QuotaContextModelImplCopyWith<_$QuotaContextModelImpl> get copyWith =>
      __$$QuotaContextModelImplCopyWithImpl<_$QuotaContextModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$QuotaContextModelImplToJson(this);
  }
}

abstract class _QuotaContextModel extends QuotaContextModel {
  const factory _QuotaContextModel({
    required final int laundryServiceId,
    required final String laundryServiceName,
    required final String unit,
    required final double totalQuota,
    required final double remainingQuota,
  }) = _$QuotaContextModelImpl;
  const _QuotaContextModel._() : super._();

  factory _QuotaContextModel.fromJson(Map<String, dynamic> json) =
      _$QuotaContextModelImpl.fromJson;

  @override
  int get laundryServiceId;
  @override
  String get laundryServiceName;
  @override
  String get unit;
  @override
  double get totalQuota;
  @override
  double get remainingQuota;

  /// Create a copy of QuotaContextModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$QuotaContextModelImplCopyWith<_$QuotaContextModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
