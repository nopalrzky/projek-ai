import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/outlet.dart';
import '../helpers/json_converters.dart';
import 'category_model.dart';
import 'operational_day_model.dart';
import 'outlet_operational_status_model.dart';

part 'outlet_model.freezed.dart';
part 'outlet_model.g.dart';

@freezed
class OutletModel with _$OutletModel {
  const factory OutletModel({
    required int id,
    int? ownerId,
    required String name,
    String? code,
    String? phone,
    String? email,
    String? description,
    required bool isActive,
    @Default(0) int coinBalance,
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
    @Default(false) bool hasExposure,
    @Default(false) bool isActivated,
    @Default(false) bool hasActiveExposure,
    @Default(false) bool isExposureExpired,
    @Default(false) bool isCurrentlyOpen,
    @Default(true) bool isCourierEnabled,
    @Default(false) bool hasFreeShipping,
    @Default(false) bool hasUnconditionalFreeShipping,
    OutletOperationalStatusModel? operationalStatus,
    Map<String, dynamic>? todaySchedule,
    Map<String, dynamic>? nextOpenDay,
    double? averageRating,
    int? reviewsCount,
    List<CategoryModel>? categories,
    List<OperationalDayModel>? operationalDays,
  }) = _OutletModel;

  const OutletModel._();

  factory OutletModel.fromJson(Map<String, dynamic> json) =>
      _$OutletModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);
    final statusValue =
        json['status'] ?? json['statusLabel'] ?? json['status_label'];

    normalized['ownerId'] = toIntOrNull(json['ownerId'] ?? json['owner_id']);
    normalized['coinBalance'] = toInt(
      json['coinBalance'] ?? json['coin_balance'],
    );
    normalized['provinceId'] = toIntOrNull(
      json['provinceId'] ?? json['province_id'],
    );
    normalized['provinceName'] = json['provinceName'] ?? json['province_name'];
    normalized['cityId'] = toIntOrNull(json['cityId'] ?? json['city_id']);
    normalized['cityName'] = json['cityName'] ?? json['city_name'];
    normalized['districtId'] = toIntOrNull(
      json['districtId'] ?? json['district_id'],
    );
    normalized['districtName'] = json['districtName'] ?? json['district_name'];
    normalized['villageId'] = toIntOrNull(
      json['villageId'] ?? json['village_id'],
    );
    normalized['villageName'] = json['villageName'] ?? json['village_name'];
    normalized['fullAddress'] = json['fullAddress'] ?? json['full_address'];
    normalized['statusLabel'] = statusValue;
    normalized['isActive'] =
        toBool(json['isActive'] ?? json['is_active']) ||
        toStringOrNull(statusValue)?.toLowerCase() == 'active';
    normalized['hasExposure'] = toBool(
      json['hasExposure'] ?? json['has_exposure'],
    );
    normalized['isActivated'] = toBool(
      json['isActivated'] ?? json['is_activated'],
    );
    normalized['hasActiveExposure'] = toBool(
      json['hasActiveExposure'] ?? json['has_active_exposure'],
    );
    normalized['isExposureExpired'] = toBool(
      json['isExposureExpired'] ?? json['is_exposure_expired'],
    );
    normalized['isCurrentlyOpen'] = toBool(
      json['isCurrentlyOpen'] ?? json['is_currently_open'],
    );
    normalized['isCourierEnabled'] = toBool(
      json['isCourierEnabled'] ?? json['is_courier_enabled'] ?? true,
    );
    normalized['hasFreeShipping'] = toBool(
      json['hasFreeShipping'] ?? json['has_free_shipping'] ?? false,
    );
    normalized['hasUnconditionalFreeShipping'] = toBool(
      json['hasUnconditionalFreeShipping'] ??
          json['has_unconditional_free_shipping'] ??
          false,
    );
    normalized['operationalStatus'] =
        _normalizeOperationalStatus(json) ?? json['operationalStatus'];
    normalized['todaySchedule'] = _normalizeTodaySchedule(json);
    normalized['nextOpenDay'] = json['nextOpenDay'] ?? json['next_open_day'];

    normalized['latitude'] = toDoubleOrNull(
      json['latitude'] ?? json['latitude'],
    );
    normalized['longitude'] = toDoubleOrNull(
      json['longitude'] ?? json['longitude'],
    );
    normalized['distance'] = toDoubleOrNull(
      json['distance'] ?? json['distance'],
    );
    normalized['averageRating'] = toDoubleOrNull(
      json['averageRating'] ?? json['average_rating'],
    );
    normalized['reviewsCount'] = toIntOrNull(
      json['reviewsCount'] ??
          json['totalReviews'] ??
          json['total_reviews'] ??
          json['reviews_count'],
    );

    normalized['createdAt'] = json['createdAt'] ?? json['created_at'];
    normalized['updatedAt'] = json['updatedAt'] ?? json['updated_at'];
    normalized['deletedAt'] = json['deletedAt'] ?? json['deleted_at'];

    normalized['categoriesCount'] = toIntOrNull(
      json['categoriesCount'] ?? json['categories_count'],
    );
    normalized['customersCount'] = toIntOrNull(
      json['customersCount'] ?? json['customers_count'],
    );
    normalized['employeesCount'] = toIntOrNull(
      json['employeesCount'] ?? json['employees_count'],
    );
    normalized['finesCount'] = toIntOrNull(
      json['finesCount'] ?? json['fines_count'],
    );
    normalized['laundryServicesCount'] = toIntOrNull(
      json['laundryServicesCount'] ?? json['laundry_services_count'],
    );
    normalized['operationalDaysCount'] = toIntOrNull(
      json['operationalDaysCount'] ?? json['operational_days_count'],
    );
    normalized['membershipPlansCount'] = toIntOrNull(
      json['membershipPlansCount'] ?? json['membership_plans_count'],
    );
    normalized['positionsCount'] = toIntOrNull(
      json['positionsCount'] ?? json['positions_count'],
    );
    normalized['ordersCount'] = toIntOrNull(
      json['ordersCount'] ?? json['orders_count'],
    );
    normalized['expensesCount'] = toIntOrNull(
      json['expensesCount'] ?? json['expenses_count'],
    );
    normalized['journalEntriesCount'] = toIntOrNull(
      json['journalEntriesCount'] ?? json['journal_entries_count'],
    );
    normalized['servicePackagesCount'] = toIntOrNull(
      json['servicePackagesCount'] ?? json['service_packages_count'],
    );
    normalized['categories'] = json['categories'] ?? json['categories'];
    normalized['operationalDays'] =
        json['operationalDays'] ?? json['operational_days'];

    return normalized;
  }

  static Map<String, dynamic>? _normalizeOperationalStatus(
    Map<String, dynamic> json,
  ) {
    final rawStatus = json['operationalStatus'];

    if (rawStatus is Map<String, dynamic>) {
      return Map<String, dynamic>.from(rawStatus);
    }

    if (rawStatus is Map) {
      return Map<String, dynamic>.from(rawStatus);
    }

    final todayHours = json['todayHours'] is List
        ? List<dynamic>.from(json['todayHours'] as List)
        : const <dynamic>[];
    final weeklyHours = json['weeklyHours'] is List
        ? List<dynamic>.from(json['weeklyHours'] as List)
        : const <dynamic>[];

    if (rawStatus == null &&
        todayHours.isEmpty &&
        weeklyHours.isEmpty &&
        json['operationalStatusLabel'] == null &&
        json['operationalStatusMessage'] == null) {
      return null;
    }

    return <String, dynamic>{
      'isOpenNow': toBool(json['isOpenNow'] ?? json['isCurrentlyOpen']),
      'operationalStatus': toStringOrNull(rawStatus) ?? 'hours_not_set',
      'operationalStatusLabel':
          toStringOrNull(json['operationalStatusLabel']) ??
          'Jam operasional belum tersedia',
      'operationalStatusMessage':
          toStringOrNull(json['operationalStatusMessage']) ??
          'Outlet belum dapat menerima order saat ini.',
      'todayHours': todayHours,
      'weeklyHours': weeklyHours,
      'nextOpenAt': toStringOrNull(json['nextOpenAt']),
      'nextCloseAt': toStringOrNull(json['nextCloseAt']),
      'canCreateOrderNow': toBool(json['canCreateOrderNow']),
      'orderDisabledReason': toStringOrNull(json['orderDisabledReason']),
      'timezone': toStringOrNull(json['timezone']) ?? 'Asia/Jakarta',
    };
  }

  static Map<String, dynamic>? _normalizeTodaySchedule(
    Map<String, dynamic> json,
  ) {
    final existingTodaySchedule = json['todaySchedule'];
    if (existingTodaySchedule is Map<String, dynamic>) {
      return Map<String, dynamic>.from(existingTodaySchedule);
    }

    if (existingTodaySchedule is Map) {
      return Map<String, dynamic>.from(existingTodaySchedule);
    }

    final todayHours = json['todayHours'];
    if (todayHours is List && todayHours.isNotEmpty) {
      final firstRange = todayHours.first;
      if (firstRange is Map<String, dynamic>) {
        return <String, dynamic>{
          'isOpen': true,
          'openTime': firstRange['open'],
          'closeTime': firstRange['close'],
        };
      }

      if (firstRange is Map) {
        final normalizedRange = Map<String, dynamic>.from(firstRange);
        return <String, dynamic>{
          'isOpen': true,
          'openTime': normalizedRange['open'],
          'closeTime': normalizedRange['close'],
        };
      }
    }

    return null;
  }

  Outlet toEntity() => Outlet(
    id: id,
    ownerId: ownerId,
    name: name,
    code: code,
    phone: phone,
    email: email,
    description: description,
    isActive: isActive,
    coinBalance: coinBalance,
    provinceId: provinceId,
    provinceName: provinceName,
    cityId: cityId,
    cityName: cityName,
    districtId: districtId,
    districtName: districtName,
    villageId: villageId,
    villageName: villageName,
    street: street,
    fullAddress: fullAddress,
    statusLabel: statusLabel,
    createdAt: createdAt,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
    categoriesCount: categoriesCount,
    customersCount: customersCount,
    employeesCount: employeesCount,
    finesCount: finesCount,
    laundryServicesCount: laundryServicesCount,
    operationalDaysCount: operationalDaysCount,
    membershipPlansCount: membershipPlansCount,
    positionsCount: positionsCount,
    ordersCount: ordersCount,
    expensesCount: expensesCount,
    journalEntriesCount: journalEntriesCount,
    servicePackagesCount: servicePackagesCount,
    latitude: latitude,
    longitude: longitude,
    distance: distance,
    hasExposure: hasExposure,
    isActivated: isActivated,
    hasActiveExposure: hasActiveExposure,
    isExposureExpired: isExposureExpired,
    isCurrentlyOpen: isCurrentlyOpen,
    isCourierEnabled: isCourierEnabled,
    hasFreeShipping: hasFreeShipping,
    hasUnconditionalFreeShipping: hasUnconditionalFreeShipping,
    operationalStatus: operationalStatus?.toEntity(),
    todaySchedule: todaySchedule,
    nextOpenDay: nextOpenDay,
    averageRating: averageRating,
    reviewsCount: reviewsCount,
    categories: categories?.map((e) => e.toEntity()).toList(),
    operationalDays: operationalDays?.map((e) => e.toEntity()).toList(),
  );

  factory OutletModel.fromEntity(Outlet entity) => OutletModel(
    id: entity.id,
    ownerId: entity.ownerId,
    name: entity.name,
    code: entity.code,
    phone: entity.phone,
    email: entity.email,
    description: entity.description,
    isActive: entity.isActive,
    coinBalance: entity.coinBalance,
    provinceId: entity.provinceId,
    provinceName: entity.provinceName,
    cityId: entity.cityId,
    cityName: entity.cityName,
    districtId: entity.districtId,
    districtName: entity.districtName,
    villageId: entity.villageId,
    villageName: entity.villageName,
    street: entity.street,
    fullAddress: entity.fullAddress,
    statusLabel: entity.statusLabel,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt,
    categoriesCount: entity.categoriesCount,
    customersCount: entity.customersCount,
    employeesCount: entity.employeesCount,
    finesCount: entity.finesCount,
    laundryServicesCount: entity.laundryServicesCount,
    operationalDaysCount: entity.operationalDaysCount,
    membershipPlansCount: entity.membershipPlansCount,
    positionsCount: entity.positionsCount,
    ordersCount: entity.ordersCount,
    expensesCount: entity.expensesCount,
    journalEntriesCount: entity.journalEntriesCount,
    servicePackagesCount: entity.servicePackagesCount,
    latitude: entity.latitude,
    longitude: entity.longitude,
    distance: entity.distance,
    hasExposure: entity.hasExposure,
    isActivated: entity.isActivated,
    hasActiveExposure: entity.hasActiveExposure,
    isExposureExpired: entity.isExposureExpired,
    isCurrentlyOpen: entity.isCurrentlyOpen,
    isCourierEnabled: entity.isCourierEnabled,
    hasFreeShipping: entity.hasFreeShipping,
    hasUnconditionalFreeShipping: entity.hasUnconditionalFreeShipping,
    operationalStatus: entity.operationalStatus == null
        ? null
        : OutletOperationalStatusModel.fromEntity(entity.operationalStatus!),
    todaySchedule: entity.todaySchedule,
    nextOpenDay: entity.nextOpenDay,
    averageRating: entity.averageRating,
    reviewsCount: entity.reviewsCount,
    categories: entity.categories
        ?.map((e) => CategoryModel.fromEntity(e))
        .toList(),
    operationalDays: entity.operationalDays
        ?.map((e) => OperationalDayModel.fromEntity(e))
        .toList(),
  );
}
