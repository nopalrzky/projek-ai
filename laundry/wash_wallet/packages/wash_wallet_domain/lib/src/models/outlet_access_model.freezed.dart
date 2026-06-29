// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'outlet_access_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OutletAccessModel _$OutletAccessModelFromJson(Map<String, dynamic> json) {
  return _OutletAccessModel.fromJson(json);
}

/// @nodoc
mixin _$OutletAccessModel {
  int get outletId => throw _privateConstructorUsedError;
  String get outletName => throw _privateConstructorUsedError;
  List<PositionAccessModel> get positions => throw _privateConstructorUsedError;

  /// Serializes this OutletAccessModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OutletAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OutletAccessModelCopyWith<OutletAccessModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OutletAccessModelCopyWith<$Res> {
  factory $OutletAccessModelCopyWith(
    OutletAccessModel value,
    $Res Function(OutletAccessModel) then,
  ) = _$OutletAccessModelCopyWithImpl<$Res, OutletAccessModel>;
  @useResult
  $Res call({
    int outletId,
    String outletName,
    List<PositionAccessModel> positions,
  });
}

/// @nodoc
class _$OutletAccessModelCopyWithImpl<$Res, $Val extends OutletAccessModel>
    implements $OutletAccessModelCopyWith<$Res> {
  _$OutletAccessModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OutletAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? outletId = null,
    Object? outletName = null,
    Object? positions = null,
  }) {
    return _then(
      _value.copyWith(
            outletId: null == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int,
            outletName: null == outletName
                ? _value.outletName
                : outletName // ignore: cast_nullable_to_non_nullable
                      as String,
            positions: null == positions
                ? _value.positions
                : positions // ignore: cast_nullable_to_non_nullable
                      as List<PositionAccessModel>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$OutletAccessModelImplCopyWith<$Res>
    implements $OutletAccessModelCopyWith<$Res> {
  factory _$$OutletAccessModelImplCopyWith(
    _$OutletAccessModelImpl value,
    $Res Function(_$OutletAccessModelImpl) then,
  ) = __$$OutletAccessModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int outletId,
    String outletName,
    List<PositionAccessModel> positions,
  });
}

/// @nodoc
class __$$OutletAccessModelImplCopyWithImpl<$Res>
    extends _$OutletAccessModelCopyWithImpl<$Res, _$OutletAccessModelImpl>
    implements _$$OutletAccessModelImplCopyWith<$Res> {
  __$$OutletAccessModelImplCopyWithImpl(
    _$OutletAccessModelImpl _value,
    $Res Function(_$OutletAccessModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OutletAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? outletId = null,
    Object? outletName = null,
    Object? positions = null,
  }) {
    return _then(
      _$OutletAccessModelImpl(
        outletId: null == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int,
        outletName: null == outletName
            ? _value.outletName
            : outletName // ignore: cast_nullable_to_non_nullable
                  as String,
        positions: null == positions
            ? _value._positions
            : positions // ignore: cast_nullable_to_non_nullable
                  as List<PositionAccessModel>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OutletAccessModelImpl extends _OutletAccessModel {
  const _$OutletAccessModelImpl({
    required this.outletId,
    required this.outletName,
    required final List<PositionAccessModel> positions,
  }) : _positions = positions,
       super._();

  factory _$OutletAccessModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$OutletAccessModelImplFromJson(json);

  @override
  final int outletId;
  @override
  final String outletName;
  final List<PositionAccessModel> _positions;
  @override
  List<PositionAccessModel> get positions {
    if (_positions is EqualUnmodifiableListView) return _positions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_positions);
  }

  @override
  String toString() {
    return 'OutletAccessModel(outletId: $outletId, outletName: $outletName, positions: $positions)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OutletAccessModelImpl &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.outletName, outletName) ||
                other.outletName == outletName) &&
            const DeepCollectionEquality().equals(
              other._positions,
              _positions,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    outletId,
    outletName,
    const DeepCollectionEquality().hash(_positions),
  );

  /// Create a copy of OutletAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OutletAccessModelImplCopyWith<_$OutletAccessModelImpl> get copyWith =>
      __$$OutletAccessModelImplCopyWithImpl<_$OutletAccessModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$OutletAccessModelImplToJson(this);
  }
}

abstract class _OutletAccessModel extends OutletAccessModel {
  const factory _OutletAccessModel({
    required final int outletId,
    required final String outletName,
    required final List<PositionAccessModel> positions,
  }) = _$OutletAccessModelImpl;
  const _OutletAccessModel._() : super._();

  factory _OutletAccessModel.fromJson(Map<String, dynamic> json) =
      _$OutletAccessModelImpl.fromJson;

  @override
  int get outletId;
  @override
  String get outletName;
  @override
  List<PositionAccessModel> get positions;

  /// Create a copy of OutletAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OutletAccessModelImplCopyWith<_$OutletAccessModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
