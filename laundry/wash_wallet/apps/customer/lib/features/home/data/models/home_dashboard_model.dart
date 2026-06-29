import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../../customer_address/data/models/customer_address_model.dart';
import '../../domain/entities/home_dashboard.dart';

class OrderSummaryModel {
  final int totalOrders;
  final int activeOrders;
  final int readyToPickup;
  final int completedOrders;

  const OrderSummaryModel({
    required this.totalOrders,
    required this.activeOrders,
    required this.readyToPickup,
    required this.completedOrders,
  });

  factory OrderSummaryModel.fromJson(Map<String, dynamic> json) {
    return OrderSummaryModel(
      totalOrders: _toInt(json['totalOrders']),
      activeOrders: _toInt(json['activeOrders']),
      readyToPickup: _toInt(json['readyToPickup']),
      completedOrders: _toInt(json['completedOrders']),
    );
  }

  OrderSummary toEntity() {
    return OrderSummary(
      totalOrders: totalOrders,
      activeOrders: activeOrders,
      readyToPickup: readyToPickup,
      completedOrders: completedOrders,
    );
  }
}

class RecentOrderModel {
  final int id;
  final String orderNumber;
  final String status;
  final String paymentStatus;
  final int totalAmount;
  final int remainingAmount;
  final String? orderDate;
  final String? estimatedCompletion;
  final String outletName;

  const RecentOrderModel({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.paymentStatus,
    required this.totalAmount,
    required this.remainingAmount,
    this.orderDate,
    this.estimatedCompletion,
    required this.outletName,
  });

  factory RecentOrderModel.fromJson(Map<String, dynamic> json) {
    return RecentOrderModel(
      id: _toInt(json['id']),
      orderNumber: (json['orderNumber'] ?? '') as String,
      status: (json['status'] ?? '') as String,
      paymentStatus: (json['paymentStatus'] ?? '') as String,
      totalAmount: _toInt(json['totalAmount']),
      remainingAmount: _toInt(json['remainingAmount']),
      orderDate: json['orderDate'] as String?,
      estimatedCompletion: json['estimatedCompletion'] as String?,
      outletName: (json['outletName'] ?? '') as String,
    );
  }

  RecentOrder toEntity() {
    return RecentOrder(
      id: id,
      orderNumber: orderNumber,
      status: status,
      paymentStatus: paymentStatus,
      totalAmount: totalAmount,
      remainingAmount: remainingAmount,
      orderDate: orderDate,
      estimatedCompletion: estimatedCompletion,
      outletName: outletName,
    );
  }
}

class FeaturedOutletModel {
  final int id;
  final String name;
  final String status;
  final String? cityName;
  final String? districtName;

  const FeaturedOutletModel({
    required this.id,
    required this.name,
    required this.status,
    this.cityName,
    this.districtName,
  });

  factory FeaturedOutletModel.fromJson(Map<String, dynamic> json) {
    return FeaturedOutletModel(
      id: _toInt(json['id']),
      name: (json['name'] ?? '') as String,
      status: (json['status'] ?? '') as String,
      cityName: json['cityName'] as String?,
      districtName: json['districtName'] as String?,
    );
  }

  FeaturedOutlet toEntity() {
    return FeaturedOutlet(
      id: id,
      name: name,
      status: status,
      cityName: cityName,
      districtName: districtName,
    );
  }
}

class HomeDashboardModel {
  final CustomerAccountModel customer;
  final CustomerAddressModel? primaryAddress;
  final OrderSummaryModel orderSummary;
  final List<RecentOrderModel> recentOrders;
  final List<FeaturedOutletModel> featuredOutlets;

  const HomeDashboardModel({
    required this.customer,
    required this.primaryAddress,
    required this.orderSummary,
    required this.recentOrders,
    required this.featuredOutlets,
  });

  factory HomeDashboardModel.fromJson(Map<String, dynamic> json) {
    final customerJson = json['customer'] as Map<String, dynamic>? ?? {};
    final primaryAddressJson = json['primaryAddress'] as Map<String, dynamic>?;
    final orderSummaryJson =
        json['orderSummary'] as Map<String, dynamic>? ?? {};

    final recentOrdersRaw = json['recentOrders'] as List? ?? const [];
    final featuredOutletsRaw = json['featuredOutlets'] as List? ?? const [];

    return HomeDashboardModel(
      customer: CustomerAccountModel.fromJson(customerJson),
      primaryAddress: primaryAddressJson == null
          ? null
          : CustomerAddressModel.fromJson(primaryAddressJson),
      orderSummary: OrderSummaryModel.fromJson(orderSummaryJson),
      recentOrders: recentOrdersRaw
          .whereType<Map>()
          .map((e) => RecentOrderModel.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      featuredOutlets: featuredOutletsRaw
          .whereType<Map>()
          .map(
            (e) => FeaturedOutletModel.fromJson(Map<String, dynamic>.from(e)),
          )
          .toList(),
    );
  }

  HomeDashboard toEntity() {
    return HomeDashboard(
      customer: customer.toEntity(),
      primaryAddress: primaryAddress?.toEntity(),
      orderSummary: orderSummary.toEntity(),
      recentOrders: recentOrders.map((e) => e.toEntity()).toList(),
      featuredOutlets: featuredOutlets.map((e) => e.toEntity()).toList(),
    );
  }
}

int _toInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}
