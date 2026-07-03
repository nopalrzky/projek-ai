import '../entities/order_draft.dart';

class OrderDraftModel {
  final int version;
  final int outletId;
  final int customerId;
  final int? employeeId;
  final List<OrderDraftItemModel> items;
  final String? notes;
  final DateTime? estimatedCompletion;
  final String? paymentStatus;
  final String? paymentMethod;
  final int? paymentAccountId;
  final double? paidAmount;
  final String status;
  final String? clientRequestId;
  final String? lastError;
  final DateTime updatedAt;

  const OrderDraftModel({
    this.version = 2,
    required this.outletId,
    required this.customerId,
    this.employeeId,
    required this.items,
    this.notes,
    this.estimatedCompletion,
    this.paymentStatus,
    this.paymentMethod,
    this.paymentAccountId,
    this.paidAmount,
    this.status = 'editing',
    this.clientRequestId,
    this.lastError,
    required this.updatedAt,
  });

  factory OrderDraftModel.fromJson(Map<String, dynamic> json) {
    return OrderDraftModel(
      version: json['version'] as int? ?? 1,
      outletId: json['outletId'] as int,
      customerId: json['customerId'] as int,
      employeeId: json['employeeId'] as int?,
      items: (json['items'] as List)
          .map((e) => OrderDraftItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      notes: json['notes'] as String?,
      estimatedCompletion: json['estimatedCompletion'] != null
          ? DateTime.parse(json['estimatedCompletion'] as String)
          : null,
      paymentStatus: json['paymentStatus'] as String?,
      paymentMethod: json['paymentMethod'] as String?,
      paymentAccountId: json['paymentAccountId'] as int?,
      paidAmount: (json['paidAmount'] as num?)?.toDouble(),
      status: json['status'] as String? ?? 'editing',
      clientRequestId: json['clientRequestId'] as String?,
      lastError: json['lastError'] as String?,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'version': version,
      'outletId': outletId,
      'customerId': customerId,
      'employeeId': employeeId,
      'items': items.map((e) => e.toJson()).toList(),
      'notes': notes,
      'estimatedCompletion': estimatedCompletion?.toIso8601String(),
      'paymentStatus': paymentStatus,
      'paymentMethod': paymentMethod,
      'paymentAccountId': paymentAccountId,
      'paidAmount': paidAmount,
      'status': status,
      'clientRequestId': clientRequestId,
      'lastError': lastError,
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory OrderDraftModel.fromEntity(OrderDraft entity) {
    return OrderDraftModel(
      version: entity.version,
      outletId: entity.outletId,
      customerId: entity.customerId,
      employeeId: entity.employeeId,
      items: entity.items
          .map((e) => OrderDraftItemModel.fromEntity(e))
          .toList(),
      notes: entity.notes,
      estimatedCompletion: entity.estimatedCompletion,
      paymentStatus: entity.paymentStatus,
      paymentMethod: entity.paymentMethod,
      paymentAccountId: entity.paymentAccountId,
      paidAmount: entity.paidAmount,
      status: entity.status,
      clientRequestId: entity.clientRequestId,
      lastError: entity.lastError,
      updatedAt: entity.updatedAt,
    );
  }

  OrderDraft toEntity() {
    return OrderDraft(
      version: version,
      outletId: outletId,
      customerId: customerId,
      employeeId: employeeId,
      items: items.map((e) => e.toEntity()).toList(),
      notes: notes,
      estimatedCompletion: estimatedCompletion,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      paymentAccountId: paymentAccountId,
      paidAmount: paidAmount,
      status: status,
      clientRequestId: clientRequestId,
      lastError: lastError,
      updatedAt: updatedAt,
    );
  }
}

class OrderDraftItemModel {
  final int laundryServiceId;
  final int? priceId;
  final String? serviceName;
  final double quantity;
  final double? unitPrice;
  final double? subtotal;
  final String? notes;

  const OrderDraftItemModel({
    required this.laundryServiceId,
    this.priceId,
    this.serviceName,
    required this.quantity,
    this.unitPrice,
    this.subtotal,
    this.notes,
  });

  factory OrderDraftItemModel.fromJson(Map<String, dynamic> json) {
    return OrderDraftItemModel(
      laundryServiceId:
          json['laundryServiceId'] as int? ?? json['serviceId'] as int,
      priceId: json['priceId'] as int?,
      serviceName: json['serviceName'] as String?,
      quantity: (json['quantity'] as num).toDouble(),
      unitPrice: (json['unitPrice'] as num?)?.toDouble(),
      subtotal: (json['subtotal'] as num?)?.toDouble(),
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'laundryServiceId': laundryServiceId,
      'serviceId': laundryServiceId, // For v2 compatibility
      'priceId': priceId,
      'serviceName': serviceName,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'subtotal': subtotal,
      'notes': notes,
    };
  }

  factory OrderDraftItemModel.fromEntity(OrderDraftItem entity) {
    return OrderDraftItemModel(
      laundryServiceId: entity.laundryServiceId,
      priceId: entity.priceId,
      serviceName: entity.serviceName,
      quantity: entity.quantity,
      unitPrice: entity.unitPrice,
      subtotal: entity.subtotal,
      notes: entity.notes,
    );
  }

  OrderDraftItem toEntity() {
    return OrderDraftItem(
      laundryServiceId: laundryServiceId,
      priceId: priceId,
      serviceName: serviceName,
      quantity: quantity,
      unitPrice: unitPrice,
      subtotal: subtotal,
      notes: notes,
    );
  }
}
