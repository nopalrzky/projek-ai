// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'outlet_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

OutletModel _$OutletModelFromJson(Map<String, dynamic> json) {
  return _OutletModel.fromJson(json);
}

/// @nodoc
mixin _$OutletModel {
  int get id => throw _privateConstructorUsedError;
  int? get ownerId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get code => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  int get coinBalance => throw _privateConstructorUsedError;
  int? get provinceId => throw _privateConstructorUsedError;
  String? get provinceName => throw _privateConstructorUsedError;
  int? get cityId => throw _privateConstructorUsedError;
  String? get cityName => throw _privateConstructorUsedError;
  int? get districtId => throw _privateConstructorUsedError;
  String? get districtName => throw _privateConstructorUsedError;
  int? get villageId => throw _privateConstructorUsedError;
  String? get villageName => throw _privateConstructorUsedError;
  String? get street => throw _privateConstructorUsedError;
  String? get fullAddress => throw _privateConstructorUsedError;
  String? get statusLabel => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;
  String? get deletedAt => throw _privateConstructorUsedError;
  int? get categoriesCount => throw _privateConstructorUsedError;
  int? get customersCount => throw _privateConstructorUsedError;
  int? get employeesCount => throw _privateConstructorUsedError;
  int? get finesCount => throw _privateConstructorUsedError;
  int? get laundryServicesCount => throw _privateConstructorUsedError;
  int? get operationalDaysCount => throw _privateConstructorUsedError;
  int? get membershipPlansCount => throw _privateConstructorUsedError;
  int? get positionsCount => throw _privateConstructorUsedError;
  int? get ordersCount => throw _privateConstructorUsedError;
  int? get expensesCount => throw _privateConstructorUsedError;
  int? get journalEntriesCount => throw _privateConstructorUsedError;
  int? get servicePackagesCount => throw _privateConstructorUsedError;
  double? get latitude => throw _privateConstructorUsedError;
  double? get longitude => throw _privateConstructorUsedError;
  double? get distance => throw _privateConstructorUsedError;
  bool get hasExposure => throw _privateConstructorUsedError;
  bool get isActivated => throw _privateConstructorUsedError;
  bool get hasActiveExposure => throw _privateConstructorUsedError;
  bool get isExposureExpired => throw _privateConstructorUsedError;
  bool get isCurrentlyOpen => throw _privateConstructorUsedError;
  bool get isCourierEnabled => throw _privateConstructorUsedError;
  bool get hasFreeShipping => throw _privateConstructorUsedError;
  bool get hasUnconditionalFreeShipping => throw _privateConstructorUsedError;
  OutletOperationalStatusModel? get operationalStatus =>
      throw _privateConstructorUsedError;
  Map<String, dynamic>? get todaySchedule => throw _privateConstructorUsedError;
  Map<String, dynamic>? get nextOpenDay => throw _privateConstructorUsedError;
  double? get averageRating => throw _privateConstructorUsedError;
  int? get reviewsCount => throw _privateConstructorUsedError;
  List<CategoryModel>? get categories => throw _privateConstructorUsedError;
  List<OperationalDayModel>? get operationalDays =>
      throw _privateConstructorUsedError;

  /// Serializes this OutletModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of OutletModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $OutletModelCopyWith<OutletModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $OutletModelCopyWith<$Res> {
  factory $OutletModelCopyWith(
    OutletModel value,
    $Res Function(OutletModel) then,
  ) = _$OutletModelCopyWithImpl<$Res, OutletModel>;
  @useResult
  $Res call({
    int id,
    int? ownerId,
    String name,
    String? code,
    String? phone,
    String? email,
    String? description,
    bool isActive,
    int coinBalance,
    int? provinceId,
    String? provinceName,
    int? cityId,
    String? cityName,
    int? districtId,
    String? districtName,
    int? villageId,
    String? villageName,
    String? street,
    String? fullAddress,
    String? statusLabel,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    int? categoriesCount,
    int? customersCount,
    int? employeesCount,
    int? finesCount,
    int? laundryServicesCount,
    int? operationalDaysCount,
    int? membershipPlansCount,
    int? positionsCount,
    int? ordersCount,
    int? expensesCount,
    int? journalEntriesCount,
    int? servicePackagesCount,
    double? latitude,
    double? longitude,
    double? distance,
    bool hasExposure,
    bool isActivated,
    bool hasActiveExposure,
    bool isExposureExpired,
    bool isCurrentlyOpen,
    bool isCourierEnabled,
    bool hasFreeShipping,
    bool hasUnconditionalFreeShipping,
    OutletOperationalStatusModel? operationalStatus,
    Map<String, dynamic>? todaySchedule,
    Map<String, dynamic>? nextOpenDay,
    double? averageRating,
    int? reviewsCount,
    List<CategoryModel>? categories,
    List<OperationalDayModel>? operationalDays,
  });

  $OutletOperationalStatusModelCopyWith<$Res>? get operationalStatus;
}

/// @nodoc
class _$OutletModelCopyWithImpl<$Res, $Val extends OutletModel>
    implements $OutletModelCopyWith<$Res> {
  _$OutletModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of OutletModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerId = freezed,
    Object? name = null,
    Object? code = freezed,
    Object? phone = freezed,
    Object? email = freezed,
    Object? description = freezed,
    Object? isActive = null,
    Object? coinBalance = null,
    Object? provinceId = freezed,
    Object? provinceName = freezed,
    Object? cityId = freezed,
    Object? cityName = freezed,
    Object? districtId = freezed,
    Object? districtName = freezed,
    Object? villageId = freezed,
    Object? villageName = freezed,
    Object? street = freezed,
    Object? fullAddress = freezed,
    Object? statusLabel = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? categoriesCount = freezed,
    Object? customersCount = freezed,
    Object? employeesCount = freezed,
    Object? finesCount = freezed,
    Object? laundryServicesCount = freezed,
    Object? operationalDaysCount = freezed,
    Object? membershipPlansCount = freezed,
    Object? positionsCount = freezed,
    Object? ordersCount = freezed,
    Object? expensesCount = freezed,
    Object? journalEntriesCount = freezed,
    Object? servicePackagesCount = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
    Object? distance = freezed,
    Object? hasExposure = null,
    Object? isActivated = null,
    Object? hasActiveExposure = null,
    Object? isExposureExpired = null,
    Object? isCurrentlyOpen = null,
    Object? isCourierEnabled = null,
    Object? hasFreeShipping = null,
    Object? hasUnconditionalFreeShipping = null,
    Object? operationalStatus = freezed,
    Object? todaySchedule = freezed,
    Object? nextOpenDay = freezed,
    Object? averageRating = freezed,
    Object? reviewsCount = freezed,
    Object? categories = freezed,
    Object? operationalDays = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as int,
            ownerId: freezed == ownerId
                ? _value.ownerId
                : ownerId // ignore: cast_nullable_to_non_nullable
                      as int?,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            code: freezed == code
                ? _value.code
                : code // ignore: cast_nullable_to_non_nullable
                      as String?,
            phone: freezed == phone
                ? _value.phone
                : phone // ignore: cast_nullable_to_non_nullable
                      as String?,
            email: freezed == email
                ? _value.email
                : email // ignore: cast_nullable_to_non_nullable
                      as String?,
            description: freezed == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String?,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            coinBalance: null == coinBalance
                ? _value.coinBalance
                : coinBalance // ignore: cast_nullable_to_non_nullable
                      as int,
            provinceId: freezed == provinceId
                ? _value.provinceId
                : provinceId // ignore: cast_nullable_to_non_nullable
                      as int?,
            provinceName: freezed == provinceName
                ? _value.provinceName
                : provinceName // ignore: cast_nullable_to_non_nullable
                      as String?,
            cityId: freezed == cityId
                ? _value.cityId
                : cityId // ignore: cast_nullable_to_non_nullable
                      as int?,
            cityName: freezed == cityName
                ? _value.cityName
                : cityName // ignore: cast_nullable_to_non_nullable
                      as String?,
            districtId: freezed == districtId
                ? _value.districtId
                : districtId // ignore: cast_nullable_to_non_nullable
                      as int?,
            districtName: freezed == districtName
                ? _value.districtName
                : districtName // ignore: cast_nullable_to_non_nullable
                      as String?,
            villageId: freezed == villageId
                ? _value.villageId
                : villageId // ignore: cast_nullable_to_non_nullable
                      as int?,
            villageName: freezed == villageName
                ? _value.villageName
                : villageName // ignore: cast_nullable_to_non_nullable
                      as String?,
            street: freezed == street
                ? _value.street
                : street // ignore: cast_nullable_to_non_nullable
                      as String?,
            fullAddress: freezed == fullAddress
                ? _value.fullAddress
                : fullAddress // ignore: cast_nullable_to_non_nullable
                      as String?,
            statusLabel: freezed == statusLabel
                ? _value.statusLabel
                : statusLabel // ignore: cast_nullable_to_non_nullable
                      as String?,
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
            categoriesCount: freezed == categoriesCount
                ? _value.categoriesCount
                : categoriesCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            customersCount: freezed == customersCount
                ? _value.customersCount
                : customersCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            employeesCount: freezed == employeesCount
                ? _value.employeesCount
                : employeesCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            finesCount: freezed == finesCount
                ? _value.finesCount
                : finesCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            laundryServicesCount: freezed == laundryServicesCount
                ? _value.laundryServicesCount
                : laundryServicesCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            operationalDaysCount: freezed == operationalDaysCount
                ? _value.operationalDaysCount
                : operationalDaysCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            membershipPlansCount: freezed == membershipPlansCount
                ? _value.membershipPlansCount
                : membershipPlansCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            positionsCount: freezed == positionsCount
                ? _value.positionsCount
                : positionsCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            ordersCount: freezed == ordersCount
                ? _value.ordersCount
                : ordersCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            expensesCount: freezed == expensesCount
                ? _value.expensesCount
                : expensesCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            journalEntriesCount: freezed == journalEntriesCount
                ? _value.journalEntriesCount
                : journalEntriesCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            servicePackagesCount: freezed == servicePackagesCount
                ? _value.servicePackagesCount
                : servicePackagesCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            latitude: freezed == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            longitude: freezed == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            distance: freezed == distance
                ? _value.distance
                : distance // ignore: cast_nullable_to_non_nullable
                      as double?,
            hasExposure: null == hasExposure
                ? _value.hasExposure
                : hasExposure // ignore: cast_nullable_to_non_nullable
                      as bool,
            isActivated: null == isActivated
                ? _value.isActivated
                : isActivated // ignore: cast_nullable_to_non_nullable
                      as bool,
            hasActiveExposure: null == hasActiveExposure
                ? _value.hasActiveExposure
                : hasActiveExposure // ignore: cast_nullable_to_non_nullable
                      as bool,
            isExposureExpired: null == isExposureExpired
                ? _value.isExposureExpired
                : isExposureExpired // ignore: cast_nullable_to_non_nullable
                      as bool,
            isCurrentlyOpen: null == isCurrentlyOpen
                ? _value.isCurrentlyOpen
                : isCurrentlyOpen // ignore: cast_nullable_to_non_nullable
                      as bool,
            isCourierEnabled: null == isCourierEnabled
                ? _value.isCourierEnabled
                : isCourierEnabled // ignore: cast_nullable_to_non_nullable
                      as bool,
            hasFreeShipping: null == hasFreeShipping
                ? _value.hasFreeShipping
                : hasFreeShipping // ignore: cast_nullable_to_non_nullable
                      as bool,
            hasUnconditionalFreeShipping: null == hasUnconditionalFreeShipping
                ? _value.hasUnconditionalFreeShipping
                : hasUnconditionalFreeShipping // ignore: cast_nullable_to_non_nullable
                      as bool,
            operationalStatus: freezed == operationalStatus
                ? _value.operationalStatus
                : operationalStatus // ignore: cast_nullable_to_non_nullable
                      as OutletOperationalStatusModel?,
            todaySchedule: freezed == todaySchedule
                ? _value.todaySchedule
                : todaySchedule // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            nextOpenDay: freezed == nextOpenDay
                ? _value.nextOpenDay
                : nextOpenDay // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            averageRating: freezed == averageRating
                ? _value.averageRating
                : averageRating // ignore: cast_nullable_to_non_nullable
                      as double?,
            reviewsCount: freezed == reviewsCount
                ? _value.reviewsCount
                : reviewsCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            categories: freezed == categories
                ? _value.categories
                : categories // ignore: cast_nullable_to_non_nullable
                      as List<CategoryModel>?,
            operationalDays: freezed == operationalDays
                ? _value.operationalDays
                : operationalDays // ignore: cast_nullable_to_non_nullable
                      as List<OperationalDayModel>?,
          )
          as $Val,
    );
  }

  /// Create a copy of OutletModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $OutletOperationalStatusModelCopyWith<$Res>? get operationalStatus {
    if (_value.operationalStatus == null) {
      return null;
    }

    return $OutletOperationalStatusModelCopyWith<$Res>(
      _value.operationalStatus!,
      (value) {
        return _then(_value.copyWith(operationalStatus: value) as $Val);
      },
    );
  }
}

/// @nodoc
abstract class _$$OutletModelImplCopyWith<$Res>
    implements $OutletModelCopyWith<$Res> {
  factory _$$OutletModelImplCopyWith(
    _$OutletModelImpl value,
    $Res Function(_$OutletModelImpl) then,
  ) = __$$OutletModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int id,
    int? ownerId,
    String name,
    String? code,
    String? phone,
    String? email,
    String? description,
    bool isActive,
    int coinBalance,
    int? provinceId,
    String? provinceName,
    int? cityId,
    String? cityName,
    int? districtId,
    String? districtName,
    int? villageId,
    String? villageName,
    String? street,
    String? fullAddress,
    String? statusLabel,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    int? categoriesCount,
    int? customersCount,
    int? employeesCount,
    int? finesCount,
    int? laundryServicesCount,
    int? operationalDaysCount,
    int? membershipPlansCount,
    int? positionsCount,
    int? ordersCount,
    int? expensesCount,
    int? journalEntriesCount,
    int? servicePackagesCount,
    double? latitude,
    double? longitude,
    double? distance,
    bool hasExposure,
    bool isActivated,
    bool hasActiveExposure,
    bool isExposureExpired,
    bool isCurrentlyOpen,
    bool isCourierEnabled,
    bool hasFreeShipping,
    bool hasUnconditionalFreeShipping,
    OutletOperationalStatusModel? operationalStatus,
    Map<String, dynamic>? todaySchedule,
    Map<String, dynamic>? nextOpenDay,
    double? averageRating,
    int? reviewsCount,
    List<CategoryModel>? categories,
    List<OperationalDayModel>? operationalDays,
  });

  @override
  $OutletOperationalStatusModelCopyWith<$Res>? get operationalStatus;
}

/// @nodoc
class __$$OutletModelImplCopyWithImpl<$Res>
    extends _$OutletModelCopyWithImpl<$Res, _$OutletModelImpl>
    implements _$$OutletModelImplCopyWith<$Res> {
  __$$OutletModelImplCopyWithImpl(
    _$OutletModelImpl _value,
    $Res Function(_$OutletModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of OutletModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerId = freezed,
    Object? name = null,
    Object? code = freezed,
    Object? phone = freezed,
    Object? email = freezed,
    Object? description = freezed,
    Object? isActive = null,
    Object? coinBalance = null,
    Object? provinceId = freezed,
    Object? provinceName = freezed,
    Object? cityId = freezed,
    Object? cityName = freezed,
    Object? districtId = freezed,
    Object? districtName = freezed,
    Object? villageId = freezed,
    Object? villageName = freezed,
    Object? street = freezed,
    Object? fullAddress = freezed,
    Object? statusLabel = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? deletedAt = freezed,
    Object? categoriesCount = freezed,
    Object? customersCount = freezed,
    Object? employeesCount = freezed,
    Object? finesCount = freezed,
    Object? laundryServicesCount = freezed,
    Object? operationalDaysCount = freezed,
    Object? membershipPlansCount = freezed,
    Object? positionsCount = freezed,
    Object? ordersCount = freezed,
    Object? expensesCount = freezed,
    Object? journalEntriesCount = freezed,
    Object? servicePackagesCount = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
    Object? distance = freezed,
    Object? hasExposure = null,
    Object? isActivated = null,
    Object? hasActiveExposure = null,
    Object? isExposureExpired = null,
    Object? isCurrentlyOpen = null,
    Object? isCourierEnabled = null,
    Object? hasFreeShipping = null,
    Object? hasUnconditionalFreeShipping = null,
    Object? operationalStatus = freezed,
    Object? todaySchedule = freezed,
    Object? nextOpenDay = freezed,
    Object? averageRating = freezed,
    Object? reviewsCount = freezed,
    Object? categories = freezed,
    Object? operationalDays = freezed,
  }) {
    return _then(
      _$OutletModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as int,
        ownerId: freezed == ownerId
            ? _value.ownerId
            : ownerId // ignore: cast_nullable_to_non_nullable
                  as int?,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        code: freezed == code
            ? _value.code
            : code // ignore: cast_nullable_to_non_nullable
                  as String?,
        phone: freezed == phone
            ? _value.phone
            : phone // ignore: cast_nullable_to_non_nullable
                  as String?,
        email: freezed == email
            ? _value.email
            : email // ignore: cast_nullable_to_non_nullable
                  as String?,
        description: freezed == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String?,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        coinBalance: null == coinBalance
            ? _value.coinBalance
            : coinBalance // ignore: cast_nullable_to_non_nullable
                  as int,
        provinceId: freezed == provinceId
            ? _value.provinceId
            : provinceId // ignore: cast_nullable_to_non_nullable
                  as int?,
        provinceName: freezed == provinceName
            ? _value.provinceName
            : provinceName // ignore: cast_nullable_to_non_nullable
                  as String?,
        cityId: freezed == cityId
            ? _value.cityId
            : cityId // ignore: cast_nullable_to_non_nullable
                  as int?,
        cityName: freezed == cityName
            ? _value.cityName
            : cityName // ignore: cast_nullable_to_non_nullable
                  as String?,
        districtId: freezed == districtId
            ? _value.districtId
            : districtId // ignore: cast_nullable_to_non_nullable
                  as int?,
        districtName: freezed == districtName
            ? _value.districtName
            : districtName // ignore: cast_nullable_to_non_nullable
                  as String?,
        villageId: freezed == villageId
            ? _value.villageId
            : villageId // ignore: cast_nullable_to_non_nullable
                  as int?,
        villageName: freezed == villageName
            ? _value.villageName
            : villageName // ignore: cast_nullable_to_non_nullable
                  as String?,
        street: freezed == street
            ? _value.street
            : street // ignore: cast_nullable_to_non_nullable
                  as String?,
        fullAddress: freezed == fullAddress
            ? _value.fullAddress
            : fullAddress // ignore: cast_nullable_to_non_nullable
                  as String?,
        statusLabel: freezed == statusLabel
            ? _value.statusLabel
            : statusLabel // ignore: cast_nullable_to_non_nullable
                  as String?,
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
        categoriesCount: freezed == categoriesCount
            ? _value.categoriesCount
            : categoriesCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        customersCount: freezed == customersCount
            ? _value.customersCount
            : customersCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        employeesCount: freezed == employeesCount
            ? _value.employeesCount
            : employeesCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        finesCount: freezed == finesCount
            ? _value.finesCount
            : finesCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        laundryServicesCount: freezed == laundryServicesCount
            ? _value.laundryServicesCount
            : laundryServicesCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        operationalDaysCount: freezed == operationalDaysCount
            ? _value.operationalDaysCount
            : operationalDaysCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        membershipPlansCount: freezed == membershipPlansCount
            ? _value.membershipPlansCount
            : membershipPlansCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        positionsCount: freezed == positionsCount
            ? _value.positionsCount
            : positionsCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        ordersCount: freezed == ordersCount
            ? _value.ordersCount
            : ordersCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        expensesCount: freezed == expensesCount
            ? _value.expensesCount
            : expensesCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        journalEntriesCount: freezed == journalEntriesCount
            ? _value.journalEntriesCount
            : journalEntriesCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        servicePackagesCount: freezed == servicePackagesCount
            ? _value.servicePackagesCount
            : servicePackagesCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        latitude: freezed == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        longitude: freezed == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        distance: freezed == distance
            ? _value.distance
            : distance // ignore: cast_nullable_to_non_nullable
                  as double?,
        hasExposure: null == hasExposure
            ? _value.hasExposure
            : hasExposure // ignore: cast_nullable_to_non_nullable
                  as bool,
        isActivated: null == isActivated
            ? _value.isActivated
            : isActivated // ignore: cast_nullable_to_non_nullable
                  as bool,
        hasActiveExposure: null == hasActiveExposure
            ? _value.hasActiveExposure
            : hasActiveExposure // ignore: cast_nullable_to_non_nullable
                  as bool,
        isExposureExpired: null == isExposureExpired
            ? _value.isExposureExpired
            : isExposureExpired // ignore: cast_nullable_to_non_nullable
                  as bool,
        isCurrentlyOpen: null == isCurrentlyOpen
            ? _value.isCurrentlyOpen
            : isCurrentlyOpen // ignore: cast_nullable_to_non_nullable
                  as bool,
        isCourierEnabled: null == isCourierEnabled
            ? _value.isCourierEnabled
            : isCourierEnabled // ignore: cast_nullable_to_non_nullable
                  as bool,
        hasFreeShipping: null == hasFreeShipping
            ? _value.hasFreeShipping
            : hasFreeShipping // ignore: cast_nullable_to_non_nullable
                  as bool,
        hasUnconditionalFreeShipping: null == hasUnconditionalFreeShipping
            ? _value.hasUnconditionalFreeShipping
            : hasUnconditionalFreeShipping // ignore: cast_nullable_to_non_nullable
                  as bool,
        operationalStatus: freezed == operationalStatus
            ? _value.operationalStatus
            : operationalStatus // ignore: cast_nullable_to_non_nullable
                  as OutletOperationalStatusModel?,
        todaySchedule: freezed == todaySchedule
            ? _value._todaySchedule
            : todaySchedule // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        nextOpenDay: freezed == nextOpenDay
            ? _value._nextOpenDay
            : nextOpenDay // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        averageRating: freezed == averageRating
            ? _value.averageRating
            : averageRating // ignore: cast_nullable_to_non_nullable
                  as double?,
        reviewsCount: freezed == reviewsCount
            ? _value.reviewsCount
            : reviewsCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        categories: freezed == categories
            ? _value._categories
            : categories // ignore: cast_nullable_to_non_nullable
                  as List<CategoryModel>?,
        operationalDays: freezed == operationalDays
            ? _value._operationalDays
            : operationalDays // ignore: cast_nullable_to_non_nullable
                  as List<OperationalDayModel>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$OutletModelImpl extends _OutletModel {
  const _$OutletModelImpl({
    required this.id,
    this.ownerId,
    required this.name,
    this.code,
    this.phone,
    this.email,
    this.description,
    required this.isActive,
    this.coinBalance = 0,
    this.provinceId,
    this.provinceName,
    this.cityId,
    this.cityName,
    this.districtId,
    this.districtName,
    this.villageId,
    this.villageName,
    this.street,
    this.fullAddress,
    this.statusLabel,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.categoriesCount,
    this.customersCount,
    this.employeesCount,
    this.finesCount,
    this.laundryServicesCount,
    this.operationalDaysCount,
    this.membershipPlansCount,
    this.positionsCount,
    this.ordersCount,
    this.expensesCount,
    this.journalEntriesCount,
    this.servicePackagesCount,
    this.latitude,
    this.longitude,
    this.distance,
    this.hasExposure = false,
    this.isActivated = false,
    this.hasActiveExposure = false,
    this.isExposureExpired = false,
    this.isCurrentlyOpen = false,
    this.isCourierEnabled = true,
    this.hasFreeShipping = false,
    this.hasUnconditionalFreeShipping = false,
    this.operationalStatus,
    final Map<String, dynamic>? todaySchedule,
    final Map<String, dynamic>? nextOpenDay,
    this.averageRating,
    this.reviewsCount,
    final List<CategoryModel>? categories,
    final List<OperationalDayModel>? operationalDays,
  }) : _todaySchedule = todaySchedule,
       _nextOpenDay = nextOpenDay,
       _categories = categories,
       _operationalDays = operationalDays,
       super._();

  factory _$OutletModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$OutletModelImplFromJson(json);

  @override
  final int id;
  @override
  final int? ownerId;
  @override
  final String name;
  @override
  final String? code;
  @override
  final String? phone;
  @override
  final String? email;
  @override
  final String? description;
  @override
  final bool isActive;
  @override
  @JsonKey()
  final int coinBalance;
  @override
  final int? provinceId;
  @override
  final String? provinceName;
  @override
  final int? cityId;
  @override
  final String? cityName;
  @override
  final int? districtId;
  @override
  final String? districtName;
  @override
  final int? villageId;
  @override
  final String? villageName;
  @override
  final String? street;
  @override
  final String? fullAddress;
  @override
  final String? statusLabel;
  @override
  final String? createdAt;
  @override
  final String? updatedAt;
  @override
  final String? deletedAt;
  @override
  final int? categoriesCount;
  @override
  final int? customersCount;
  @override
  final int? employeesCount;
  @override
  final int? finesCount;
  @override
  final int? laundryServicesCount;
  @override
  final int? operationalDaysCount;
  @override
  final int? membershipPlansCount;
  @override
  final int? positionsCount;
  @override
  final int? ordersCount;
  @override
  final int? expensesCount;
  @override
  final int? journalEntriesCount;
  @override
  final int? servicePackagesCount;
  @override
  final double? latitude;
  @override
  final double? longitude;
  @override
  final double? distance;
  @override
  @JsonKey()
  final bool hasExposure;
  @override
  @JsonKey()
  final bool isActivated;
  @override
  @JsonKey()
  final bool hasActiveExposure;
  @override
  @JsonKey()
  final bool isExposureExpired;
  @override
  @JsonKey()
  final bool isCurrentlyOpen;
  @override
  @JsonKey()
  final bool isCourierEnabled;
  @override
  @JsonKey()
  final bool hasFreeShipping;
  @override
  @JsonKey()
  final bool hasUnconditionalFreeShipping;
  @override
  final OutletOperationalStatusModel? operationalStatus;
  final Map<String, dynamic>? _todaySchedule;
  @override
  Map<String, dynamic>? get todaySchedule {
    final value = _todaySchedule;
    if (value == null) return null;
    if (_todaySchedule is EqualUnmodifiableMapView) return _todaySchedule;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _nextOpenDay;
  @override
  Map<String, dynamic>? get nextOpenDay {
    final value = _nextOpenDay;
    if (value == null) return null;
    if (_nextOpenDay is EqualUnmodifiableMapView) return _nextOpenDay;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final double? averageRating;
  @override
  final int? reviewsCount;
  final List<CategoryModel>? _categories;
  @override
  List<CategoryModel>? get categories {
    final value = _categories;
    if (value == null) return null;
    if (_categories is EqualUnmodifiableListView) return _categories;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final List<OperationalDayModel>? _operationalDays;
  @override
  List<OperationalDayModel>? get operationalDays {
    final value = _operationalDays;
    if (value == null) return null;
    if (_operationalDays is EqualUnmodifiableListView) return _operationalDays;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'OutletModel(id: $id, ownerId: $ownerId, name: $name, code: $code, phone: $phone, email: $email, description: $description, isActive: $isActive, coinBalance: $coinBalance, provinceId: $provinceId, provinceName: $provinceName, cityId: $cityId, cityName: $cityName, districtId: $districtId, districtName: $districtName, villageId: $villageId, villageName: $villageName, street: $street, fullAddress: $fullAddress, statusLabel: $statusLabel, createdAt: $createdAt, updatedAt: $updatedAt, deletedAt: $deletedAt, categoriesCount: $categoriesCount, customersCount: $customersCount, employeesCount: $employeesCount, finesCount: $finesCount, laundryServicesCount: $laundryServicesCount, operationalDaysCount: $operationalDaysCount, membershipPlansCount: $membershipPlansCount, positionsCount: $positionsCount, ordersCount: $ordersCount, expensesCount: $expensesCount, journalEntriesCount: $journalEntriesCount, servicePackagesCount: $servicePackagesCount, latitude: $latitude, longitude: $longitude, distance: $distance, hasExposure: $hasExposure, isActivated: $isActivated, hasActiveExposure: $hasActiveExposure, isExposureExpired: $isExposureExpired, isCurrentlyOpen: $isCurrentlyOpen, isCourierEnabled: $isCourierEnabled, hasFreeShipping: $hasFreeShipping, hasUnconditionalFreeShipping: $hasUnconditionalFreeShipping, operationalStatus: $operationalStatus, todaySchedule: $todaySchedule, nextOpenDay: $nextOpenDay, averageRating: $averageRating, reviewsCount: $reviewsCount, categories: $categories, operationalDays: $operationalDays)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$OutletModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.ownerId, ownerId) || other.ownerId == ownerId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.coinBalance, coinBalance) ||
                other.coinBalance == coinBalance) &&
            (identical(other.provinceId, provinceId) ||
                other.provinceId == provinceId) &&
            (identical(other.provinceName, provinceName) ||
                other.provinceName == provinceName) &&
            (identical(other.cityId, cityId) || other.cityId == cityId) &&
            (identical(other.cityName, cityName) ||
                other.cityName == cityName) &&
            (identical(other.districtId, districtId) ||
                other.districtId == districtId) &&
            (identical(other.districtName, districtName) ||
                other.districtName == districtName) &&
            (identical(other.villageId, villageId) ||
                other.villageId == villageId) &&
            (identical(other.villageName, villageName) ||
                other.villageName == villageName) &&
            (identical(other.street, street) || other.street == street) &&
            (identical(other.fullAddress, fullAddress) ||
                other.fullAddress == fullAddress) &&
            (identical(other.statusLabel, statusLabel) ||
                other.statusLabel == statusLabel) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.deletedAt, deletedAt) ||
                other.deletedAt == deletedAt) &&
            (identical(other.categoriesCount, categoriesCount) ||
                other.categoriesCount == categoriesCount) &&
            (identical(other.customersCount, customersCount) ||
                other.customersCount == customersCount) &&
            (identical(other.employeesCount, employeesCount) ||
                other.employeesCount == employeesCount) &&
            (identical(other.finesCount, finesCount) ||
                other.finesCount == finesCount) &&
            (identical(other.laundryServicesCount, laundryServicesCount) ||
                other.laundryServicesCount == laundryServicesCount) &&
            (identical(other.operationalDaysCount, operationalDaysCount) ||
                other.operationalDaysCount == operationalDaysCount) &&
            (identical(other.membershipPlansCount, membershipPlansCount) ||
                other.membershipPlansCount == membershipPlansCount) &&
            (identical(other.positionsCount, positionsCount) ||
                other.positionsCount == positionsCount) &&
            (identical(other.ordersCount, ordersCount) ||
                other.ordersCount == ordersCount) &&
            (identical(other.expensesCount, expensesCount) ||
                other.expensesCount == expensesCount) &&
            (identical(other.journalEntriesCount, journalEntriesCount) ||
                other.journalEntriesCount == journalEntriesCount) &&
            (identical(other.servicePackagesCount, servicePackagesCount) ||
                other.servicePackagesCount == servicePackagesCount) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.distance, distance) ||
                other.distance == distance) &&
            (identical(other.hasExposure, hasExposure) ||
                other.hasExposure == hasExposure) &&
            (identical(other.isActivated, isActivated) ||
                other.isActivated == isActivated) &&
            (identical(other.hasActiveExposure, hasActiveExposure) ||
                other.hasActiveExposure == hasActiveExposure) &&
            (identical(other.isExposureExpired, isExposureExpired) ||
                other.isExposureExpired == isExposureExpired) &&
            (identical(other.isCurrentlyOpen, isCurrentlyOpen) ||
                other.isCurrentlyOpen == isCurrentlyOpen) &&
            (identical(other.isCourierEnabled, isCourierEnabled) ||
                other.isCourierEnabled == isCourierEnabled) &&
            (identical(other.hasFreeShipping, hasFreeShipping) ||
                other.hasFreeShipping == hasFreeShipping) &&
            (identical(
                  other.hasUnconditionalFreeShipping,
                  hasUnconditionalFreeShipping,
                ) ||
                other.hasUnconditionalFreeShipping ==
                    hasUnconditionalFreeShipping) &&
            (identical(other.operationalStatus, operationalStatus) ||
                other.operationalStatus == operationalStatus) &&
            const DeepCollectionEquality().equals(
              other._todaySchedule,
              _todaySchedule,
            ) &&
            const DeepCollectionEquality().equals(
              other._nextOpenDay,
              _nextOpenDay,
            ) &&
            (identical(other.averageRating, averageRating) ||
                other.averageRating == averageRating) &&
            (identical(other.reviewsCount, reviewsCount) ||
                other.reviewsCount == reviewsCount) &&
            const DeepCollectionEquality().equals(
              other._categories,
              _categories,
            ) &&
            const DeepCollectionEquality().equals(
              other._operationalDays,
              _operationalDays,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    ownerId,
    name,
    code,
    phone,
    email,
    description,
    isActive,
    coinBalance,
    provinceId,
    provinceName,
    cityId,
    cityName,
    districtId,
    districtName,
    villageId,
    villageName,
    street,
    fullAddress,
    statusLabel,
    createdAt,
    updatedAt,
    deletedAt,
    categoriesCount,
    customersCount,
    employeesCount,
    finesCount,
    laundryServicesCount,
    operationalDaysCount,
    membershipPlansCount,
    positionsCount,
    ordersCount,
    expensesCount,
    journalEntriesCount,
    servicePackagesCount,
    latitude,
    longitude,
    distance,
    hasExposure,
    isActivated,
    hasActiveExposure,
    isExposureExpired,
    isCurrentlyOpen,
    isCourierEnabled,
    hasFreeShipping,
    hasUnconditionalFreeShipping,
    operationalStatus,
    const DeepCollectionEquality().hash(_todaySchedule),
    const DeepCollectionEquality().hash(_nextOpenDay),
    averageRating,
    reviewsCount,
    const DeepCollectionEquality().hash(_categories),
    const DeepCollectionEquality().hash(_operationalDays),
  ]);

  /// Create a copy of OutletModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$OutletModelImplCopyWith<_$OutletModelImpl> get copyWith =>
      __$$OutletModelImplCopyWithImpl<_$OutletModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$OutletModelImplToJson(this);
  }
}

abstract class _OutletModel extends OutletModel {
  const factory _OutletModel({
    required final int id,
    final int? ownerId,
    required final String name,
    final String? code,
    final String? phone,
    final String? email,
    final String? description,
    required final bool isActive,
    final int coinBalance,
    final int? provinceId,
    final String? provinceName,
    final int? cityId,
    final String? cityName,
    final int? districtId,
    final String? districtName,
    final int? villageId,
    final String? villageName,
    final String? street,
    final String? fullAddress,
    final String? statusLabel,
    final String? createdAt,
    final String? updatedAt,
    final String? deletedAt,
    final int? categoriesCount,
    final int? customersCount,
    final int? employeesCount,
    final int? finesCount,
    final int? laundryServicesCount,
    final int? operationalDaysCount,
    final int? membershipPlansCount,
    final int? positionsCount,
    final int? ordersCount,
    final int? expensesCount,
    final int? journalEntriesCount,
    final int? servicePackagesCount,
    final double? latitude,
    final double? longitude,
    final double? distance,
    final bool hasExposure,
    final bool isActivated,
    final bool hasActiveExposure,
    final bool isExposureExpired,
    final bool isCurrentlyOpen,
    final bool isCourierEnabled,
    final bool hasFreeShipping,
    final bool hasUnconditionalFreeShipping,
    final OutletOperationalStatusModel? operationalStatus,
    final Map<String, dynamic>? todaySchedule,
    final Map<String, dynamic>? nextOpenDay,
    final double? averageRating,
    final int? reviewsCount,
    final List<CategoryModel>? categories,
    final List<OperationalDayModel>? operationalDays,
  }) = _$OutletModelImpl;
  const _OutletModel._() : super._();

  factory _OutletModel.fromJson(Map<String, dynamic> json) =
      _$OutletModelImpl.fromJson;

  @override
  int get id;
  @override
  int? get ownerId;
  @override
  String get name;
  @override
  String? get code;
  @override
  String? get phone;
  @override
  String? get email;
  @override
  String? get description;
  @override
  bool get isActive;
  @override
  int get coinBalance;
  @override
  int? get provinceId;
  @override
  String? get provinceName;
  @override
  int? get cityId;
  @override
  String? get cityName;
  @override
  int? get districtId;
  @override
  String? get districtName;
  @override
  int? get villageId;
  @override
  String? get villageName;
  @override
  String? get street;
  @override
  String? get fullAddress;
  @override
  String? get statusLabel;
  @override
  String? get createdAt;
  @override
  String? get updatedAt;
  @override
  String? get deletedAt;
  @override
  int? get categoriesCount;
  @override
  int? get customersCount;
  @override
  int? get employeesCount;
  @override
  int? get finesCount;
  @override
  int? get laundryServicesCount;
  @override
  int? get operationalDaysCount;
  @override
  int? get membershipPlansCount;
  @override
  int? get positionsCount;
  @override
  int? get ordersCount;
  @override
  int? get expensesCount;
  @override
  int? get journalEntriesCount;
  @override
  int? get servicePackagesCount;
  @override
  double? get latitude;
  @override
  double? get longitude;
  @override
  double? get distance;
  @override
  bool get hasExposure;
  @override
  bool get isActivated;
  @override
  bool get hasActiveExposure;
  @override
  bool get isExposureExpired;
  @override
  bool get isCurrentlyOpen;
  @override
  bool get isCourierEnabled;
  @override
  bool get hasFreeShipping;
  @override
  bool get hasUnconditionalFreeShipping;
  @override
  OutletOperationalStatusModel? get operationalStatus;
  @override
  Map<String, dynamic>? get todaySchedule;
  @override
  Map<String, dynamic>? get nextOpenDay;
  @override
  double? get averageRating;
  @override
  int? get reviewsCount;
  @override
  List<CategoryModel>? get categories;
  @override
  List<OperationalDayModel>? get operationalDays;

  /// Create a copy of OutletModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$OutletModelImplCopyWith<_$OutletModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
