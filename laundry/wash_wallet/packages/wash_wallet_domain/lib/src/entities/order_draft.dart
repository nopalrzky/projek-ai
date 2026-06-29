import 'package:equatable/equatable.dart';

class OrderDraftItem extends Equatable {
  final int laundryServiceId;
  final int? priceId;
  final String? serviceName;
  final double quantity;
  final double? unitPrice;
  final double? subtotal;
  final String? notes;

  const OrderDraftItem({
    required this.laundryServiceId,
    this.priceId,
    this.serviceName,
    required this.quantity,
    this.unitPrice,
    this.subtotal,
    this.notes,
  });

  factory OrderDraftItem.fromModel(dynamic model) {
    return OrderDraftItem(
      laundryServiceId: model.laundryServiceId,
      priceId: model.priceId,
      serviceName: model.serviceName,
      quantity: model.quantity,
      unitPrice: model.unitPrice,
      subtotal: model.subtotal,
      notes: model.notes,
    );
  }

  @override
  List<Object?> get props => [
        laundryServiceId,
        priceId,
        serviceName,
        quantity,
        unitPrice,
        subtotal,
        notes,
      ];
}

class OrderDraft extends Equatable {
  final int outletId;
  final int customerId;
  final int? employeeId;
  final List<OrderDraftItem> items;
  final String? notes;
  final DateTime? estimatedCompletion;
  final String? paymentStatus;
  final String? paymentMethod;
  final int? paymentAccountId;
  final double? paidAmount;
  final String status; // 'editing', 'submit_failed'
  final String? clientRequestId;
  final String? lastError;
  final DateTime updatedAt;
  final int version;

  const OrderDraft({
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
    this.version = 2,
  });

  factory OrderDraft.fromModel(dynamic model) {
    return OrderDraft(
      outletId: model.outletId,
      customerId: model.customerId,
      employeeId: model.employeeId,
      items: (model.items as List)
          .map((e) => OrderDraftItem.fromModel(e))
          .toList(),
      notes: model.notes,
      estimatedCompletion: model.estimatedCompletion,
      paymentStatus: model.paymentStatus,
      paymentMethod: model.paymentMethod,
      paymentAccountId: model.paymentAccountId,
      paidAmount: model.paidAmount,
      status: model.status ?? 'editing',
      clientRequestId: model.clientRequestId,
      lastError: model.lastError,
      updatedAt: model.updatedAt,
      version: model.version ?? 2,
    );
  }

  OrderDraft copyWith({
    int? outletId,
    int? customerId,
    int? employeeId,
    List<OrderDraftItem>? items,
    String? notes,
    DateTime? estimatedCompletion,
    String? paymentStatus,
    String? paymentMethod,
    int? paymentAccountId,
    double? paidAmount,
    String? status,
    String? clientRequestId,
    String? lastError,
    DateTime? updatedAt,
    int? version,
  }) {
    return OrderDraft(
      outletId: outletId ?? this.outletId,
      customerId: customerId ?? this.customerId,
      employeeId: employeeId ?? this.employeeId,
      items: items ?? this.items,
      notes: notes ?? this.notes,
      estimatedCompletion: estimatedCompletion ?? this.estimatedCompletion,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentAccountId: paymentAccountId ?? this.paymentAccountId,
      paidAmount: paidAmount ?? this.paidAmount,
      status: status ?? this.status,
      clientRequestId: clientRequestId ?? this.clientRequestId,
      lastError: lastError ?? this.lastError,
      updatedAt: updatedAt ?? this.updatedAt,
      version: version ?? this.version,
    );
  }

  @override
  List<Object?> get props => [
        outletId,
        customerId,
        employeeId,
        items,
        notes,
        estimatedCompletion,
        paymentStatus,
        paymentMethod,
        paymentAccountId,
        paidAmount,
        status,
        clientRequestId,
        lastError,
        updatedAt,
        version,
      ];
}
