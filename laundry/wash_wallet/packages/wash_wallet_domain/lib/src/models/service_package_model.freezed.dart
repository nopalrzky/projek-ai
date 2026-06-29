// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'service_package_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ServicePackageModel _$ServicePackageModelFromJson(Map<String, dynamic> json) {
  return _ServicePackageModel.fromJson(json);
}

/// @nodoc
mixin _$ServicePackageModel {
  int get id => throw _privateConstructorUsedError;
  int? get outletId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  double get price => throw _privateConstructorUsedError;
  int? get validityDays => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;
  String? get deletedAt =>
      throw _privateConstructorUsedError; // Relational data
  OutletModel? get outlet => throw _privateConstructorUsedError;
  List<dynamic> get servicePackageItems => throw _privateConstructorUsedError;
  List<CustomerSubscriptionModel> get customerSubscriptions =>
      throw _privateConstructorUsedError;
  int get servicePackageItemsCount => throw _privateConstructorUsedError;
  int get customerSubscriptionsCount => throw _privateConstructorUsedError;

  /// Serializes this ServicePackageModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ServicePackageModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ServicePackageModelCopyWith<ServicePackageModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ServicePackageModelCopyWith<$Res> {
  factory $ServicePackageModelCopyWith(
    ServicePackageModel value,
    $Res Function(ServicePackageModel) then,
  ) = _$ServicePackageModelCopyWithImpl<$Res, ServicePackageModel>;
  @useResult
  $Res call({
    int id,
    int? outletId,
    String name,
    double price,
    int? validityDays,
    String? description,
    bool isActive,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    OutletModel? outlet,
    List<dynamic> servicePackageItems,
    List<CustomerSubscriptionModel> customerSubscriptions,
    int servicePackageItemsCount,
    int customerSubscriptionsCount,
  });

  $OutletModelCopyWith<$Res>? get outlet;
}

/// @nodoc
class _$ServicePackageModelCopyWithImpl<$Res, $Val extends ServicePackageModel>
    implements $ServicePackageModelCopyWith<$Res> {
  _$ServicePackageModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ServicePackageModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? outletId = freezed,
    Object? name = null,
    Object? price = null,
    Object? validityDays = freezed,
    Object? description = freezed,
    Object? isActive = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? outlet = freezed,
    Object? servicePackageItems = null,
    Object? customerSubscriptions = null,
    Object? servicePackageItemsCount = null,
    Object? customerSubscriptionsCount = null,
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
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            price: null == price
                ? _value.price
                : price // ignore: cast_nullable_to_non_nullable
                      as double,
            validityDays: freezed == validityDays
                ? _value.validityDays
                : validityDays // ignore: cast_nullable_to_non_nullable
                      as int?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
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
            outlet: freezed == outlet
                ? _value.outlet
                : outlet // ignore: cast_nullable_to_non_nullable
                      as OutletModel?,
            servicePackageItems: null == servicePackageItems
                ? _value.servicePackageItems
                : servicePackageItems // ignore: cast_nullable_to_non_nullable
                      as List<dynamic>,
            customerSubscriptions: null == customerSubscriptions
                ? _value.customerSubscriptions
                : customerSubscriptions // ignore: cast_nullable_to_non_nullable
                      as List<CustomerSubscriptionModel>,
            servicePackageItemsCount: null == servicePackageItemsCount
                ? _value.servicePackageItemsCount
                : servicePackageItemsCount // ignore: cast_nullable_to_non_nullable
                      as int,
            customerSubscriptionsCount: null == customerSubscriptionsCount
                ? _value.customerSubscriptionsCount
                : customerSubscriptionsCount // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }

  /// Create a copy of ServicePackageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $OutletModelCopyWith<$Res>? get outlet {
    if (_value.outlet == null) {
      return null;
    }

    return $OutletModelCopyWith<$Res>(_value.outlet!, (value) {
      return _then(_value.copyWith(outlet: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ServicePackageModelImplCopyWith<$Res>
    implements $ServicePackageModelCopyWith<$Res> {
  factory _$$ServicePackageModelImplCopyWith(
    _$ServicePackageModelImpl value,
    $Res Function(_$ServicePackageModelImpl) then,
  ) = __$$ServicePackageModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int? outletId,
    String name,
    double price,
    int? validityDays,
    String? description,
    bool isActive,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    OutletModel? outlet,
    List<dynamic> servicePackageItems,
    List<CustomerSubscriptionModel> customerSubscriptions,
    int servicePackageItemsCount,
    int customerSubscriptionsCount,
  });

  @override
  $OutletModelCopyWith<$Res>? get outlet;
}

/// @nodoc
class __$$ServicePackageModelImplCopyWithImpl<$Res>
    extends _$ServicePackageModelCopyWithImpl<$Res, _$ServicePackageModelImpl>
    implements _$$ServicePackageModelImplCopyWith<$Res> {
  __$$ServicePackageModelImplCopyWithImpl(
    _$ServicePackageModelImpl _value,
    $Res Function(_$ServicePackageModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ServicePackageModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? outletId = freezed,
    Object? name = null,
    Object? price = null,
    Object? validityDays = freezed,
    Object? description = freezed,
    Object? isActive = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? outlet = freezed,
    Object? servicePackageItems = null,
    Object? customerSubscriptions = null,
    Object? servicePackageItemsCount = null,
    Object? customerSubscriptionsCount = null,
  }) {
    return _then(
      _$ServicePackageModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        outletId: freezed == outletId
            ? _value.outletId
            : outletId // ignore: cast_nullable_to_non_nullable
                  as int?,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        price: null == price
            ? _value.price
            : price // ignore: cast_nullable_to_non_nullable
                  as double,
        validityDays: freezed == validityDays
            ? _value.validityDays
            : validityDays // ignore: cast_nullable_to_non_nullable
                  as int?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
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
        outlet: freezed == outlet
            ? _value.outlet
            : outlet // ignore: cast_nullable_to_non_nullable
                  as OutletModel?,
        servicePackageItems: null == servicePackageItems
            ? _value._servicePackageItems
            : servicePackageItems // ignore: cast_nullable_to_non_nullable
                  as List<dynamic>,
        customerSubscriptions: null == customerSubscriptions
            ? _value._customerSubscriptions
            : customerSubscriptions // ignore: cast_nullable_to_non_nullable
                  as List<CustomerSubscriptionModel>,
        servicePackageItemsCount: null == servicePackageItemsCount
            ? _value.servicePackageItemsCount
            : servicePackageItemsCount // ignore: cast_nullable_to_non_nullable
                  as int,
        customerSubscriptionsCount: null == customerSubscriptionsCount
            ? _value.customerSubscriptionsCount
            : customerSubscriptionsCount // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ServicePackageModelImpl extends _ServicePackageModel {
  const _$ServicePackageModelImpl({
    required this.id,
    this.outletId,
    required this.name,
    required this.price,
    this.validityDays,
    this.description,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.outlet,
    final List<dynamic> servicePackageItems = const [],
    final List<CustomerSubscriptionModel> customerSubscriptions = const [],
    this.servicePackageItemsCount = 0,
    this.customerSubscriptionsCount = 0,
  }) : _servicePackageItems = servicePackageItems,
       _customerSubscriptions = customerSubscriptions,
       super._();

  factory _$ServicePackageModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ServicePackageModelImplFromJson(json);

  @override
  final int id;
  @override
  final int? outletId;
  @override
  final String name;
  @override
  final double price;
  @override
  final int? validityDays;
  @override
  final String? description;
  @override
  @JsonKey()
  final bool isActive;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;
  @override
  final String? deletedAt;
  // Relational data
  @override
  final OutletModel? outlet;
  final List<dynamic> _servicePackageItems;
  @override
  @JsonKey()
  List<dynamic> get servicePackageItems {
    if (_servicePackageItems is EqualUnmodifiableListView)
      return _servicePackageItems;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_servicePackageItems);
  }

  final List<CustomerSubscriptionModel> _customerSubscriptions;
  @override
  @JsonKey()
  List<CustomerSubscriptionModel> get customerSubscriptions {
    if (_customerSubscriptions is EqualUnmodifiableListView)
      return _customerSubscriptions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_customerSubscriptions);
  }

  @override
  @JsonKey()
  final int servicePackageItemsCount;
  @override
  @JsonKey()
  final int customerSubscriptionsCount;

  @override
  String toString() {
    return 'ServicePackageModel(id: $id, outletId: $outletId, name: $name, price: $price, validityDays: $validityDays, description: $description, isActive: $isActive, createdAt: $createdAt, updatedAt: $updatedAt, deletedAt: $deletedAt, outlet: $outlet, servicePackageItems: $servicePackageItems, customerSubscriptions: $customerSubscriptions, servicePackageItemsCount: $servicePackageItemsCount, customerSubscriptionsCount: $customerSubscriptionsCount)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ServicePackageModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.outletId, outletId) ||
                other.outletId == outletId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.price, price) || other.price == price) &&
            (identical(other.validityDays, validityDays) ||
                other.validityDays == validityDays) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.deletedAt, deletedAt) ||
                other.deletedAt == deletedAt) &&
            (identical(other.outlet, outlet) || other.outlet == outlet) &&
            const DeepCollectionEquality().equals(
              other._servicePackageItems,
              _servicePackageItems,
            ) &&
            const DeepCollectionEquality().equals(
              other._customerSubscriptions,
              _customerSubscriptions,
            ) &&
            (identical(
                  other.servicePackageItemsCount,
                  servicePackageItemsCount,
                ) ||
                other.servicePackageItemsCount == servicePackageItemsCount) &&
            (identical(
                  other.customerSubscriptionsCount,
                  customerSubscriptionsCount,
                ) ||
                other.customerSubscriptionsCount ==
                    customerSubscriptionsCount));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    outletId,
    name,
    price,
    validityDays,
    description,
    isActive,
    createdAt,
    updatedAt,
    deletedAt,
    outlet,
    const DeepCollectionEquality().hash(_servicePackageItems),
    const DeepCollectionEquality().hash(_customerSubscriptions),
    servicePackageItemsCount,
    customerSubscriptionsCount,
  );

  /// Create a copy of ServicePackageModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ServicePackageModelImplCopyWith<_$ServicePackageModelImpl> get copyWith =>
      __$$ServicePackageModelImplCopyWithImpl<_$ServicePackageModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ServicePackageModelImplToJson(this);
  }
}

abstract class _ServicePackageModel extends ServicePackageModel {
  const factory _ServicePackageModel({
    required final int id,
    final int? outletId,
    required final String name,
    required final double price,
    final int? validityDays,
    final String? description,
    final bool isActive,
    final String? createdAt,
    final String? updatedAt,
    final String? deletedAt,
    final OutletModel? outlet,
    final List<dynamic> servicePackageItems,
    final List<CustomerSubscriptionModel> customerSubscriptions,
    final int servicePackageItemsCount,
    final int customerSubscriptionsCount,
  }) = _$ServicePackageModelImpl;
  const _ServicePackageModel._() : super._();

  factory _ServicePackageModel.fromJson(Map<String, dynamic> json) =
      _$ServicePackageModelImpl.fromJson;

  @override
  int get id;
  @override
  int? get outletId;
  @override
  String get name;
  @override
  double get price;
  @override
  int? get validityDays;
  @override
  String? get description;
  @override
  bool get isActive;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;
  @override
  String? get deletedAt; // Relational data
  @override
  OutletModel? get outlet;
  @override
  List<dynamic> get servicePackageItems;
  @override
  List<CustomerSubscriptionModel> get customerSubscriptions;
  @override
  int get servicePackageItemsCount;
  @override
  int get customerSubscriptionsCount;

  /// Create a copy of ServicePackageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ServicePackageModelImplCopyWith<_$ServicePackageModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
