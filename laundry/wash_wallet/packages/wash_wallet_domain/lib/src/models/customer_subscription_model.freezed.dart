// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'customer_subscription_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

CustomerSubscriptionModel _$CustomerSubscriptionModelFromJson(
  Map<String, dynamic> json,
) {
  return _CustomerSubscriptionModel.fromJson(json);
}

/// @nodoc
mixin _$CustomerSubscriptionModel {
  int get id => throw _privateConstructorUsedError;
  int get customerId => throw _privateConstructorUsedError;
  int get servicePackageId => throw _privateConstructorUsedError;
  String get subscriptionCode => throw _privateConstructorUsedError;
  double get pricePaid => throw _privateConstructorUsedError;
  DateTime? get purchaseDate => throw _privateConstructorUsedError;
  DateTime? get expiredAt => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  int? get remainingDays => throw _privateConstructorUsedError;
  bool get isUnlimited => throw _privateConstructorUsedError;
  String get statusBadgeVariant => throw _privateConstructorUsedError;
  String get statusLabel => throw _privateConstructorUsedError;
  CustomerModel? get customer => throw _privateConstructorUsedError;
  ServicePackageModel? get servicePackage => throw _privateConstructorUsedError;
  List<CustomerQuotaModel> get customerQuotas =>
      throw _privateConstructorUsedError;

  /// Serializes this CustomerSubscriptionModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CustomerSubscriptionModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CustomerSubscriptionModelCopyWith<CustomerSubscriptionModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CustomerSubscriptionModelCopyWith<$Res> {
  factory $CustomerSubscriptionModelCopyWith(
    CustomerSubscriptionModel value,
    $Res Function(CustomerSubscriptionModel) then,
  ) = _$CustomerSubscriptionModelCopyWithImpl<$Res, CustomerSubscriptionModel>;
  @useResult
  $Res call({
    int id,
    int customerId,
    int servicePackageId,
    String subscriptionCode,
    double pricePaid,
    DateTime? purchaseDate,
    DateTime? expiredAt,
    String status,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? remainingDays,
    bool isUnlimited,
    String statusBadgeVariant,
    String statusLabel,
    CustomerModel? customer,
    ServicePackageModel? servicePackage,
    List<CustomerQuotaModel> customerQuotas,
  });

  $CustomerModelCopyWith<$Res>? get customer;
  $ServicePackageModelCopyWith<$Res>? get servicePackage;
}

/// @nodoc
class _$CustomerSubscriptionModelCopyWithImpl<
  $Res,
  $Val extends CustomerSubscriptionModel
>
    implements $CustomerSubscriptionModelCopyWith<$Res> {
  _$CustomerSubscriptionModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CustomerSubscriptionModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? customerId = null,
    Object? servicePackageId = null,
    Object? subscriptionCode = null,
    Object? pricePaid = null,
    Object? purchaseDate = freezed,
    Object? expiredAt = freezed,
    Object? status = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? remainingDays = freezed,
    Object? isUnlimited = null,
    Object? statusBadgeVariant = null,
    Object? statusLabel = null,
    Object? customer = freezed,
    Object? servicePackage = freezed,
    Object? customerQuotas = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            customerId: null == customerId
                ? _value.customerId
                : customerId // ignore: cast_nullable_to_non_nullable
                      as int,
            servicePackageId: null == servicePackageId
                ? _value.servicePackageId
                : servicePackageId // ignore: cast_nullable_to_non_nullable
                      as int,
            subscriptionCode: null == subscriptionCode
                ? _value.subscriptionCode
                : subscriptionCode // ignore: cast_nullable_to_non_nullable
                      as String,
            pricePaid: null == pricePaid
                ? _value.pricePaid
                : pricePaid // ignore: cast_nullable_to_non_nullable
                      as double,
            purchaseDate: freezed == purchaseDate
                ? _value.purchaseDate
                : purchaseDate // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            expiredAt: freezed == expiredAt
                ? _value.expiredAt
                : expiredAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            remainingDays: freezed == remainingDays
                ? _value.remainingDays
                : remainingDays // ignore: cast_nullable_to_non_nullable
                      as int?,
            isUnlimited: null == isUnlimited
                ? _value.isUnlimited
                : isUnlimited // ignore: cast_nullable_to_non_nullable
                      as bool,
            statusBadgeVariant: null == statusBadgeVariant
                ? _value.statusBadgeVariant
                : statusBadgeVariant // ignore: cast_nullable_to_non_nullable
                      as String,
            statusLabel: null == statusLabel
                ? _value.statusLabel
                : statusLabel // ignore: cast_nullable_to_non_nullable
                      as String,
            customer: freezed == customer
                ? _value.customer
                : customer // ignore: cast_nullable_to_non_nullable
                      as CustomerModel?,
            servicePackage: freezed == servicePackage
                ? _value.servicePackage
                : servicePackage // ignore: cast_nullable_to_non_nullable
                      as ServicePackageModel?,
            customerQuotas: null == customerQuotas
                ? _value.customerQuotas
                : customerQuotas // ignore: cast_nullable_to_non_nullable
                      as List<CustomerQuotaModel>,
          )
          as $Val,
    );
  }

  /// Create a copy of CustomerSubscriptionModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $CustomerModelCopyWith<$Res>? get customer {
    if (_value.customer == null) {
      return null;
    }

    return $CustomerModelCopyWith<$Res>(_value.customer!, (value) {
      return _then(_value.copyWith(customer: value) as $Val);
    });
  }

  /// Create a copy of CustomerSubscriptionModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ServicePackageModelCopyWith<$Res>? get servicePackage {
    if (_value.servicePackage == null) {
      return null;
    }

    return $ServicePackageModelCopyWith<$Res>(_value.servicePackage!, (value) {
      return _then(_value.copyWith(servicePackage: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$CustomerSubscriptionModelImplCopyWith<$Res>
    implements $CustomerSubscriptionModelCopyWith<$Res> {
  factory _$$CustomerSubscriptionModelImplCopyWith(
    _$CustomerSubscriptionModelImpl value,
    $Res Function(_$CustomerSubscriptionModelImpl) then,
  ) = __$$CustomerSubscriptionModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int customerId,
    int servicePackageId,
    String subscriptionCode,
    double pricePaid,
    DateTime? purchaseDate,
    DateTime? expiredAt,
    String status,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? remainingDays,
    bool isUnlimited,
    String statusBadgeVariant,
    String statusLabel,
    CustomerModel? customer,
    ServicePackageModel? servicePackage,
    List<CustomerQuotaModel> customerQuotas,
  });

  @override
  $CustomerModelCopyWith<$Res>? get customer;
  @override
  $ServicePackageModelCopyWith<$Res>? get servicePackage;
}

/// @nodoc
class __$$CustomerSubscriptionModelImplCopyWithImpl<$Res>
    extends
        _$CustomerSubscriptionModelCopyWithImpl<
          $Res,
          _$CustomerSubscriptionModelImpl
        >
    implements _$$CustomerSubscriptionModelImplCopyWith<$Res> {
  __$$CustomerSubscriptionModelImplCopyWithImpl(
    _$CustomerSubscriptionModelImpl _value,
    $Res Function(_$CustomerSubscriptionModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CustomerSubscriptionModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? customerId = null,
    Object? servicePackageId = null,
    Object? subscriptionCode = null,
    Object? pricePaid = null,
    Object? purchaseDate = freezed,
    Object? expiredAt = freezed,
    Object? status = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? remainingDays = freezed,
    Object? isUnlimited = null,
    Object? statusBadgeVariant = null,
    Object? statusLabel = null,
    Object? customer = freezed,
    Object? servicePackage = freezed,
    Object? customerQuotas = null,
  }) {
    return _then(
      _$CustomerSubscriptionModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        customerId: null == customerId
            ? _value.customerId
            : customerId // ignore: cast_nullable_to_non_nullable
                  as int,
        servicePackageId: null == servicePackageId
            ? _value.servicePackageId
            : servicePackageId // ignore: cast_nullable_to_non_nullable
                  as int,
        subscriptionCode: null == subscriptionCode
            ? _value.subscriptionCode
            : subscriptionCode // ignore: cast_nullable_to_non_nullable
                  as String,
        pricePaid: null == pricePaid
            ? _value.pricePaid
            : pricePaid // ignore: cast_nullable_to_non_nullable
                  as double,
        purchaseDate: freezed == purchaseDate
            ? _value.purchaseDate
            : purchaseDate // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        expiredAt: freezed == expiredAt
            ? _value.expiredAt
            : expiredAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        remainingDays: freezed == remainingDays
            ? _value.remainingDays
            : remainingDays // ignore: cast_nullable_to_non_nullable
                  as int?,
        isUnlimited: null == isUnlimited
            ? _value.isUnlimited
            : isUnlimited // ignore: cast_nullable_to_non_nullable
                  as bool,
        statusBadgeVariant: null == statusBadgeVariant
            ? _value.statusBadgeVariant
            : statusBadgeVariant // ignore: cast_nullable_to_non_nullable
                  as String,
        statusLabel: null == statusLabel
            ? _value.statusLabel
            : statusLabel // ignore: cast_nullable_to_non_nullable
                  as String,
        customer: freezed == customer
            ? _value.customer
            : customer // ignore: cast_nullable_to_non_nullable
                  as CustomerModel?,
        servicePackage: freezed == servicePackage
            ? _value.servicePackage
            : servicePackage // ignore: cast_nullable_to_non_nullable
                  as ServicePackageModel?,
        customerQuotas: null == customerQuotas
            ? _value._customerQuotas
            : customerQuotas // ignore: cast_nullable_to_non_nullable
                  as List<CustomerQuotaModel>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CustomerSubscriptionModelImpl extends _CustomerSubscriptionModel {
  const _$CustomerSubscriptionModelImpl({
    required this.id,
    required this.customerId,
    required this.servicePackageId,
    required this.subscriptionCode,
    required this.pricePaid,
    this.purchaseDate,
    this.expiredAt,
    required this.status,
    this.createdAt,
    this.updatedAt,
    this.remainingDays,
    this.isUnlimited = false,
    this.statusBadgeVariant = 'secondary',
    this.statusLabel = '',
    this.customer,
    this.servicePackage,
    final List<CustomerQuotaModel> customerQuotas = const [],
  }) : _customerQuotas = customerQuotas,
       super._();

  factory _$CustomerSubscriptionModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CustomerSubscriptionModelImplFromJson(json);

  @override
  final int id;
  @override
  final int customerId;
  @override
  final int servicePackageId;
  @override
  final String subscriptionCode;
  @override
  final double pricePaid;
  @override
  final DateTime? purchaseDate;
  @override
  final DateTime? expiredAt;
  @override
  final String status;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;
  @override
  final int? remainingDays;
  @override
  @JsonKey()
  final bool isUnlimited;
  @override
  @JsonKey()
  final String statusBadgeVariant;
  @override
  @JsonKey()
  final String statusLabel;
  @override
  final CustomerModel? customer;
  @override
  final ServicePackageModel? servicePackage;
  final List<CustomerQuotaModel> _customerQuotas;
  @override
  @JsonKey()
  List<CustomerQuotaModel> get customerQuotas {
    if (_customerQuotas is EqualUnmodifiableListView) return _customerQuotas;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_customerQuotas);
  }

  @override
  String toString() {
    return 'CustomerSubscriptionModel(id: $id, customerId: $customerId, servicePackageId: $servicePackageId, subscriptionCode: $subscriptionCode, pricePaid: $pricePaid, purchaseDate: $purchaseDate, expiredAt: $expiredAt, status: $status, createdAt: $createdAt, updatedAt: $updatedAt, remainingDays: $remainingDays, isUnlimited: $isUnlimited, statusBadgeVariant: $statusBadgeVariant, statusLabel: $statusLabel, customer: $customer, servicePackage: $servicePackage, customerQuotas: $customerQuotas)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CustomerSubscriptionModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.customerId, customerId) ||
                other.customerId == customerId) &&
            (identical(other.servicePackageId, servicePackageId) ||
                other.servicePackageId == servicePackageId) &&
            (identical(other.subscriptionCode, subscriptionCode) ||
                other.subscriptionCode == subscriptionCode) &&
            (identical(other.pricePaid, pricePaid) ||
                other.pricePaid == pricePaid) &&
            (identical(other.purchaseDate, purchaseDate) ||
                other.purchaseDate == purchaseDate) &&
            (identical(other.expiredAt, expiredAt) ||
                other.expiredAt == expiredAt) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.remainingDays, remainingDays) ||
                other.remainingDays == remainingDays) &&
            (identical(other.isUnlimited, isUnlimited) ||
                other.isUnlimited == isUnlimited) &&
            (identical(other.statusBadgeVariant, statusBadgeVariant) ||
                other.statusBadgeVariant == statusBadgeVariant) &&
            (identical(other.statusLabel, statusLabel) ||
                other.statusLabel == statusLabel) &&
            (identical(other.customer, customer) ||
                other.customer == customer) &&
            (identical(other.servicePackage, servicePackage) ||
                other.servicePackage == servicePackage) &&
            const DeepCollectionEquality().equals(
              other._customerQuotas,
              _customerQuotas,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    customerId,
    servicePackageId,
    subscriptionCode,
    pricePaid,
    purchaseDate,
    expiredAt,
    status,
    createdAt,
    updatedAt,
    remainingDays,
    isUnlimited,
    statusBadgeVariant,
    statusLabel,
    customer,
    servicePackage,
    const DeepCollectionEquality().hash(_customerQuotas),
  );

  /// Create a copy of CustomerSubscriptionModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CustomerSubscriptionModelImplCopyWith<_$CustomerSubscriptionModelImpl>
  get copyWith =>
      __$$CustomerSubscriptionModelImplCopyWithImpl<
        _$CustomerSubscriptionModelImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CustomerSubscriptionModelImplToJson(this);
  }
}

abstract class _CustomerSubscriptionModel extends CustomerSubscriptionModel {
  const factory _CustomerSubscriptionModel({
    required final int id,
    required final int customerId,
    required final int servicePackageId,
    required final String subscriptionCode,
    required final double pricePaid,
    final DateTime? purchaseDate,
    final DateTime? expiredAt,
    required final String status,
    final DateTime? createdAt,
    final DateTime? updatedAt,
    final int? remainingDays,
    final bool isUnlimited,
    final String statusBadgeVariant,
    final String statusLabel,
    final CustomerModel? customer,
    final ServicePackageModel? servicePackage,
    final List<CustomerQuotaModel> customerQuotas,
  }) = _$CustomerSubscriptionModelImpl;
  const _CustomerSubscriptionModel._() : super._();

  factory _CustomerSubscriptionModel.fromJson(Map<String, dynamic> json) =
      _$CustomerSubscriptionModelImpl.fromJson;

  @override
  int get id;
  @override
  int get customerId;
  @override
  int get servicePackageId;
  @override
  String get subscriptionCode;
  @override
  double get pricePaid;
  @override
  DateTime? get purchaseDate;
  @override
  DateTime? get expiredAt;
  @override
  String get status;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;
  @override
  int? get remainingDays;
  @override
  bool get isUnlimited;
  @override
  String get statusBadgeVariant;
  @override
  String get statusLabel;
  @override
  CustomerModel? get customer;
  @override
  ServicePackageModel? get servicePackage;
  @override
  List<CustomerQuotaModel> get customerQuotas;

  /// Create a copy of CustomerSubscriptionModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CustomerSubscriptionModelImplCopyWith<_$CustomerSubscriptionModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
