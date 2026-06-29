// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'operational_day_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OperationalDayModel _$OperationalDayModelFromJson(Map<String, dynamic> json) {
  return _OperationalDayModel.fromJson(json);
}

/// @nodoc
mixin _$OperationalDayModel {
  int get id => throw _privateConstructorUsedError;
  int? get outletId => throw _privateConstructorUsedError;
  String get dayOfWeek => throw _privateConstructorUsedError;
  String? get openTime => throw _privateConstructorUsedError;
  String? get closeTime => throw _privateConstructorUsedError;
  bool get isClosed => throw _privateConstructorUsedError;
  bool get isOpen => throw _privateConstructorUsedError;
  String? get dayLabel => throw _privateConstructorUsedError;

  /// Serializes this OperationalDayModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OperationalDayModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OperationalDayModelCopyWith<OperationalDayModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OperationalDayModelCopyWith<$Res> {
  factory $OperationalDayModelCopyWith(
    OperationalDayModel value,
    $Res Function(OperationalDayModel) then,
  ) = _$OperationalDayModelCopyWithImpl<$Res, OperationalDayModel>;
  @useResult
  $Res call({
    int id,
    int? outletId,
    String dayOfWeek,
    String? openTime,
    String? closeTime,
    bool isClosed,
    bool isOpen,
    String? dayLabel,
  });
}

/// @nodoc
class _$OperationalDayModelCopyWithImpl<$Res, $Val extends OperationalDayModel>
    implements $OperationalDayModelCopyWith<$Res> {
  _$OperationalDayModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OperationalDayModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? outletId = freezed,
    Object? dayOfWeek = null,
    Object? openTime = freezed,
    Object? closeTime = freezed,
    Object? isClosed = null,
    Object? isOpen = null,
    Object? dayLabel = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            outletId: freezed == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int?,
            dayOfWeek: null == dayOfWeek
                ? _value.dayOfWeek
                : dayOfWeek // ignore: cast_nullable_to_non_nullable
                      as String,
            openTime: freezed == openTime
                ? _value.openTime
                : openTime // ignore: cast_nullable_to_non_nullable
                      as String?,
            closeTime: freezed == closeTime
                ? _value.closeTime
                : closeTime // ignore: cast_nullable_to_non_nullable
                      as String?,
            isClosed: null == isClosed
                ? _value.isClosed
                : isClosed // ignore: cast_nullable_to_non_nullable
                      as bool,
            isOpen: null == isOpen
                ? _value.isOpen
                : isOpen // ignore: cast_nullable_to_non_nullable
                      as bool,
            dayLabel: freezed == dayLabel
                ? _value.dayLabel
                : dayLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$OperationalDayModelImplCopyWith<$Res>
    implements $OperationalDayModelCopyWith<$Res> {
  factory _$$OperationalDayModelImplCopyWith(
    _$OperationalDayModelImpl value,
    $Res Function(_$OperationalDayModelImpl) then,
  ) = __$$OperationalDayModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int? outletId,
    String dayOfWeek,
    String? openTime,
    String? closeTime,
    bool isClosed,
    bool isOpen,
    String? dayLabel,
  });
}

/// @nodoc
class __$$OperationalDayModelImplCopyWithImpl<$Res>
    extends _$OperationalDayModelCopyWithImpl<$Res, _$OperationalDayModelImpl>
    implements _$$OperationalDayModelImplCopyWith<$Res> {
  __$$OperationalDayModelImplCopyWithImpl(
    _$OperationalDayModelImpl _value,
    $Res Function(_$OperationalDayModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OperationalDayModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? outletId = freezed,
    Object? dayOfWeek = null,
    Object? openTime = freezed,
    Object? closeTime = freezed,
    Object? isClosed = null,
    Object? isOpen = null,
    Object? dayLabel = freezed,
  }) {
    return _then(
      _$OperationalDayModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        outletId: freezed == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int?,
        dayOfWeek: null == dayOfWeek
            ? _value.dayOfWeek
            : dayOfWeek // ignore: cast_nullable_to_non_nullable
                  as String,
        openTime: freezed == openTime
            ? _value.openTime
            : openTime // ignore: cast_nullable_to_non_nullable
                  as String?,
        closeTime: freezed == closeTime
            ? _value.closeTime
            : closeTime // ignore: cast_nullable_to_non_nullable
                  as String?,
        isClosed: null == isClosed
            ? _value.isClosed
            : isClosed // ignore: cast_nullable_to_non_nullable
                  as bool,
        isOpen: null == isOpen
            ? _value.isOpen
            : isOpen // ignore: cast_nullable_to_non_nullable
                  as bool,
        dayLabel: freezed == dayLabel
            ? _value.dayLabel
            : dayLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OperationalDayModelImpl implements _OperationalDayModel {
  const _$OperationalDayModelImpl({
    required this.id,
    this.outletId,
    required this.dayOfWeek,
    this.openTime,
    this.closeTime,
    this.isClosed = false,
    this.isOpen = false,
    this.dayLabel,
  });

  factory _$OperationalDayModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$OperationalDayModelImplFromJson(json);

  @override
  final int id;
  @override
  final int? outletId;
  @override
  final String dayOfWeek;
  @override
  final String? openTime;
  @override
  final String? closeTime;
  @override
  @JsonKey()
  final bool isClosed;
  @override
  @JsonKey()
  final bool isOpen;
  @override
  final String? dayLabel;

  @override
  String toString() {
    return 'OperationalDayModel(id: $id, outletId: $outletId, dayOfWeek: $dayOfWeek, openTime: $openTime, closeTime: $closeTime, isClosed: $isClosed, isOpen: $isOpen, dayLabel: $dayLabel)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OperationalDayModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.dayOfWeek, dayOfWeek) ||
                other.dayOfWeek == dayOfWeek) &&
            (identical(other.openTime, openTime) ||
                other.openTime == openTime) &&
            (identical(other.closeTime, closeTime) ||
                other.closeTime == closeTime) &&
            (identical(other.isClosed, isClosed) ||
                other.isClosed == isClosed) &&
            (identical(other.isOpen, isOpen) || other.isOpen == isOpen) &&
            (identical(other.dayLabel, dayLabel) ||
                other.dayLabel == dayLabel));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    outletId,
    dayOfWeek,
    openTime,
    closeTime,
    isClosed,
    isOpen,
    dayLabel,
  );

  /// Create a copy of OperationalDayModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OperationalDayModelImplCopyWith<_$OperationalDayModelImpl> get copyWith =>
      __$$OperationalDayModelImplCopyWithImpl<_$OperationalDayModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$OperationalDayModelImplToJson(this);
  }
}

abstract class _OperationalDayModel implements OperationalDayModel {
  const factory _OperationalDayModel({
    required final int id,
    final int? outletId,
    required final String dayOfWeek,
    final String? openTime,
    final String? closeTime,
    final bool isClosed,
    final bool isOpen,
    final String? dayLabel,
  }) = _$OperationalDayModelImpl;

  factory _OperationalDayModel.fromJson(Map<String, dynamic> json) =
      _$OperationalDayModelImpl.fromJson;

  @override
  int get id;
  @override
  int? get outletId;
  @override
  String get dayOfWeek;
  @override
  String? get openTime;
  @override
  String? get closeTime;
  @override
  bool get isClosed;
  @override
  bool get isOpen;
  @override
  String? get dayLabel;

  /// Create a copy of OperationalDayModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OperationalDayModelImplCopyWith<_$OperationalDayModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
