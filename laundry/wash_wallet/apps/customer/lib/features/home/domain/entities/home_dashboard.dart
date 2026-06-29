import 'package:equatable/equatable.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../../../customer_address/domain/entities/customer_address.dart';

class OrderSummary extends Equatable {
  final int totalOrders;
  final int activeOrders;
  final int readyToPickup;
  final int completedOrders;

  const OrderSummary({
    required this.totalOrders,
    required this.activeOrders,
    required this.readyToPickup,
    required this.completedOrders,
  });

  @override
  List<Object?> get props => [
    totalOrders,
    activeOrders,
    readyToPickup,
    completedOrders,
  ];
}

class RecentOrder extends Equatable {
  final int id;
  final String orderNumber;
  final String status;
  final String paymentStatus;
  final int totalAmount;
  final int remainingAmount;
  final String? orderDate;
  final String? estimatedCompletion;
  final String outletName;

  const RecentOrder({
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

  @override
  List<Object?> get props => [
    id,
    orderNumber,
    status,
    paymentStatus,
    totalAmount,
    remainingAmount,
    orderDate,
    estimatedCompletion,
    outletName,
  ];
}

class FeaturedOutlet extends Equatable {
  final int id;
  final String name;
  final String status;
  final String? cityName;
  final String? districtName;

  const FeaturedOutlet({
    required this.id,
    required this.name,
    required this.status,
    this.cityName,
    this.districtName,
  });

  @override
  List<Object?> get props => [id, name, status, cityName, districtName];
}

class HomeDashboard extends Equatable {
  final CustomerAccount customer;
  final CustomerAddress? primaryAddress;
  final OrderSummary orderSummary;
  final List<RecentOrder> recentOrders;
  final List<FeaturedOutlet> featuredOutlets;

  const HomeDashboard({
    required this.customer,
    required this.primaryAddress,
    required this.orderSummary,
    required this.recentOrders,
    required this.featuredOutlets,
  });

  @override
  List<Object?> get props => [
    customer,
    primaryAddress,
    orderSummary,
    recentOrders,
    featuredOutlets,
  ];
}
