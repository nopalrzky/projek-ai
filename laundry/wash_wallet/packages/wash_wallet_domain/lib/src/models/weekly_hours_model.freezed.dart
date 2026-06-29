// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'weekly_hours_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

WeeklyHoursModel _$WeeklyHoursModelFromJson(Map<String, dynamic> json) {
  return _WeeklyHoursModel.fromJson(json);
}

/// @nodoc
mixin _$WeeklyHoursModel {
  String get day => throw _privateConstructorUsedError;
  String get dayLabel => throw _privateConstructorUsedError;
  bool get isClosed => throw _privateConstructorUsedError;
  List<TimeRangeModel> get timeRanges => throw _privateConstructorUsedError;

  /// Serializes this WeeklyHoursModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WeeklyHoursModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WeeklyHoursModelCopyWith<WeeklyHoursModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WeeklyHoursModelCopyWith<$Res> {
  factory $WeeklyHoursModelCopyWith(
    WeeklyHoursModel value,
    $Res Function(WeeklyHoursModel) then,
  ) = _$WeeklyHoursModelCopyWithImpl<$Res, WeeklyHoursModel>;
  @useResult
  $Res call({
    String day,
    String dayLabel,
    bool isClosed,
    List<TimeRangeModel> timeRanges,
  });
}

/// @nodoc
class _$WeeklyHoursModelCopyWithImpl<$Res, $Val extends WeeklyHoursModel>
    implements $WeeklyHoursModelCopyWith<$Res> {
  _$WeeklyHoursModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WeeklyHoursModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? day = null,
    Object? dayLabel = null,
    Object? isClosed = null,
    Object? timeRanges = null,
  }) {
    return _then(
      _value.copyWith(
            day: null == day
                ? _value.day
                : day // ignore: cast_nullable_to_non_nullable
                      as String,
            dayLabel: null == dayLabel
                ? _value.dayLabel
                : dayLabel // ignore: cast_nullable_to_non_nullable
                      as String,
            isClosed: null == isClosed
                ? _value.isClosed
                : isClosed // ignore: cast_nullable_to_non_nullable
                      as bool,
            timeRanges: null == timeRanges
                ? _value.timeRanges
                : timeRanges // ignore: cast_nullable_to_non_nullable
                      as List<TimeRangeModel>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$WeeklyHoursModelImplCopyWith<$Res>
    implements $WeeklyHoursModelCopyWith<$Res> {
  factory _$$WeeklyHoursModelImplCopyWith(
    _$WeeklyHoursModelImpl value,
    $Res Function(_$WeeklyHoursModelImpl) then,
  ) = __$$WeeklyHoursModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String day,
    String dayLabel,
    bool isClosed,
    List<TimeRangeModel> timeRanges,
  });
}

/// @nodoc
class __$$WeeklyHoursModelImplCopyWithImpl<$Res>
    extends _$WeeklyHoursModelCopyWithImpl<$Res, _$WeeklyHoursModelImpl>
    implements _$$WeeklyHoursModelImplCopyWith<$Res> {
  __$$WeeklyHoursModelImplCopyWithImpl(
    _$WeeklyHoursModelImpl _value,
    $Res Function(_$WeeklyHoursModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of WeeklyHoursModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? day = null,
    Object? dayLabel = null,
    Object? isClosed = null,
    Object? timeRanges = null,
  }) {
    return _then(
      _$WeeklyHoursModelImpl(
        day: null == day
            ? _value.day
            : day // ignore: cast_nullable_to_non_nullable
                  as String,
        dayLabel: null == dayLabel
            ? _value.dayLabel
            : dayLabel // ignore: cast_nullable_to_non_nullable
                  as String,
        isClosed: null == isClosed
            ? _value.isClosed
            : isClosed // ignore: cast_nullable_to_non_nullable
                  as bool,
        timeRanges: null == timeRanges
            ? _value._timeRanges
            : timeRanges // ignore: cast_nullable_to_non_nullable
                  as List<TimeRangeModel>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$WeeklyHoursModelImpl extends _WeeklyHoursModel {
  const _$WeeklyHoursModelImpl({
    required this.day,
    required this.dayLabel,
    required this.isClosed,
    final List<TimeRangeModel> timeRanges = const [],
  }) : _timeRanges = timeRanges,
       super._();

  factory _$WeeklyHoursModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$WeeklyHoursModelImplFromJson(json);

  @override
  final String day;
  @override
  final String dayLabel;
  @override
  final bool isClosed;
  final List<TimeRangeModel> _timeRanges;
  @override
  @JsonKey()
  List<TimeRangeModel> get timeRanges {
    if (_timeRanges is EqualUnmodifiableListView) return _timeRanges;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_timeRanges);
  }

  @override
  String toString() {
    return 'WeeklyHoursModel(day: $day, dayLabel: $dayLabel, isClosed: $isClosed, timeRanges: $timeRanges)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WeeklyHoursModelImpl &&
            (identical(other.day, day) || other.day == day) &&
            (identical(other.dayLabel, dayLabel) ||
                other.dayLabel == dayLabel) &&
            (identical(other.isClosed, isClosed) ||
                other.isClosed == isClosed) &&
            const DeepCollectionEquality().equals(
              other._timeRanges,
              _timeRanges,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    day,
    dayLabel,
    isClosed,
    const DeepCollectionEquality().hash(_timeRanges),
  );

  /// Create a copy of WeeklyHoursModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WeeklyHoursModelImplCopyWith<_$WeeklyHoursModelImpl> get copyWith =>
      __$$WeeklyHoursModelImplCopyWithImpl<_$WeeklyHoursModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$WeeklyHoursModelImplToJson(this);
  }
}

abstract class _WeeklyHoursModel extends WeeklyHoursModel {
  const factory _WeeklyHoursModel({
    required final String day,
    required final String dayLabel,
    required final bool isClosed,
    final List<TimeRangeModel> timeRanges,
  }) = _$WeeklyHoursModelImpl;
  const _WeeklyHoursModel._() : super._();

  factory _WeeklyHoursModel.fromJson(Map<String, dynamic> json) =
      _$WeeklyHoursModelImpl.fromJson;

  @override
  String get day;
  @override
  String get dayLabel;
  @override
  bool get isClosed;
  @override
  List<TimeRangeModel> get timeRanges;

  /// Create a copy of WeeklyHoursModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WeeklyHoursModelImplCopyWith<_$WeeklyHoursModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
