import 'package:equatable/equatable.dart';
import 'customer.dart';
import 'service_package.dart';
import 'customer_quota.dart';

class CustomerSubscription extends Equatable {
  final int id;
  final int customerId;
  final int servicePackageId;
  final String subscriptionCode;
  final double pricePaid;
  final DateTime? purchaseDate;
  final DateTime? expiredAt;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int? remainingDays;
  final bool isUnlimited;
  final String statusBadgeVariant;
  final String statusLabel;
  final Customer? customer;
  final ServicePackage? servicePackage;
  final List<CustomerQuota> customerQuotas;

  const CustomerSubscription({
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
    this.customerQuotas = const [],
  });

  factory CustomerSubscription.fromModel(dynamic model) {
    return CustomerSubscription(
      id: model.id,
      customerId: model.customerId,
      servicePackageId: model.servicePackageId,
      subscriptionCode: model.subscriptionCode,
      pricePaid: model.pricePaid,
      purchaseDate: model.purchaseDate,
      expiredAt: model.expiredAt,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      remainingDays: model.remainingDays,
      isUnlimited: model.isUnlimited,
      statusBadgeVariant: model.statusBadgeVariant,
      statusLabel: model.statusLabel,
      customer: model.customer != null
          ? Customer.fromModel(model.customer)
          : null,
      servicePackage: model.servicePackage != null
          ? ServicePackage.fromModel(model.servicePackage)
          : null,
      customerQuotas:
          (model.customerQuotas as List?)
              ?.map((e) => CustomerQuota.fromModel(e))
              .toList() ??
          [],
    );
  }

  @override
  List<Object?> get props => [
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
    customerQuotas,
  ];
}
