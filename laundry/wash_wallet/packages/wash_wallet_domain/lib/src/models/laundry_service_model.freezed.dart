// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'laundry_service_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

LaundryServiceModel _$LaundryServiceModelFromJson(Map<String, dynamic> json) {
  return _LaundryServiceModel.fromJson(json);
}

/// @nodoc
mixin _$LaundryServiceModel {
  int get id => throw _privateConstructorUsedError;
  int get categoryId => throw _privateConstructorUsedError;
  int get unitId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  double get price => throw _privateConstructorUsedError;
  int get durationHours => throw _privateConstructorUsedError;
  int get minQuantity => throw _privateConstructorUsedError;
  String get slug => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;
  String? get deletedAt => throw _privateConstructorUsedError;
  UnitModel? get unit => throw _privateConstructorUsedError;
  CategoryModel? get category => throw _privateConstructorUsedError;
  int get laundryServiceProcessesCount => throw _privateConstructorUsedError;
  int get servicePackageItemsCount => throw _privateConstructorUsedError;
  double? get averageRating => throw _privateConstructorUsedError;
  int? get reviewsCount => throw _privateConstructorUsedError;
  bool get supportsCourier => throw _privateConstructorUsedError;
  String? get courierSupportLabel => throw _privateConstructorUsedError;
  String? get courierSupportMessage => throw _privateConstructorUsedError;

  /// Serializes this LaundryServiceModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LaundryServiceModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LaundryServiceModelCopyWith<LaundryServiceModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LaundryServiceModelCopyWith<$Res> {
  factory $LaundryServiceModelCopyWith(
    LaundryServiceModel value,
    $Res Function(LaundryServiceModel) then,
  ) = _$LaundryServiceModelCopyWithImpl<$Res, LaundryServiceModel>;
  @useResult
  $Res call({
    int id,
    int categoryId,
    int unitId,
    String name,
    String? description,
    double price,
    int durationHours,
    int minQuantity,
    String slug,
    bool isActive,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    UnitModel? unit,
    CategoryModel? category,
    int laundryServiceProcessesCount,
    int servicePackageItemsCount,
    double? averageRating,
    int? reviewsCount,
    bool supportsCourier,
    String? courierSupportLabel,
    String? courierSupportMessage,
  });

  $UnitModelCopyWith<$Res>? get unit;
  $CategoryModelCopyWith<$Res>? get category;
}

/// @nodoc
class _$LaundryServiceModelCopyWithImpl<$Res, $Val extends LaundryServiceModel>
    implements $LaundryServiceModelCopyWith<$Res> {
  _$LaundryServiceModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LaundryServiceModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? categoryId = null,
    Object? unitId = null,
    Object? name = null,
    Object? description = freezed,
    Object? price = null,
    Object? durationHours = null,
    Object? minQuantity = null,
    Object? slug = null,
    Object? isActive = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? unit = freezed,
    Object? category = freezed,
    Object? laundryServiceProcessesCount = null,
    Object? servicePackageItemsCount = null,
    Object? averageRating = freezed,
    Object? reviewsCount = freezed,
    Object? supportsCourier = null,
    Object? courierSupportLabel = freezed,
    Object? courierSupportMessage = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            categoryId: null == categoryId
                ? _value.categoryId
                : categoryId // ignore: cast_nullable_to_non_nullable
                      as int,
            unitId: null == unitId
                ? _value.unitId
                : unitId // ignore: cast_nullable_to_non_nullable
                      as int,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            price: null == price
                ? _value.price
                : price // ignore: cast_nullable_to_non_nullable
                      as double,
            durationHours: null == durationHours
                ? _value.durationHours
                : durationHours // ignore: cast_nullable_to_non_nullable
                      as int,
            minQuantity: null == minQuantity
                ? _value.minQuantity
                : minQuantity // ignore: cast_nullable_to_non_nullable
                      as int,
            slug: null == slug
                ? _value.slug
                : slug // ignore: cast_nullable_to_non_nullable
                      as String,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            deletedAt: freezed == deletedAt
                ? _value.deletedAt
                : deletedAt // ignore: cast_nullable_to_non_nullable
                      as String?,
            unit: freezed == unit
                ? _value.unit
                : unit // ignore: cast_nullable_to_non_nullable
                      as UnitModel?,
            category: freezed == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as CategoryModel?,
            laundryServiceProcessesCount: null == laundryServiceProcessesCount
                ? _value.laundryServiceProcessesCount
                : laundryServiceProcessesCount // ignore: cast_nullable_to_non_nullable
                      as int,
            servicePackageItemsCount: null == servicePackageItemsCount
                ? _value.servicePackageItemsCount
                : servicePackageItemsCount // ignore: cast_nullable_to_non_nullable
                      as int,
            averageRating: freezed == averageRating
                ? _value.averageRating
                : averageRating // ignore: cast_nullable_to_non_nullable
                      as double?,
            reviewsCount: freezed == reviewsCount
                ? _value.reviewsCount
                : reviewsCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            supportsCourier: null == supportsCourier
                ? _value.supportsCourier
                : supportsCourier // ignore: cast_nullable_to_non_nullable
                      as bool,
            courierSupportLabel: freezed == courierSupportLabel
                ? _value.courierSupportLabel
                : courierSupportLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
            courierSupportMessage: freezed == courierSupportMessage
                ? _value.courierSupportMessage
                : courierSupportMessage // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }

  /// Create a copy of LaundryServiceModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $UnitModelCopyWith<$Res>? get unit {
    if (_value.unit == null) {
      return null;
    }

    return $UnitModelCopyWith<$Res>(_value.unit!, (value) {
      return _then(_value.copyWith(unit: value) as $Val);
    });
  }

  /// Create a copy of LaundryServiceModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CategoryModelCopyWith<$Res>? get category {
    if (_value.category == null) {
      return null;
    }

    return $CategoryModelCopyWith<$Res>(_value.category!, (value) {
      return _then(_value.copyWith(category: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$LaundryServiceModelImplCopyWith<$Res>
    implements $LaundryServiceModelCopyWith<$Res> {
  factory _$$LaundryServiceModelImplCopyWith(
    _$LaundryServiceModelImpl value,
    $Res Function(_$LaundryServiceModelImpl) then,
  ) = __$$LaundryServiceModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int categoryId,
    int unitId,
    String name,
    String? description,
    double price,
    int durationHours,
    int minQuantity,
    String slug,
    bool isActive,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    UnitModel? unit,
    CategoryModel? category,
    int laundryServiceProcessesCount,
    int servicePackageItemsCount,
    double? averageRating,
    int? reviewsCount,
    bool supportsCourier,
    String? courierSupportLabel,
    String? courierSupportMessage,
  });

  @override
  $UnitModelCopyWith<$Res>? get unit;
  @override
  $CategoryModelCopyWith<$Res>? get category;
}

/// @nodoc
class __$$LaundryServiceModelImplCopyWithImpl<$Res>
    extends _$LaundryServiceModelCopyWithImpl<$Res, _$LaundryServiceModelImpl>
    implements _$$LaundryServiceModelImplCopyWith<$Res> {
  __$$LaundryServiceModelImplCopyWithImpl(
    _$LaundryServiceModelImpl _value,
    $Res Function(_$LaundryServiceModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of LaundryServiceModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? categoryId = null,
    Object? unitId = null,
    Object? name = null,
    Object? description = freezed,
    Object? price = null,
    Object? durationHours = null,
    Object? minQuantity = null,
    Object? slug = null,
    Object? isActive = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? unit = freezed,
    Object? category = freezed,
    Object? laundryServiceProcessesCount = null,
    Object? servicePackageItemsCount = null,
    Object? averageRating = freezed,
    Object? reviewsCount = freezed,
    Object? supportsCourier = null,
    Object? courierSupportLabel = freezed,
    Object? courierSupportMessage = freezed,
  }) {
    return _then(
      _$LaundryServiceModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        categoryId: null == categoryId
            ? _value.categoryId
            : categoryId // ignore: cast_nullable_to_non_nullable
                  as int,
        unitId: null == unitId
            ? _value.unitId
            : unitId // ignore: cast_nullable_to_non_nullable
                  as int,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        price: null == price
            ? _value.price
            : price // ignore: cast_nullable_to_non_nullable
                  as double,
        durationHours: null == durationHours
            ? _value.durationHours
            : durationHours // ignore: cast_nullable_to_non_nullable
                  as int,
        minQuantity: null == minQuantity
            ? _value.minQuantity
            : minQuantity // ignore: cast_nullable_to_non_nullable
                  as int,
        slug: null == slug
            ? _value.slug
            : slug // ignore: cast_nullable_to_non_nullable
                  as String,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        deletedAt: freezed == deletedAt
            ? _value.deletedAt
            : deletedAt // ignore: cast_nullable_to_non_nullable
                  as String?,
        unit: freezed == unit
            ? _value.unit
            : unit // ignore: cast_nullable_to_non_nullable
                  as UnitModel?,
        category: freezed == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as CategoryModel?,
        laundryServiceProcessesCount: null == laundryServiceProcessesCount
            ? _value.laundryServiceProcessesCount
            : laundryServiceProcessesCount // ignore: cast_nullable_to_non_nullable
                  as int,
        servicePackageItemsCount: null == servicePackageItemsCount
            ? _value.servicePackageItemsCount
            : servicePackageItemsCount // ignore: cast_nullable_to_non_nullable
                  as int,
        averageRating: freezed == averageRating
            ? _value.averageRating
            : averageRating // ignore: cast_nullable_to_non_nullable
                  as double?,
        reviewsCount: freezed == reviewsCount
            ? _value.reviewsCount
            : reviewsCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        supportsCourier: null == supportsCourier
            ? _value.supportsCourier
            : supportsCourier // ignore: cast_nullable_to_non_nullable
                  as bool,
        courierSupportLabel: freezed == courierSupportLabel
            ? _value.courierSupportLabel
            : courierSupportLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
        courierSupportMessage: freezed == courierSupportMessage
            ? _value.courierSupportMessage
            : courierSupportMessage // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$LaundryServiceModelImpl extends _LaundryServiceModel {
  const _$LaundryServiceModelImpl({
    required this.id,
    required this.categoryId,
    required this.unitId,
    required this.name,
    this.description,
    required this.price,
    required this.durationHours,
    required this.minQuantity,
    required this.slug,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.unit,
    this.category,
    this.laundryServiceProcessesCount = 0,
    this.servicePackageItemsCount = 0,
    this.averageRating,
    this.reviewsCount,
    this.supportsCourier = true,
    this.courierSupportLabel,
    this.courierSupportMessage,
  }) : super._();

  factory _$LaundryServiceModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$LaundryServiceModelImplFromJson(json);

  @override
  final int id;
  @override
  final int categoryId;
  @override
  final int unitId;
  @override
  final String name;
  @override
  final String? description;
  @override
  final double price;
  @override
  final int durationHours;
  @override
  final int minQuantity;
  @override
  final String slug;
  @override
  final bool isActive;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;
  @override
  final String? deletedAt;
  @override
  final UnitModel? unit;
  @override
  final CategoryModel? category;
  @override
  @JsonKey()
  final int laundryServiceProcessesCount;
  @override
  @JsonKey()
  final int servicePackageItemsCount;
  @override
  final double? averageRating;
  @override
  final int? reviewsCount;
  @override
  @JsonKey()
  final bool supportsCourier;
  @override
  final String? courierSupportLabel;
  @override
  final String? courierSupportMessage;

  @override
  String toString() {
    return 'LaundryServiceModel(id: $id, categoryId: $categoryId, unitId: $unitId, name: $name, description: $description, price: $price, durationHours: $durationHours, minQuantity: $minQuantity, slug: $slug, isActive: $isActive, createdAt: $createdAt, updatedAt: $updatedAt, deletedAt: $deletedAt, unit: $unit, category: $category, laundryServiceProcessesCount: $laundryServiceProcessesCount, servicePackageItemsCount: $servicePackageItemsCount, averageRating: $averageRating, reviewsCount: $reviewsCount, supportsCourier: $supportsCourier, courierSupportLabel: $courierSupportLabel, courierSupportMessage: $courierSupportMessage)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LaundryServiceModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.categoryId, categoryId) ||
                other.categoryId == categoryId) &&
            (identical(other.unitId, unitId) || other.unitId == unitId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.durationHours, durationHours) ||
                other.durationHours == durationHours) &&
            (identical(other.minQuantity, minQuantity) ||
                other.minQuantity == minQuantity) &&
            (identical(other.slug, slug) || other.slug == slug) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.deletedAt, deletedAt) ||
                other.deletedAt == deletedAt) &&
            (identical(other.unit, unit) || other.unit == unit) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(
                  other.laundryServiceProcessesCount,
                  laundryServiceProcessesCount,
                ) ||
                other.laundryServiceProcessesCount ==
                    laundryServiceProcessesCount) &&
            (identical(
                  other.servicePackageItemsCount,
                  servicePackageItemsCount,
                ) ||
                other.servicePackageItemsCount == servicePackageItemsCount) &&
            (identical(other.averageRating, averageRating) ||
                other.averageRating == averageRating) &&
            (identical(other.reviewsCount, reviewsCount) ||
                other.reviewsCount == reviewsCount) &&
            (identical(other.supportsCourier, supportsCourier) ||
                other.supportsCourier == supportsCourier) &&
            (identical(other.courierSupportLabel, courierSupportLabel) ||
                other.courierSupportLabel == courierSupportLabel) &&
            (identical(other.courierSupportMessage, courierSupportMessage) ||
                other.courierSupportMessage == courierSupportMessage));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    categoryId,
    unitId,
    name,
    description,
    price,
    durationHours,
    minQuantity,
    slug,
    isActive,
    createdAt,
    updatedAt,
    deletedAt,
    unit,
    category,
    laundryServiceProcessesCount,
    servicePackageItemsCount,
    averageRating,
    reviewsCount,
    supportsCourier,
    courierSupportLabel,
    courierSupportMessage,
  ]);

  /// Create a copy of LaundryServiceModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LaundryServiceModelImplCopyWith<_$LaundryServiceModelImpl> get copyWith =>
      __$$LaundryServiceModelImplCopyWithImpl<_$LaundryServiceModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$LaundryServiceModelImplToJson(this);
  }
}

abstract class _LaundryServiceModel extends LaundryServiceModel {
  const factory _LaundryServiceModel({
    required final int id,
    required final int categoryId,
    required final int unitId,
    required final String name,
    final String? description,
    required final double price,
    required final int durationHours,
    required final int minQuantity,
    required final String slug,
    required final bool isActive,
    final String? createdAt,
    final String? updatedAt,
    final String? deletedAt,
    final UnitModel? unit,
    final CategoryModel? category,
    final int laundryServiceProcessesCount,
    final int servicePackageItemsCount,
    final double? averageRating,
    final int? reviewsCount,
    final bool supportsCourier,
    final String? courierSupportLabel,
    final String? courierSupportMessage,
  }) = _$LaundryServiceModelImpl;
  const _LaundryServiceModel._() : super._();

  factory _LaundryServiceModel.fromJson(Map<String, dynamic> json) =
      _$LaundryServiceModelImpl.fromJson;

  @override
  int get id;
  @override
  int get categoryId;
  @override
  int get unitId;
  @override
  String get name;
  @override
  String? get description;
  @override
  double get price;
  @override
  int get durationHours;
  @override
  int get minQuantity;
  @override
  String get slug;
  @override
  bool get isActive;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;
  @override
  String? get deletedAt;
  @override
  UnitModel? get unit;
  @override
  CategoryModel? get category;
  @override
  int get laundryServiceProcessesCount;
  @override
  int get servicePackageItemsCount;
  @override
  double? get averageRating;
  @override
  int? get reviewsCount;
  @override
  bool get supportsCourier;
  @override
  String? get courierSupportLabel;
  @override
  String? get courierSupportMessage;

  /// Create a copy of LaundryServiceModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LaundryServiceModelImplCopyWith<_$LaundryServiceModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
