// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'process_queue_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ProcessQueueModel _$ProcessQueueModelFromJson(Map<String, dynamic> json) {
  return _ProcessQueueModel.fromJson(json);
}

/// @nodoc
mixin _$ProcessQueueModel {
  int get processId => throw _privateConstructorUsedError;
  String get processName => throw _privateConstructorUsedError;
  int get totalOrders => throw _privateConstructorUsedError;

  /// Serializes this ProcessQueueModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProcessQueueModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProcessQueueModelCopyWith<ProcessQueueModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProcessQueueModelCopyWith<$Res> {
  factory $ProcessQueueModelCopyWith(
    ProcessQueueModel value,
    $Res Function(ProcessQueueModel) then,
  ) = _$ProcessQueueModelCopyWithImpl<$Res, ProcessQueueModel>;
  @useResult
  $Res call({int processId, String processName, int totalOrders});
}

/// @nodoc
class _$ProcessQueueModelCopyWithImpl<$Res, $Val extends ProcessQueueModel>
    implements $ProcessQueueModelCopyWith<$Res> {
  _$ProcessQueueModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProcessQueueModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? processId = null,
    Object? processName = null,
    Object? totalOrders = null,
  }) {
    return _then(
      _value.copyWith(
            processId: null == processId
                ? _value.processId
                : processId // ignore: cast_nullable_to_non_nullable
                      as int,
            processName: null == processName
                ? _value.processName
                : processName // ignore: cast_nullable_to_non_nullable
                      as String,
            totalOrders: null == totalOrders
                ? _value.totalOrders
                : totalOrders // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ProcessQueueModelImplCopyWith<$Res>
    implements $ProcessQueueModelCopyWith<$Res> {
  factory _$$ProcessQueueModelImplCopyWith(
    _$ProcessQueueModelImpl value,
    $Res Function(_$ProcessQueueModelImpl) then,
  ) = __$$ProcessQueueModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int processId, String processName, int totalOrders});
}

/// @nodoc
class __$$ProcessQueueModelImplCopyWithImpl<$Res>
    extends _$ProcessQueueModelCopyWithImpl<$Res, _$ProcessQueueModelImpl>
    implements _$$ProcessQueueModelImplCopyWith<$Res> {
  __$$ProcessQueueModelImplCopyWithImpl(
    _$ProcessQueueModelImpl _value,
    $Res Function(_$ProcessQueueModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ProcessQueueModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? processId = null,
    Object? processName = null,
    Object? totalOrders = null,
  }) {
    return _then(
      _$ProcessQueueModelImpl(
        processId: null == processId
            ? _value.processId
            : processId // ignore: cast_nullable_to_non_nullable
                  as int,
        processName: null == processName
            ? _value.processName
            : processName // ignore: cast_nullable_to_non_nullable
                  as String,
        totalOrders: null == totalOrders
            ? _value.totalOrders
            : totalOrders // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ProcessQueueModelImpl extends _ProcessQueueModel {
  const _$ProcessQueueModelImpl({
    required this.processId,
    required this.processName,
    required this.totalOrders,
  }) : super._();

  factory _$ProcessQueueModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProcessQueueModelImplFromJson(json);

  @override
  final int processId;
  @override
  final String processName;
  @override
  final int totalOrders;

  @override
  String toString() {
    return 'ProcessQueueModel(processId: $processId, processName: $processName, totalOrders: $totalOrders)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProcessQueueModelImpl &&
            (identical(other.processId, processId) ||
                other.processId == processId) &&
            (identical(other.processName, processName) ||
                other.processName == processName) &&
            (identical(other.totalOrders, totalOrders) ||
                other.totalOrders == totalOrders));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, processId, processName, totalOrders);

  /// Create a copy of ProcessQueueModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProcessQueueModelImplCopyWith<_$ProcessQueueModelImpl> get copyWith =>
      __$$ProcessQueueModelImplCopyWithImpl<_$ProcessQueueModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ProcessQueueModelImplToJson(this);
  }
}

abstract class _ProcessQueueModel extends ProcessQueueModel {
  const factory _ProcessQueueModel({
    required final int processId,
    required final String processName,
    required final int totalOrders,
  }) = _$ProcessQueueModelImpl;
  const _ProcessQueueModel._() : super._();

  factory _ProcessQueueModel.fromJson(Map<String, dynamic> json) =
      _$ProcessQueueModelImpl.fromJson;

  @override
  int get processId;
  @override
  String get processName;
  @override
  int get totalOrders;

  /// Create a copy of ProcessQueueModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProcessQueueModelImplCopyWith<_$ProcessQueueModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
