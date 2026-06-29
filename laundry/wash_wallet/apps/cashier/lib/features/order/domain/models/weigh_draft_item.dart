import 'package:wash_wallet_domain/wash_wallet_domain.dart';

import '../usecases/weigh_usecase.dart';

class WeighDraftItem {
  final int laundryServiceId;
  final String categoryName;
  final String serviceName;
  final String unitName;
  final double unitPrice;
  final int? minQuantity;
  final double quantity;
  final String? itemNotes;
  final bool isPackageUsage;
  final int? customerSubscriptionId;
  final double? quotaUsed;

  const WeighDraftItem({
    required this.laundryServiceId,
    required this.categoryName,
    required this.serviceName,
    required this.unitName,
    required this.unitPrice,
    this.minQuantity,
    required this.quantity,
    this.itemNotes,
    this.isPackageUsage = false,
    this.customerSubscriptionId,
    this.quotaUsed,
  });

  double get subtotal => unitPrice * quantity;

  factory WeighDraftItem.fromOrderItem(OrderItem item) {
    return WeighDraftItem(
      laundryServiceId: item.laundryServiceId ?? 0,
      categoryName: item.categoryName ?? '-',
      serviceName: item.laundryServiceName ?? 'Layanan',
      unitName: item.unitName ?? 'Unit',
      unitPrice: item.unitPrice,
      minQuantity: null,
      quantity: item.quantity,
      itemNotes: item.itemNotes,
    );
  }

  factory WeighDraftItem.fromService(LaundryService service) {
    return WeighDraftItem(
      laundryServiceId: service.id,
      categoryName: service.category?.name ?? '-',
      serviceName: service.name,
      unitName: service.unit?.name ?? 'Unit',
      unitPrice: service.price,
      minQuantity: service.minQuantity,
      quantity: service.minQuantity.toDouble(),
    );
  }

  WeighDraftItem copyWith({
    int? laundryServiceId,
    String? categoryName,
    String? serviceName,
    String? unitName,
    double? unitPrice,
    int? minQuantity,
    double? quantity,
    String? itemNotes,
    bool? isPackageUsage,
    int? customerSubscriptionId,
    double? quotaUsed,
    bool clearPackageUsage = false,
    bool clearItemNotes = false,
  }) {
    return WeighDraftItem(
      laundryServiceId: laundryServiceId ?? this.laundryServiceId,
      categoryName: categoryName ?? this.categoryName,
      serviceName: serviceName ?? this.serviceName,
      unitName: unitName ?? this.unitName,
      unitPrice: unitPrice ?? this.unitPrice,
      minQuantity: minQuantity ?? this.minQuantity,
      quantity: quantity ?? this.quantity,
      itemNotes: clearItemNotes ? null : (itemNotes ?? this.itemNotes),
      isPackageUsage: clearPackageUsage
          ? false
          : (isPackageUsage ?? this.isPackageUsage),
      customerSubscriptionId: clearPackageUsage
          ? null
          : (customerSubscriptionId ?? this.customerSubscriptionId),
      quotaUsed: clearPackageUsage ? null : (quotaUsed ?? this.quotaUsed),
    );
  }

  WeighItemData toWeighItemData({
    double discountAmount = 0,
    bool? packageUsage,
    int? subscriptionId,
    double? usedQuota,
  }) {
    return WeighItemData(
      laundryServiceId: laundryServiceId,
      quantity: quantity,
      itemNotes: itemNotes,
      discountAmount: discountAmount,
      isPackageUsage: packageUsage ?? isPackageUsage,
      customerSubscriptionId: subscriptionId ?? customerSubscriptionId,
      quotaUsed: usedQuota ?? quotaUsed,
    );
  }
}
