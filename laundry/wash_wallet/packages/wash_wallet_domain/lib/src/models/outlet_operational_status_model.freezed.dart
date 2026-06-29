// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'outlet_operational_status_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OutletOperationalStatusModel _$OutletOperationalStatusModelFromJson(
  Map<String, dynamic> json,
) {
  return _OutletOperationalStatusModel.fromJson(json);
}

/// @nodoc
mixin _$OutletOperationalStatusModel {
  bool get isOpenNow => throw _privateConstructorUsedError;
  String get operationalStatus => throw _privateConstructorUsedError;
  String get operationalStatusLabel => throw _privateConstructorUsedError;
  String get operationalStatusMessage => throw _privateConstructorUsedError;
  List<TimeRangeModel> get todayHours => throw _privateConstructorUsedError;
  List<WeeklyHoursModel> get weeklyHours => throw _privateConstructorUsedError;
  String? get nextOpenAt => throw _privateConstructorUsedError;
  String? get nextCloseAt => throw _privateConstructorUsedError;
  bool get canCreateOrderNow => throw _privateConstructorUsedError;
  String? get orderDisabledReason => throw _privateConstructorUsedError;
  String get timezone => throw _privateConstructorUsedError;

  /// Serializes this OutletOperationalStatusModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OutletOperationalStatusModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OutletOperationalStatusModelCopyWith<OutletOperationalStatusModel>
  get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OutletOperationalStatusModelCopyWith<$Res> {
  factory $OutletOperationalStatusModelCopyWith(
    OutletOperationalStatusModel value,
    $Res Function(OutletOperationalStatusModel) then,
  ) =
      _$OutletOperationalStatusModelCopyWithImpl<
        $Res,
        OutletOperationalStatusModel
      >;
  @useResult
  $Res call({
    bool isOpenNow,
    String operationalStatus,
    String operationalStatusLabel,
    String operationalStatusMessage,
    List<TimeRangeModel> todayHours,
    List<WeeklyHoursModel> weeklyHours,
    String? nextOpenAt,
    String? nextCloseAt,
    bool canCreateOrderNow,
    String? orderDisabledReason,
    String timezone,
  });
}

/// @nodoc
class _$OutletOperationalStatusModelCopyWithImpl<
  $Res,
  $Val extends OutletOperationalStatusModel
>
    implements $OutletOperationalStatusModelCopyWith<$Res> {
  _$OutletOperationalStatusModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OutletOperationalStatusModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isOpenNow = null,
    Object? operationalStatus = null,
    Object? operationalStatusLabel = null,
    Object? operationalStatusMessage = null,
    Object? todayHours = null,
    Object? weeklyHours = null,
    Object? nextOpenAt = freezed,
    Object? nextCloseAt = freezed,
    Object? canCreateOrderNow = null,
    Object? orderDisabledReason = freezed,
    Object? timezone = null,
  }) {
    return _then(
      _value.copyWith(
            isOpenNow: null == isOpenNow
                ? _value.isOpenNow
                : isOpenNow // ignore: cast_nullable_to_non_nullable
                      as bool,
            operationalStatus: null == operationalStatus
                ? _value.operationalStatus
                : operationalStatus // ignore: cast_nullable_to_non_nullable
                      as String,
            operationalStatusLabel: null == operationalStatusLabel
                ? _value.operationalStatusLabel
                : operationalStatusLabel // ignore: cast_nullable_to_non_nullable
                      as String,
            operationalStatusMessage: null == operationalStatusMessage
                ? _value.operationalStatusMessage
                : operationalStatusMessage // ignore: cast_nullable_to_non_nullable
                      as String,
            todayHours: null == todayHours
                ? _value.todayHours
                : todayHours // ignore: cast_nullable_to_non_nullable
                      as List<TimeRangeModel>,
            weeklyHours: null == weeklyHours
                ? _value.weeklyHours
                : weeklyHours // ignore: cast_nullable_to_non_nullable
                      as List<WeeklyHoursModel>,
            nextOpenAt: freezed == nextOpenAt
                ? _value.nextOpenAt
                : nextOpenAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            nextCloseAt: freezed == nextCloseAt
                ? _value.nextCloseAt
                : nextCloseAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            canCreateOrderNow: null == canCreateOrderNow
                ? _value.canCreateOrderNow
                : canCreateOrderNow // ignore: cast_nullable_to_non_nullable
                      as bool,
            orderDisabledReason: freezed == orderDisabledReason
                ? _value.orderDisabledReason
                : orderDisabledReason // ignore: cast_nullable_to_non_nullable
                      as String?,
            timezone: null == timezone
                ? _value.timezone
                : timezone // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$OutletOperationalStatusModelImplCopyWith<$Res>
    implements $OutletOperationalStatusModelCopyWith<$Res> {
  factory _$$OutletOperationalStatusModelImplCopyWith(
    _$OutletOperationalStatusModelImpl value,
    $Res Function(_$OutletOperationalStatusModelImpl) then,
  ) = __$$OutletOperationalStatusModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    bool isOpenNow,
    String operationalStatus,
    String operationalStatusLabel,
    String operationalStatusMessage,
    List<TimeRangeModel> todayHours,
    List<WeeklyHoursModel> weeklyHours,
    String? nextOpenAt,
    String? nextCloseAt,
    bool canCreateOrderNow,
    String? orderDisabledReason,
    String timezone,
  });
}

/// @nodoc
class __$$OutletOperationalStatusModelImplCopyWithImpl<$Res>
    extends
        _$OutletOperationalStatusModelCopyWithImpl<
          $Res,
          _$OutletOperationalStatusModelImpl
        >
    implements _$$OutletOperationalStatusModelImplCopyWith<$Res> {
  __$$OutletOperationalStatusModelImplCopyWithImpl(
    _$OutletOperationalStatusModelImpl _value,
    $Res Function(_$OutletOperationalStatusModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OutletOperationalStatusModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? isOpenNow = null,
    Object? operationalStatus = null,
    Object? operationalStatusLabel = null,
    Object? operationalStatusMessage = null,
    Object? todayHours = null,
    Object? weeklyHours = null,
    Object? nextOpenAt = freezed,
    Object? nextCloseAt = freezed,
    Object? canCreateOrderNow = null,
    Object? orderDisabledReason = freezed,
    Object? timezone = null,
  }) {
    return _then(
      _$OutletOperationalStatusModelImpl(
        isOpenNow: null == isOpenNow
            ? _value.isOpenNow
            : isOpenNow // ignore: cast_nullable_to_non_nullable
                  as bool,
        operationalStatus: null == operationalStatus
            ? _value.operationalStatus
            : operationalStatus // ignore: cast_nullable_to_non_nullable
                  as String,
        operationalStatusLabel: null == operationalStatusLabel
            ? _value.operationalStatusLabel
            : operationalStatusLabel // ignore: cast_nullable_to_non_nullable
                  as String,
        operationalStatusMessage: null == operationalStatusMessage
            ? _value.operationalStatusMessage
            : operationalStatusMessage // ignore: cast_nullable_to_non_nullable
                  as String,
        todayHours: null == todayHours
            ? _value._todayHours
            : todayHours // ignore: cast_nullable_to_non_nullable
                  as List<TimeRangeModel>,
        weeklyHours: null == weeklyHours
            ? _value._weeklyHours
            : weeklyHours // ignore: cast_nullable_to_non_nullable
                  as List<WeeklyHoursModel>,
        nextOpenAt: freezed == nextOpenAt
            ? _value.nextOpenAt
            : nextOpenAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        nextCloseAt: freezed == nextCloseAt
            ? _value.nextCloseAt
            : nextCloseAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        canCreateOrderNow: null == canCreateOrderNow
            ? _value.canCreateOrderNow
            : canCreateOrderNow // ignore: cast_nullable_to_non_nullable
                  as bool,
        orderDisabledReason: freezed == orderDisabledReason
            ? _value.orderDisabledReason
            : orderDisabledReason // ignore: cast_nullable_to_non_nullable
                  as String?,
        timezone: null == timezone
            ? _value.timezone
            : timezone // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OutletOperationalStatusModelImpl extends _OutletOperationalStatusModel {
  const _$OutletOperationalStatusModelImpl({
    this.isOpenNow = false,
    this.operationalStatus = 'hours_not_set',
    this.operationalStatusLabel = 'Jam operasional belum tersedia',
    this.operationalStatusMessage =
        'Outlet belum dapat menerima order saat ini.',
    final List<TimeRangeModel> todayHours = const [],
    final List<WeeklyHoursModel> weeklyHours = const [],
    this.nextOpenAt,
    this.nextCloseAt,
    this.canCreateOrderNow = false,
    this.orderDisabledReason,
    this.timezone = 'Asia/Jakarta',
  }) : _todayHours = todayHours,
       _weeklyHours = weeklyHours,
       super._();

  factory _$OutletOperationalStatusModelImpl.fromJson(
    Map<String, dynamic> json,
  ) => _$$OutletOperationalStatusModelImplFromJson(json);

  @override
  @JsonKey()
  final bool isOpenNow;
  @override
  @JsonKey()
  final String operationalStatus;
  @override
  @JsonKey()
  final String operationalStatusLabel;
  @override
  @JsonKey()
  final String operationalStatusMessage;
  final List<TimeRangeModel> _todayHours;
  @override
  @JsonKey()
  List<TimeRangeModel> get todayHours {
    if (_todayHours is EqualUnmodifiableListView) return _todayHours;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_todayHours);
  }

  final List<WeeklyHoursModel> _weeklyHours;
  @override
  @JsonKey()
  List<WeeklyHoursModel> get weeklyHours {
    if (_weeklyHours is EqualUnmodifiableListView) return _weeklyHours;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_weeklyHours);
  }

  @override
  final String? nextOpenAt;
  @override
  final String? nextCloseAt;
  @override
  @JsonKey()
  final bool canCreateOrderNow;
  @override
  final String? orderDisabledReason;
  @override
  @JsonKey()
  final String timezone;

  @override
  String toString() {
    return 'OutletOperationalStatusModel(isOpenNow: $isOpenNow, operationalStatus: $operationalStatus, operationalStatusLabel: $operationalStatusLabel, operationalStatusMessage: $operationalStatusMessage, todayHours: $todayHours, weeklyHours: $weeklyHours, nextOpenAt: $nextOpenAt, nextCloseAt: $nextCloseAt, canCreateOrderNow: $canCreateOrderNow, orderDisabledReason: $orderDisabledReason, timezone: $timezone)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OutletOperationalStatusModelImpl &&
            (identical(other.isOpenNow, isOpenNow) ||
                other.isOpenNow == isOpenNow) &&
            (identical(other.operationalStatus, operationalStatus) ||
                other.operationalStatus == operationalStatus) &&
            (identical(other.operationalStatusLabel, operationalStatusLabel) ||
                other.operationalStatusLabel == operationalStatusLabel) &&
            (identical(
                  other.operationalStatusMessage,
                  operationalStatusMessage,
                ) ||
                other.operationalStatusMessage == operationalStatusMessage) &&
            const DeepCollectionEquality().equals(
              other._todayHours,
              _todayHours,
            ) &&
            const DeepCollectionEquality().equals(
              other._weeklyHours,
              _weeklyHours,
            ) &&
            (identical(other.nextOpenAt, nextOpenAt) ||
                other.nextOpenAt == nextOpenAt) &&
            (identical(other.nextCloseAt, nextCloseAt) ||
                other.nextCloseAt == nextCloseAt) &&
            (identical(other.canCreateOrderNow, canCreateOrderNow) ||
                other.canCreateOrderNow == canCreateOrderNow) &&
            (identical(other.orderDisabledReason, orderDisabledReason) ||
                other.orderDisabledReason == orderDisabledReason) &&
            (identical(other.timezone, timezone) ||
                other.timezone == timezone));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    isOpenNow,
    operationalStatus,
    operationalStatusLabel,
    operationalStatusMessage,
    const DeepCollectionEquality().hash(_todayHours),
    const DeepCollectionEquality().hash(_weeklyHours),
    nextOpenAt,
    nextCloseAt,
    canCreateOrderNow,
    orderDisabledReason,
    timezone,
  );

  /// Create a copy of OutletOperationalStatusModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OutletOperationalStatusModelImplCopyWith<
    _$OutletOperationalStatusModelImpl
  >
  get copyWith =>
      __$$OutletOperationalStatusModelImplCopyWithImpl<
        _$OutletOperationalStatusModelImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OutletOperationalStatusModelImplToJson(this);
  }
}

abstract class _OutletOperationalStatusModel
    extends OutletOperationalStatusModel {
  const factory _OutletOperationalStatusModel({
    final bool isOpenNow,
    final String operationalStatus,
    final String operationalStatusLabel,
    final String operationalStatusMessage,
    final List<TimeRangeModel> todayHours,
    final List<WeeklyHoursModel> weeklyHours,
    final String? nextOpenAt,
    final String? nextCloseAt,
    final bool canCreateOrderNow,
    final String? orderDisabledReason,
    final String timezone,
  }) = _$OutletOperationalStatusModelImpl;
  const _OutletOperationalStatusModel._() : super._();

  factory _OutletOperationalStatusModel.fromJson(Map<String, dynamic> json) =
      _$OutletOperationalStatusModelImpl.fromJson;

  @override
  bool get isOpenNow;
  @override
  String get operationalStatus;
  @override
  String get operationalStatusLabel;
  @override
  String get operationalStatusMessage;
  @override
  List<TimeRangeModel> get todayHours;
  @override
  List<WeeklyHoursModel> get weeklyHours;
  @override
  String? get nextOpenAt;
  @override
  String? get nextCloseAt;
  @override
  bool get canCreateOrderNow;
  @override
  String? get orderDisabledReason;
  @override
  String get timezone;

  /// Create a copy of OutletOperationalStatusModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OutletOperationalStatusModelImplCopyWith<
    _$OutletOperationalStatusModelImpl
  >
  get copyWith => throw _privateConstructorUsedError;
}
