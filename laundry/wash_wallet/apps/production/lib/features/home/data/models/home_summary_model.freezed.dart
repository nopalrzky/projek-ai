// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'home_summary_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

HomeSummaryModel _$HomeSummaryModelFromJson(Map<String, dynamic> json) {
  return _HomeSummaryModel.fromJson(json);
}

/// @nodoc
mixin _$HomeSummaryModel {
  int get ordersToday => throw _privateConstructorUsedError;
  int get ordersInProgress => throw _privateConstructorUsedError;
  int get ordersReadyForPickup => throw _privateConstructorUsedError;
  int get ordersCompleted => throw _privateConstructorUsedError;

  /// Serializes this HomeSummaryModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of HomeSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $HomeSummaryModelCopyWith<HomeSummaryModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $HomeSummaryModelCopyWith<$Res> {
  factory $HomeSummaryModelCopyWith(
    HomeSummaryModel value,
    $Res Function(HomeSummaryModel) then,
  ) = _$HomeSummaryModelCopyWithImpl<$Res, HomeSummaryModel>;
  @useResult
  $Res call({
    int ordersToday,
    int ordersInProgress,
    int ordersReadyForPickup,
    int ordersCompleted,
  });
}

/// @nodoc
class _$HomeSummaryModelCopyWithImpl<$Res, $Val extends HomeSummaryModel>
    implements $HomeSummaryModelCopyWith<$Res> {
  _$HomeSummaryModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of HomeSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? ordersToday = null,
    Object? ordersInProgress = null,
    Object? ordersReadyForPickup = null,
    Object? ordersCompleted = null,
  }) {
    return _then(
      _value.copyWith(
            ordersToday: null == ordersToday
                ? _value.ordersToday
                : ordersToday // ignore: cast_nullable_to_non_nullable
                      as int,
            ordersInProgress: null == ordersInProgress
                ? _value.ordersInProgress
                : ordersInProgress // ignore: cast_nullable_to_non_nullable
                      as int,
            ordersReadyForPickup: null == ordersReadyForPickup
                ? _value.ordersReadyForPickup
                : ordersReadyForPickup // ignore: cast_nullable_to_non_nullable
                      as int,
            ordersCompleted: null == ordersCompleted
                ? _value.ordersCompleted
                : ordersCompleted // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$HomeSummaryModelImplCopyWith<$Res>
    implements $HomeSummaryModelCopyWith<$Res> {
  factory _$$HomeSummaryModelImplCopyWith(
    _$HomeSummaryModelImpl value,
    $Res Function(_$HomeSummaryModelImpl) then,
  ) = __$$HomeSummaryModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int ordersToday,
    int ordersInProgress,
    int ordersReadyForPickup,
    int ordersCompleted,
  });
}

/// @nodoc
class __$$HomeSummaryModelImplCopyWithImpl<$Res>
    extends _$HomeSummaryModelCopyWithImpl<$Res, _$HomeSummaryModelImpl>
    implements _$$HomeSummaryModelImplCopyWith<$Res> {
  __$$HomeSummaryModelImplCopyWithImpl(
    _$HomeSummaryModelImpl _value,
    $Res Function(_$HomeSummaryModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of HomeSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? ordersToday = null,
    Object? ordersInProgress = null,
    Object? ordersReadyForPickup = null,
    Object? ordersCompleted = null,
  }) {
    return _then(
      _$HomeSummaryModelImpl(
        ordersToday: null == ordersToday
            ? _value.ordersToday
            : ordersToday // ignore: cast_nullable_to_non_nullable
                  as int,
        ordersInProgress: null == ordersInProgress
            ? _value.ordersInProgress
            : ordersInProgress // ignore: cast_nullable_to_non_nullable
                  as int,
        ordersReadyForPickup: null == ordersReadyForPickup
            ? _value.ordersReadyForPickup
            : ordersReadyForPickup // ignore: cast_nullable_to_non_nullable
                  as int,
        ordersCompleted: null == ordersCompleted
            ? _value.ordersCompleted
            : ordersCompleted // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$HomeSummaryModelImpl extends _HomeSummaryModel {
  const _$HomeSummaryModelImpl({
    required this.ordersToday,
    required this.ordersInProgress,
    required this.ordersReadyForPickup,
    required this.ordersCompleted,
  }) : super._();

  factory _$HomeSummaryModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$HomeSummaryModelImplFromJson(json);

  @override
  final int ordersToday;
  @override
  final int ordersInProgress;
  @override
  final int ordersReadyForPickup;
  @override
  final int ordersCompleted;

  @override
  String toString() {
    return 'HomeSummaryModel(ordersToday: $ordersToday, ordersInProgress: $ordersInProgress, ordersReadyForPickup: $ordersReadyForPickup, ordersCompleted: $ordersCompleted)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$HomeSummaryModelImpl &&
            (identical(other.ordersToday, ordersToday) ||
                other.ordersToday == ordersToday) &&
            (identical(other.ordersInProgress, ordersInProgress) ||
                other.ordersInProgress == ordersInProgress) &&
            (identical(other.ordersReadyForPickup, ordersReadyForPickup) ||
                other.ordersReadyForPickup == ordersReadyForPickup) &&
            (identical(other.ordersCompleted, ordersCompleted) ||
                other.ordersCompleted == ordersCompleted));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    ordersToday,
    ordersInProgress,
    ordersReadyForPickup,
    ordersCompleted,
  );

  /// Create a copy of HomeSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$HomeSummaryModelImplCopyWith<_$HomeSummaryModelImpl> get copyWith =>
      __$$HomeSummaryModelImplCopyWithImpl<_$HomeSummaryModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$HomeSummaryModelImplToJson(this);
  }
}

abstract class _HomeSummaryModel extends HomeSummaryModel {
  const factory _HomeSummaryModel({
    required final int ordersToday,
    required final int ordersInProgress,
    required final int ordersReadyForPickup,
    required final int ordersCompleted,
  }) = _$HomeSummaryModelImpl;
  const _HomeSummaryModel._() : super._();

  factory _HomeSummaryModel.fromJson(Map<String, dynamic> json) =
      _$HomeSummaryModelImpl.fromJson;

  @override
  int get ordersToday;
  @override
  int get ordersInProgress;
  @override
  int get ordersReadyForPickup;
  @override
  int get ordersCompleted;

  /// Create a copy of HomeSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$HomeSummaryModelImplCopyWith<_$HomeSummaryModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
