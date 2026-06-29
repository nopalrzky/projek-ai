import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class WeighItemData {
  final int laundryServiceId;
  final double quantity;
  final String? itemNotes;
  final double discountAmount;
  final bool isPackageUsage;
  final int? customerSubscriptionId;
  final double? quotaUsed;

  WeighItemData({
    required this.laundryServiceId,
    required this.quantity,
    this.itemNotes,
    this.discountAmount = 0,
    this.isPackageUsage = false,
    this.customerSubscriptionId,
    this.quotaUsed,
  });

  Map<String, dynamic> toMap() {
    return {
      'laundryServiceId': laundryServiceId,
      'quantity': quantity,
      'itemNotes': itemNotes,
      'discountAmount': discountAmount,
      'isPackageUsage': isPackageUsage,
      'customerSubscriptionId': customerSubscriptionId,
      'quotaUsed': quotaUsed,
    };
  }
}

class WeighParams {
  final int orderId;
  final int? customerId;
  final int employeeId;
  final String? notes;
  final String? internalNotes;
  final List<String>? specialInstructions;
  final List<WeighItemData> orderItems;
  final String? photoPath;
  final String? clientRequestId;

  WeighParams({
    required this.orderId,
    this.customerId,
    required this.employeeId,
    this.notes,
    this.internalNotes,
    this.specialInstructions,
    required this.orderItems,
    this.photoPath,
    this.clientRequestId,
  });

  Map<String, dynamic> toMap() {
    return {
      'customerId': customerId,
      'employeeId': employeeId,
      'notes': notes,
      'internalNotes': internalNotes,
      'specialInstructions': specialInstructions,
      'orderItems': orderItems.map((e) => e.toMap()).toList(),
      if (clientRequestId != null) 'client_request_id': clientRequestId,
    };
  }
}

class WeighUsecase {
  final OrderRepository _repository;

  WeighUsecase(this._repository);

  Future<Result<Order>> call(WeighParams params) {
    return _repository.weigh(
      id: params.orderId,
      data: params.toMap(),
      photoPath: params.photoPath,
    );
  }
}
