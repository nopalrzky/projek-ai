import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderPriceCalculator {
  const OrderPriceCalculator();

  bool isFullyCoveredByPackage(OrderPriceResult result) {
    if (result.itemBreakdowns.isEmpty) {
      return false;
    }

    final hasQuotaUsage = result.totalQuotaDiscount > 0;
    final allItemsFullyCoveredByQuota = result.itemBreakdowns.every(
      (item) => item.payableQuantity <= 0,
    );

    return hasQuotaUsage && allItemsFullyCoveredByQuota;
  }

  OrderPriceResult calculate({
    required List<OrderDraftItem> items,
    required List<LaundryService> services,
    required List<MembershipContract> membershipContracts,
    required List<CustomerSubscription> customerSubscriptions,
  }) {
    if (items.isEmpty) {
      return const OrderPriceResult(
        subtotal: 0,
        totalQuotaDiscount: 0,
        totalMembershipDiscount: 0,
        total: 0,
        itemBreakdowns: [],
      );
    }

    final activeMembership = _findActiveMembership(membershipContracts);
    final activeQuotas = _collectActiveQuotas(customerSubscriptions);

    final itemBreakdowns = <OrderItemPriceBreakdown>[];
    double totalSubtotal = 0;
    double totalQuotaDiscount = 0;
    double totalMembershipDiscount = 0;

    for (final item in items) {
      final service = _findService(services, item.laundryServiceId);
      if (service == null) continue;

      final breakdown = _calculateItemPrice(
        item: item,
        service: service,
        activeMembership: activeMembership,
        activeQuotas: activeQuotas,
      );

      itemBreakdowns.add(breakdown);
      totalSubtotal += breakdown.subtotalBeforeDiscount;
      totalQuotaDiscount += breakdown.quotaDiscountAmount;
      totalMembershipDiscount += breakdown.membershipDiscountAmount;
    }

    final total = totalSubtotal - totalQuotaDiscount - totalMembershipDiscount;

    return OrderPriceResult(
      subtotal: totalSubtotal,
      totalQuotaDiscount: totalQuotaDiscount,
      totalMembershipDiscount: totalMembershipDiscount,
      total: total < 0 ? 0 : total,
      itemBreakdowns: itemBreakdowns,
    );
  }

  OrderItemPriceBreakdown _calculateItemPrice({
    required OrderDraftItem item,
    required LaundryService service,
    required MembershipContract? activeMembership,
    required List<CustomerQuota> activeQuotas,
  }) {
    final totalQuantity = item.quantity.toDouble();
    final unitPrice = service.price;
    final subtotalBeforeDiscount = unitPrice * totalQuantity;

    final quotaCoveredQuantity = _getQuotaCoveredQuantity(
      laundryServiceId: service.id,
      requestedQuantity: totalQuantity,
      quotas: activeQuotas,
    );

    final payableQuantity = totalQuantity - quotaCoveredQuantity;
    final quotaDiscountAmount = unitPrice * quotaCoveredQuantity;
    final payableSubtotal = unitPrice * payableQuantity;

    final membershipDiscountPercentage = _resolveMembershipDiscountPercentage(
      activeMembership,
    );
    final membershipDiscountAmount =
        payableSubtotal * (membershipDiscountPercentage / 100);

    final totalAmount = payableSubtotal - membershipDiscountAmount;

    return OrderItemPriceBreakdown(
      laundryServiceId: service.id,
      laundryServiceName: service.name,
      unitPrice: unitPrice,
      totalQuantity: totalQuantity,
      quotaCoveredQuantity: quotaCoveredQuantity,
      payableQuantity: payableQuantity,
      subtotalBeforeDiscount: subtotalBeforeDiscount,
      quotaDiscountAmount: quotaDiscountAmount,
      membershipDiscountAmount: membershipDiscountAmount,
      totalAmount: totalAmount < 0 ? 0 : totalAmount,
    );
  }

  MembershipContract? _findActiveMembership(
    List<MembershipContract> contracts,
  ) {
    if (contracts.isEmpty) return null;

    final now = DateTime.now();

    for (final contract in contracts) {
      final status = contract.status.toLowerCase();
      final isStatusActive =
          status == 'active' || status == 'aktif' || status == 'ongoing';

      bool isNotExpired = true;
      if (contract.expiredAt != null) {
        try {
          final expiryDate = DateTime.parse(contract.expiredAt!);
          isNotExpired = !expiryDate.isBefore(now);
        } catch (_) {
          isNotExpired = true;
        }
      }

      if (isStatusActive && isNotExpired) {
        return contract;
      }
    }

    return null;
  }

  List<CustomerQuota> _collectActiveQuotas(
    List<CustomerSubscription> subscriptions,
  ) {
    if (subscriptions.isEmpty) return const [];

    final now = DateTime.now();
    final quotas = <CustomerQuota>[];

    for (final subscription in subscriptions) {
      final status = subscription.status.toLowerCase();
      final isStatusActive =
          status == 'active' || status == 'aktif' || status == 'ongoing';

      bool isNotExpired = true;
      if (subscription.expiredAt != null) {
        try {
          final expiryDate = subscription.expiredAt!;
          isNotExpired = !expiryDate.isBefore(now);
        } catch (_) {
          isNotExpired = true;
        }
      }

      if (!isStatusActive || !isNotExpired) continue;

      quotas.addAll(
        subscription.customerQuotas.where((quota) => quota.remainingQuota > 0),
      );
    }

    return quotas;
  }

  double _resolveMembershipDiscountPercentage(
    MembershipContract? activeMembership,
  ) {
    if (activeMembership == null || activeMembership.membershipPlan == null) {
      return 0;
    }

    final discount = activeMembership.membershipPlan!.discountPercentage;
    if (discount <= 0) return 0;
    if (discount >= 100) return 100;

    return discount;
  }

  double _getQuotaCoveredQuantity({
    required int laundryServiceId,
    required double requestedQuantity,
    required List<CustomerQuota> quotas,
  }) {
    if (quotas.isEmpty) {
      return 0;
    }

    final matchingQuotas = quotas.where(
      (q) => q.laundryServiceId == laundryServiceId,
    );

    if (matchingQuotas.isEmpty) {
      return 0;
    }

    final totalRemaining = matchingQuotas.fold<double>(
      0,
      (sum, q) => sum + q.remainingQuota,
    );

    if (totalRemaining <= 0) {
      return 0;
    }

    return requestedQuantity <= totalRemaining
        ? requestedQuantity
        : totalRemaining;
  }

  LaundryService? _findService(
    List<LaundryService> services,
    int laundryServiceId,
  ) {
    try {
      return services.firstWhere((s) => s.id == laundryServiceId);
    } catch (_) {
      return null;
    }
  }
}

extension OrderPriceResultPackageCoverage on OrderPriceResult {
  bool get isFullyCoveredByPackage {
    if (itemBreakdowns.isEmpty) {
      return false;
    }

    final hasQuotaUsage = totalQuotaDiscount > 0;
    final allItemsFullyCoveredByQuota = itemBreakdowns.every(
      (item) => item.payableQuantity <= 0,
    );

    return hasQuotaUsage && allItemsFullyCoveredByQuota;
  }
}
