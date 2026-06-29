import '../entities/weighing_draft.dart';

class WeighingDraftItemModel extends WeighingDraftItem {
  const WeighingDraftItemModel({
    required super.laundryServiceId,
    required super.serviceName,
    required super.qty,
    required super.price,
    super.itemNotes,
  });

  factory WeighingDraftItemModel.fromEntity(WeighingDraftItem entity) {
    return WeighingDraftItemModel(
      laundryServiceId: entity.laundryServiceId,
      serviceName: entity.serviceName,
      qty: entity.qty,
      price: entity.price,
      itemNotes: entity.itemNotes,
    );
  }

  factory WeighingDraftItemModel.fromJson(Map<String, dynamic> json) {
    return WeighingDraftItemModel(
      laundryServiceId: json['laundryServiceId'] as int,
      serviceName: json['serviceName'] as String,
      qty: (json['qty'] as num).toDouble(),
      price: (json['price'] as num).toDouble(),
      itemNotes: json['itemNotes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'laundryServiceId': laundryServiceId,
      'serviceName': serviceName,
      'qty': qty,
      'price': price,
      'itemNotes': itemNotes,
    };
  }

  WeighingDraftItem toEntity() {
    return WeighingDraftItem(
      laundryServiceId: laundryServiceId,
      serviceName: serviceName,
      qty: qty,
      price: price,
      itemNotes: itemNotes,
    );
  }
}

class WeighingDraftModel extends WeighingDraft {
  const WeighingDraftModel({
    required super.outletId,
    required super.orderId,
    required super.employeeId,
    required super.weight,
    required super.additionalItems,
    super.paymentMethod,
    super.paymentStatus,
    super.paymentAccountId,
    super.paidAmount,
    super.orderNotes,
    super.internalNotes,
    super.photoLocalPath,
    super.photoUploadStatus,
    required super.clientRequestId,
    super.status,
    super.lastError,
    required super.updatedAt,
    super.version,
  });

  factory WeighingDraftModel.fromEntity(WeighingDraft entity) {
    return WeighingDraftModel(
      outletId: entity.outletId,
      orderId: entity.orderId,
      employeeId: entity.employeeId,
      weight: entity.weight,
      additionalItems: entity.additionalItems,
      paymentMethod: entity.paymentMethod,
      paymentStatus: entity.paymentStatus,
      paymentAccountId: entity.paymentAccountId,
      paidAmount: entity.paidAmount,
      orderNotes: entity.orderNotes,
      internalNotes: entity.internalNotes,
      photoLocalPath: entity.photoLocalPath,
      photoUploadStatus: entity.photoUploadStatus,
      clientRequestId: entity.clientRequestId,
      status: entity.status,
      lastError: entity.lastError,
      updatedAt: entity.updatedAt,
      version: entity.version,
    );
  }

  factory WeighingDraftModel.fromJson(Map<String, dynamic> json) {
    return WeighingDraftModel(
      outletId: json['outletId'] as int? ?? 0,
      orderId: json['orderId'] as int,
      employeeId: json['employeeId'] as int,
      weight: (json['weight'] as num?)?.toDouble() ?? 0.0,
      additionalItems: (json['additionalItems'] as List<dynamic>?)
              ?.map((e) => WeighingDraftItemModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      paymentMethod: json['paymentMethod'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
      paymentAccountId: json['paymentAccountId'] as int?,
      paidAmount: (json['paidAmount'] as num?)?.toDouble(),
      orderNotes: json['orderNotes'] as String?,
      internalNotes: json['internalNotes'] as String?,
      photoLocalPath: json['photoLocalPath'] as String?,
      photoUploadStatus: json['photoUploadStatus'] as String?,
      clientRequestId: json['clientRequestId'] as String? ?? '',
      status: json['status'] as String? ?? 'editing',
      lastError: json['lastError'] as String?,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : DateTime.now(),
      version: json['version'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'outletId': outletId,
      'orderId': orderId,
      'employeeId': employeeId,
      'weight': weight,
      'additionalItems': additionalItems
          .map((e) => WeighingDraftItemModel.fromEntity(e).toJson())
          .toList(),
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'paymentAccountId': paymentAccountId,
      'paidAmount': paidAmount,
      'orderNotes': orderNotes,
      'internalNotes': internalNotes,
      'photoLocalPath': photoLocalPath,
      'photoUploadStatus': photoUploadStatus,
      'clientRequestId': clientRequestId,
      'status': status,
      'lastError': lastError,
      'updatedAt': updatedAt.toIso8601String(),
      'version': version,
    };
  }

  WeighingDraft toEntity() {
    return WeighingDraft(
      outletId: outletId,
      orderId: orderId,
      employeeId: employeeId,
      weight: weight,
      additionalItems: additionalItems,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paymentAccountId: paymentAccountId,
      paidAmount: paidAmount,
      orderNotes: orderNotes,
      internalNotes: internalNotes,
      photoLocalPath: photoLocalPath,
      photoUploadStatus: photoUploadStatus,
      clientRequestId: clientRequestId,
      status: status,
      lastError: lastError,
      updatedAt: updatedAt,
      version: version,
    );
  }
}
