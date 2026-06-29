// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'time_range_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

TimeRangeModel _$TimeRangeModelFromJson(Map<String, dynamic> json) {
  return _TimeRangeModel.fromJson(json);
}

/// @nodoc
mixin _$TimeRangeModel {
  String get open => throw _privateConstructorUsedError;
  String get close => throw _privateConstructorUsedError;

  /// Serializes this TimeRangeModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TimeRangeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TimeRangeModelCopyWith<TimeRangeModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TimeRangeModelCopyWith<$Res> {
  factory $TimeRangeModelCopyWith(
    TimeRangeModel value,
    $Res Function(TimeRangeModel) then,
  ) = _$TimeRangeModelCopyWithImpl<$Res, TimeRangeModel>;
  @useResult
  $Res call({String open, String close});
}

/// @nodoc
class _$TimeRangeModelCopyWithImpl<$Res, $Val extends TimeRangeModel>
    implements $TimeRangeModelCopyWith<$Res> {
  _$TimeRangeModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TimeRangeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? open = null, Object? close = null}) {
    return _then(
      _value.copyWith(
            open: null == open
                ? _value.open
                : open // ignore: cast_nullable_to_non_nullable
                      as String,
            close: null == close
                ? _value.close
                : close // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$TimeRangeModelImplCopyWith<$Res>
    implements $TimeRangeModelCopyWith<$Res> {
  factory _$$TimeRangeModelImplCopyWith(
    _$TimeRangeModelImpl value,
    $Res Function(_$TimeRangeModelImpl) then,
  ) = __$$TimeRangeModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String open, String close});
}

/// @nodoc
class __$$TimeRangeModelImplCopyWithImpl<$Res>
    extends _$TimeRangeModelCopyWithImpl<$Res, _$TimeRangeModelImpl>
    implements _$$TimeRangeModelImplCopyWith<$Res> {
  __$$TimeRangeModelImplCopyWithImpl(
    _$TimeRangeModelImpl _value,
    $Res Function(_$TimeRangeModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of TimeRangeModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? open = null, Object? close = null}) {
    return _then(
      _$TimeRangeModelImpl(
        open: null == open
            ? _value.open
            : open // ignore: cast_nullable_to_non_nullable
                  as String,
        close: null == close
            ? _value.close
            : close // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$TimeRangeModelImpl extends _TimeRangeModel {
  const _$TimeRangeModelImpl({required this.open, required this.close})
    : super._();

  factory _$TimeRangeModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$TimeRangeModelImplFromJson(json);

  @override
  final String open;
  @override
  final String close;

  @override
  String toString() {
    return 'TimeRangeModel(open: $open, close: $close)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TimeRangeModelImpl &&
            (identical(other.open, open) || other.open == open) &&
            (identical(other.close, close) || other.close == close));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, open, close);

  /// Create a copy of TimeRangeModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TimeRangeModelImplCopyWith<_$TimeRangeModelImpl> get copyWith =>
      __$$TimeRangeModelImplCopyWithImpl<_$TimeRangeModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$TimeRangeModelImplToJson(this);
  }
}

abstract class _TimeRangeModel extends TimeRangeModel {
  const factory _TimeRangeModel({
    required final String open,
    required final String close,
  }) = _$TimeRangeModelImpl;
  const _TimeRangeModel._() : super._();

  factory _TimeRangeModel.fromJson(Map<String, dynamic> json) =
      _$TimeRangeModelImpl.fromJson;

  @override
  String get open;
  @override
  String get close;

  /// Create a copy of TimeRangeModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TimeRangeModelImplCopyWith<_$TimeRangeModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
