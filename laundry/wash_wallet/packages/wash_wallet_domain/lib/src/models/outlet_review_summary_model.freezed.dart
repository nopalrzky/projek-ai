// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'outlet_review_summary_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$OutletReviewSummaryModel {
  double get averageRating => throw _privateConstructorUsedError;
  int get totalReviews => throw _privateConstructorUsedError;
  Map<int, int> get ratingDistribution => throw _privateConstructorUsedError;

  /// Create a copy of OutletReviewSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OutletReviewSummaryModelCopyWith<OutletReviewSummaryModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OutletReviewSummaryModelCopyWith<$Res> {
  factory $OutletReviewSummaryModelCopyWith(
    OutletReviewSummaryModel value,
    $Res Function(OutletReviewSummaryModel) then,
  ) = _$OutletReviewSummaryModelCopyWithImpl<$Res, OutletReviewSummaryModel>;
  @useResult
  $Res call({
    double averageRating,
    int totalReviews,
    Map<int, int> ratingDistribution,
  });
}

/// @nodoc
class _$OutletReviewSummaryModelCopyWithImpl<
  $Res,
  $Val extends OutletReviewSummaryModel
>
    implements $OutletReviewSummaryModelCopyWith<$Res> {
  _$OutletReviewSummaryModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OutletReviewSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? averageRating = null,
    Object? totalReviews = null,
    Object? ratingDistribution = null,
  }) {
    return _then(
      _value.copyWith(
            averageRating: null == averageRating
                ? _value.averageRating
                : averageRating // ignore: cast_nullable_to_non_nullable
                      as double,
            totalReviews: null == totalReviews
                ? _value.totalReviews
                : totalReviews // ignore: cast_nullable_to_non_nullable
                      as int,
            ratingDistribution: null == ratingDistribution
                ? _value.ratingDistribution
                : ratingDistribution // ignore: cast_nullable_to_non_nullable
                      as Map<int, int>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$OutletReviewSummaryModelImplCopyWith<$Res>
    implements $OutletReviewSummaryModelCopyWith<$Res> {
  factory _$$OutletReviewSummaryModelImplCopyWith(
    _$OutletReviewSummaryModelImpl value,
    $Res Function(_$OutletReviewSummaryModelImpl) then,
  ) = __$$OutletReviewSummaryModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    double averageRating,
    int totalReviews,
    Map<int, int> ratingDistribution,
  });
}

/// @nodoc
class __$$OutletReviewSummaryModelImplCopyWithImpl<$Res>
    extends
        _$OutletReviewSummaryModelCopyWithImpl<
          $Res,
          _$OutletReviewSummaryModelImpl
        >
    implements _$$OutletReviewSummaryModelImplCopyWith<$Res> {
  __$$OutletReviewSummaryModelImplCopyWithImpl(
    _$OutletReviewSummaryModelImpl _value,
    $Res Function(_$OutletReviewSummaryModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OutletReviewSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? averageRating = null,
    Object? totalReviews = null,
    Object? ratingDistribution = null,
  }) {
    return _then(
      _$OutletReviewSummaryModelImpl(
        averageRating: null == averageRating
            ? _value.averageRating
            : averageRating // ignore: cast_nullable_to_non_nullable
                  as double,
        totalReviews: null == totalReviews
            ? _value.totalReviews
            : totalReviews // ignore: cast_nullable_to_non_nullable
                  as int,
        ratingDistribution: null == ratingDistribution
            ? _value._ratingDistribution
            : ratingDistribution // ignore: cast_nullable_to_non_nullable
                  as Map<int, int>,
      ),
    );
  }
}

/// @nodoc

class _$OutletReviewSummaryModelImpl extends _OutletReviewSummaryModel {
  const _$OutletReviewSummaryModelImpl({
    required this.averageRating,
    required this.totalReviews,
    required final Map<int, int> ratingDistribution,
  }) : _ratingDistribution = ratingDistribution,
       super._();

  @override
  final double averageRating;
  @override
  final int totalReviews;
  final Map<int, int> _ratingDistribution;
  @override
  Map<int, int> get ratingDistribution {
    if (_ratingDistribution is EqualUnmodifiableMapView)
      return _ratingDistribution;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_ratingDistribution);
  }

  @override
  String toString() {
    return 'OutletReviewSummaryModel(averageRating: $averageRating, totalReviews: $totalReviews, ratingDistribution: $ratingDistribution)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OutletReviewSummaryModelImpl &&
            (identical(other.averageRating, averageRating) ||
                other.averageRating == averageRating) &&
            (identical(other.totalReviews, totalReviews) ||
                other.totalReviews == totalReviews) &&
            const DeepCollectionEquality().equals(
              other._ratingDistribution,
              _ratingDistribution,
            ));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    averageRating,
    totalReviews,
    const DeepCollectionEquality().hash(_ratingDistribution),
  );

  /// Create a copy of OutletReviewSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OutletReviewSummaryModelImplCopyWith<_$OutletReviewSummaryModelImpl>
  get copyWith =>
      __$$OutletReviewSummaryModelImplCopyWithImpl<
        _$OutletReviewSummaryModelImpl
      >(this, _$identity);
}

abstract class _OutletReviewSummaryModel extends OutletReviewSummaryModel {
  const factory _OutletReviewSummaryModel({
    required final double averageRating,
    required final int totalReviews,
    required final Map<int, int> ratingDistribution,
  }) = _$OutletReviewSummaryModelImpl;
  const _OutletReviewSummaryModel._() : super._();

  @override
  double get averageRating;
  @override
  int get totalReviews;
  @override
  Map<int, int> get ratingDistribution;

  /// Create a copy of OutletReviewSummaryModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OutletReviewSummaryModelImplCopyWith<_$OutletReviewSummaryModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
