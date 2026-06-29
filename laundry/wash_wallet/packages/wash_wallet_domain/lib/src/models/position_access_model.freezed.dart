// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'position_access_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PositionAccessModel _$PositionAccessModelFromJson(Map<String, dynamic> json) {
  return _PositionAccessModel.fromJson(json);
}

/// @nodoc
mixin _$PositionAccessModel {
  int get positionId => throw _privateConstructorUsedError;
  String get positionName => throw _privateConstructorUsedError;
  String get slug => throw _privateConstructorUsedError;
  List<String> get permissions => throw _privateConstructorUsedError;

  /// Serializes this PositionAccessModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PositionAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PositionAccessModelCopyWith<PositionAccessModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PositionAccessModelCopyWith<$Res> {
  factory $PositionAccessModelCopyWith(
    PositionAccessModel value,
    $Res Function(PositionAccessModel) then,
  ) = _$PositionAccessModelCopyWithImpl<$Res, PositionAccessModel>;
  @useResult
  $Res call({
    int positionId,
    String positionName,
    String slug,
    List<String> permissions,
  });
}

/// @nodoc
class _$PositionAccessModelCopyWithImpl<$Res, $Val extends PositionAccessModel>
    implements $PositionAccessModelCopyWith<$Res> {
  _$PositionAccessModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PositionAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? positionId = null,
    Object? positionName = null,
    Object? slug = null,
    Object? permissions = null,
  }) {
    return _then(
      _value.copyWith(
            positionId: null == positionId
                ? _value.positionId
                : positionId // ignore: cast_nullable_to_non_nullable
                      as int,
            positionName: null == positionName
                ? _value.positionName
                : positionName // ignore: cast_nullable_to_non_nullable
                      as String,
            slug: null == slug
                ? _value.slug
                : slug // ignore: cast_nullable_to_non_nullable
                      as String,
            permissions: null == permissions
                ? _value.permissions
                : permissions // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PositionAccessModelImplCopyWith<$Res>
    implements $PositionAccessModelCopyWith<$Res> {
  factory _$$PositionAccessModelImplCopyWith(
    _$PositionAccessModelImpl value,
    $Res Function(_$PositionAccessModelImpl) then,
  ) = __$$PositionAccessModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int positionId,
    String positionName,
    String slug,
    List<String> permissions,
  });
}

/// @nodoc
class __$$PositionAccessModelImplCopyWithImpl<$Res>
    extends _$PositionAccessModelCopyWithImpl<$Res, _$PositionAccessModelImpl>
    implements _$$PositionAccessModelImplCopyWith<$Res> {
  __$$PositionAccessModelImplCopyWithImpl(
    _$PositionAccessModelImpl _value,
    $Res Function(_$PositionAccessModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PositionAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? positionId = null,
    Object? positionName = null,
    Object? slug = null,
    Object? permissions = null,
  }) {
    return _then(
      _$PositionAccessModelImpl(
        positionId: null == positionId
            ? _value.positionId
            : positionId // ignore: cast_nullable_to_non_nullable
                  as int,
        positionName: null == positionName
            ? _value.positionName
            : positionName // ignore: cast_nullable_to_non_nullable
                  as String,
        slug: null == slug
            ? _value.slug
            : slug // ignore: cast_nullable_to_non_nullable
                  as String,
        permissions: null == permissions
            ? _value._permissions
            : permissions // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PositionAccessModelImpl extends _PositionAccessModel {
  const _$PositionAccessModelImpl({
    required this.positionId,
    required this.positionName,
    required this.slug,
    required final List<String> permissions,
  }) : _permissions = permissions,
       super._();

  factory _$PositionAccessModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PositionAccessModelImplFromJson(json);

  @override
  final int positionId;
  @override
  final String positionName;
  @override
  final String slug;
  final List<String> _permissions;
  @override
  List<String> get permissions {
    if (_permissions is EqualUnmodifiableListView) return _permissions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_permissions);
  }

  @override
  String toString() {
    return 'PositionAccessModel(positionId: $positionId, positionName: $positionName, slug: $slug, permissions: $permissions)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PositionAccessModelImpl &&
            (identical(other.positionId, positionId) ||
                other.positionId == positionId) &&
            (identical(other.positionName, positionName) ||
                other.positionName == positionName) &&
            (identical(other.slug, slug) || other.slug == slug) &&
            const DeepCollectionEquality().equals(
              other._permissions,
              _permissions,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    positionId,
    positionName,
    slug,
    const DeepCollectionEquality().hash(_permissions),
  );

  /// Create a copy of PositionAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PositionAccessModelImplCopyWith<_$PositionAccessModelImpl> get copyWith =>
      __$$PositionAccessModelImplCopyWithImpl<_$PositionAccessModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$PositionAccessModelImplToJson(this);
  }
}

abstract class _PositionAccessModel extends PositionAccessModel {
  const factory _PositionAccessModel({
    required final int positionId,
    required final String positionName,
    required final String slug,
    required final List<String> permissions,
  }) = _$PositionAccessModelImpl;
  const _PositionAccessModel._() : super._();

  factory _PositionAccessModel.fromJson(Map<String, dynamic> json) =
      _$PositionAccessModelImpl.fromJson;

  @override
  int get positionId;
  @override
  String get positionName;
  @override
  String get slug;
  @override
  List<String> get permissions;

  /// Create a copy of PositionAccessModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PositionAccessModelImplCopyWith<_$PositionAccessModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
