import 'package:equatable/equatable.dart';
import 'category.dart';
import 'operational_day.dart';
import 'outlet_operational_status.dart';

class Outlet extends Equatable {
  final int id;
  final int? ownerId;
  final String name;
  final String? code;
  final String? phone;
  final String? email;
  final String? description;
  final bool isActive;
  final int coinBalance;
  final int? provinceId;
  final String? provinceName;
  final int? cityId;
  final String? cityName;
  final int? districtId;
  final String? districtName;
  final int? villageId;
  final String? villageName;
  final String? street;
  final String? fullAddress;
  final String? statusLabel;
  final String? createdAt;
  final String? updatedAt;
  final String? deletedAt;
  final double? latitude;
  final double? longitude;
  final double? distance;
  final bool hasExposure;
  final bool isActivated;
  final bool hasActiveExposure;
  final bool isExposureExpired;
  final bool isCurrentlyOpen;
  final bool isCourierEnabled;
  final bool hasFreeShipping;
  final bool hasUnconditionalFreeShipping;
  final OutletOperationalStatus? operationalStatus;
  final Map<String, dynamic>? todaySchedule;
  final Map<String, dynamic>? nextOpenDay;
  final int? categoriesCount;
  final int? customersCount;
  final int? employeesCount;
  final int? finesCount;
  final int? laundryServicesCount;
  final int? operationalDaysCount;
  final int? membershipPlansCount;
  final int? positionsCount;
  final int? ordersCount;
  final int? expensesCount;
  final int? journalEntriesCount;
  final int? servicePackagesCount;
  final double? averageRating;
  final int? reviewsCount;
  final List<Category>? categories;
  final List<OperationalDay>? operationalDays;

  const Outlet({
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
    this.todaySchedule,
    this.nextOpenDay,
    this.averageRating,
    this.reviewsCount,
    this.categories,
    this.operationalDays,
  });

  factory Outlet.fromModel(dynamic model) {
    return Outlet(
      id: model.id,
      ownerId: model.ownerId,
      name: model.name,
      code: model.code,
      phone: model.phone,
      email: model.email,
      description: model.description,
      isActive: model.isActive,
      coinBalance: model.coinBalance,
      provinceId: model.provinceId,
      provinceName: model.provinceName,
      cityId: model.cityId,
      cityName: model.cityName,
      districtId: model.districtId,
      districtName: model.districtName,
      villageId: model.villageId,
      villageName: model.villageName,
      street: model.street,
      fullAddress: model.fullAddress,
      statusLabel: model.statusLabel,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
      categoriesCount: model.categoriesCount,
      customersCount: model.customersCount,
      employeesCount: model.employeesCount,
      finesCount: model.finesCount,
      laundryServicesCount: model.laundryServicesCount,
      operationalDaysCount: model.operationalDaysCount,
      membershipPlansCount: model.membershipPlansCount,
      positionsCount: model.positionsCount,
      ordersCount: model.ordersCount,
      expensesCount: model.expensesCount,
      journalEntriesCount: model.journalEntriesCount,
      servicePackagesCount: model.servicePackagesCount,
      latitude: model.latitude,
      longitude: model.longitude,
      distance: model.distance,
      hasExposure: model.hasExposure,
      isActivated: model.isActivated,
      hasActiveExposure: model.hasActiveExposure,
      isExposureExpired: model.isExposureExpired,
      isCurrentlyOpen: model.isCurrentlyOpen,
      isCourierEnabled: model.isCourierEnabled,
      hasFreeShipping: model.hasFreeShipping,
      hasUnconditionalFreeShipping: model.hasUnconditionalFreeShipping,
      operationalStatus: model.operationalStatus?.toEntity(),
      todaySchedule: model.todaySchedule,
      nextOpenDay: model.nextOpenDay,
      averageRating: model.averageRating,
      reviewsCount: model.reviewsCount,
      categories: model.categories?.map((e) => e.toEntity()).toList(),
      operationalDays: model.operationalDays?.map((e) => e.toEntity()).toList(),
    );
  }

  @override
  List<Object?> get props => [
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
    hasUnconditionalFreeShipping,
    hasFreeShipping,
    operationalStatus,
    todaySchedule,
    nextOpenDay,
    averageRating,
    reviewsCount,
    categories,
    operationalDays,
  ];
}
