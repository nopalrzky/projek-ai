// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order_review_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OrderReviewModel _$OrderReviewModelFromJson(Map<String, dynamic> json) {
  return _OrderReviewModel.fromJson(json);
}

/// @nodoc
mixin _$OrderReviewModel {
  int get id => throw _privateConstructorUsedError;
  int get orderId => throw _privateConstructorUsedError;
  int get outletId => throw _privateConstructorUsedError;
  int get rating => throw _privateConstructorUsedError;
  String? get comment => throw _privateConstructorUsedError;
  String? get maskedName => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  String? get formattedCreatedAt => throw _privateConstructorUsedError;

  /// Serializes this OrderReviewModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OrderReviewModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OrderReviewModelCopyWith<OrderReviewModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OrderReviewModelCopyWith<$Res> {
  factory $OrderReviewModelCopyWith(
    OrderReviewModel value,
    $Res Function(OrderReviewModel) then,
  ) = _$OrderReviewModelCopyWithImpl<$Res, OrderReviewModel>;
  @useResult
  $Res call({
    int id,
    int orderId,
    int outletId,
    int rating,
    String? comment,
    String? maskedName,
    DateTime? createdAt,
    String? formattedCreatedAt,
  });
}

/// @nodoc
class _$OrderReviewModelCopyWithImpl<$Res, $Val extends OrderReviewModel>
    implements $OrderReviewModelCopyWith<$Res> {
  _$OrderReviewModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OrderReviewModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderId = null,
    Object? outletId = null,
    Object? rating = null,
    Object? comment = freezed,
    Object? maskedName = freezed,
    Object? createdAt = freezed,
    Object? formattedCreatedAt = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            orderId: null == orderId
                ? _value.orderId
                : orderId // ignore: cast_nullable_to_non_nullable
                      as int,
            outletId: null == outletId
                ? _value.outletId
                : outletId // ignore: cast_nullable_to_non_nullable
                      as int,
            rating: null == rating
                ? _value.rating
                : rating // ignore: cast_nullable_to_non_nullable
                      as int,
            comment: freezed == comment
                ? _value.comment
                : comment // ignore: cast_nullable_to_non_nullable
                      as String?,
            maskedName: freezed == maskedName
                ? _value.maskedName
                : maskedName // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            formattedCreatedAt: freezed == formattedCreatedAt
                ? _value.formattedCreatedAt
                : formattedCreatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$OrderReviewModelImplCopyWith<$Res>
    implements $OrderReviewModelCopyWith<$Res> {
  factory _$$OrderReviewModelImplCopyWith(
    _$OrderReviewModelImpl value,
    $Res Function(_$OrderReviewModelImpl) then,
  ) = __$$OrderReviewModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int orderId,
    int outletId,
    int rating,
    String? comment,
    String? maskedName,
    DateTime? createdAt,
    String? formattedCreatedAt,
  });
}

/// @nodoc
class __$$OrderReviewModelImplCopyWithImpl<$Res>
    extends _$OrderReviewModelCopyWithImpl<$Res, _$OrderReviewModelImpl>
    implements _$$OrderReviewModelImplCopyWith<$Res> {
  __$$OrderReviewModelImplCopyWithImpl(
    _$OrderReviewModelImpl _value,
    $Res Function(_$OrderReviewModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OrderReviewModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? orderId = null,
    Object? outletId = null,
    Object? rating = null,
    Object? comment = freezed,
    Object? maskedName = freezed,
    Object? createdAt = freezed,
    Object? formattedCreatedAt = freezed,
  }) {
    return _then(
      _$OrderReviewModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        orderId: null == orderId
            ? _value.orderId
            : orderId // ignore: cast_nullable_to_non_nullable
                  as int,
        outletId: null == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int,
        rating: null == rating
            ? _value.rating
            : rating // ignore: cast_nullable_to_non_nullable
                  as int,
        comment: freezed == comment
            ? _value.comment
            : comment // ignore: cast_nullable_to_non_nullable
                  as String?,
        maskedName: freezed == maskedName
            ? _value.maskedName
            : maskedName // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        formattedCreatedAt: freezed == formattedCreatedAt
            ? _value.formattedCreatedAt
            : formattedCreatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OrderReviewModelImpl extends _OrderReviewModel {
  const _$OrderReviewModelImpl({
    required this.id,
    required this.orderId,
    required this.outletId,
    required this.rating,
    this.comment,
    this.maskedName,
    this.createdAt,
    this.formattedCreatedAt,
  }) : super._();

  factory _$OrderReviewModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$OrderReviewModelImplFromJson(json);

  @override
  final int id;
  @override
  final int orderId;
  @override
  final int outletId;
  @override
  final int rating;
  @override
  final String? comment;
  @override
  final String? maskedName;
  @override
  final DateTime? createdAt;
  @override
  final String? formattedCreatedAt;

  @override
  String toString() {
    return 'OrderReviewModel(id: $id, orderId: $orderId, outletId: $outletId, rating: $rating, comment: $comment, maskedName: $maskedName, createdAt: $createdAt, formattedCreatedAt: $formattedCreatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OrderReviewModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.orderId, orderId) || other.orderId == orderId) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.rating, rating) || other.rating == rating) &&
            (identical(other.comment, comment) || other.comment == comment) &&
            (identical(other.maskedName, maskedName) ||
                other.maskedName == maskedName) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.formattedCreatedAt, formattedCreatedAt) ||
                other.formattedCreatedAt == formattedCreatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    orderId,
    outletId,
    rating,
    comment,
    maskedName,
    createdAt,
    formattedCreatedAt,
  );

  /// Create a copy of OrderReviewModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OrderReviewModelImplCopyWith<_$OrderReviewModelImpl> get copyWith =>
      __$$OrderReviewModelImplCopyWithImpl<_$OrderReviewModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$OrderReviewModelImplToJson(this);
  }
}

abstract class _OrderReviewModel extends OrderReviewModel {
  const factory _OrderReviewModel({
    required final int id,
    required final int orderId,
    required final int outletId,
    required final int rating,
    final String? comment,
    final String? maskedName,
    final DateTime? createdAt,
    final String? formattedCreatedAt,
  }) = _$OrderReviewModelImpl;
  const _OrderReviewModel._() : super._();

  factory _OrderReviewModel.fromJson(Map<String, dynamic> json) =
      _$OrderReviewModelImpl.fromJson;

  @override
  int get id;
  @override
  int get orderId;
  @override
  int get outletId;
  @override
  int get rating;
  @override
  String? get comment;
  @override
  String? get maskedName;
  @override
  DateTime? get createdAt;
  @override
  String? get formattedCreatedAt;

  /// Create a copy of OrderReviewModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OrderReviewModelImplCopyWith<_$OrderReviewModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
