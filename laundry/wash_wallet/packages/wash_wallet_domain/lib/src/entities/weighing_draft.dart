import 'package:equatable/equatable.dart';

class WeighingDraftItem extends Equatable {
  final int laundryServiceId;
  final String serviceName;
  final double qty;
  final double price;
  final String? itemNotes;

  const WeighingDraftItem({
    required this.laundryServiceId,
    required this.serviceName,
    required this.qty,
    required this.price,
    this.itemNotes,
  });

  @override
  List<Object?> get props => [
        laundryServiceId,
        serviceName,
        qty,
        price,
        itemNotes,
      ];
}

class WeighingDraft extends Equatable {
  final int outletId;
  final int orderId;
  final int employeeId;
  final double weight;
  final List<WeighingDraftItem> additionalItems;
  final String? paymentMethod;
  final String? paymentStatus;
  final int? paymentAccountId;
  final double? paidAmount;
  final String? orderNotes;
  final String? internalNotes;
  final String? photoLocalPath;
  final String? photoUploadStatus;
  final String clientRequestId;
  final String status;
  final String? lastError;
  final DateTime updatedAt;
  final int version;

  const WeighingDraft({
    required this.outletId,
    required this.orderId,
    required this.employeeId,
    required this.weight,
    required this.additionalItems,
    this.paymentMethod,
    this.paymentStatus,
    this.paymentAccountId,
    this.paidAmount,
    this.orderNotes,
    this.internalNotes,
    this.photoLocalPath,
    this.photoUploadStatus,
    required this.clientRequestId,
    this.status = 'editing',
    this.lastError,
    required this.updatedAt,
    this.version = 1,
  });

  WeighingDraft copyWith({
    int? outletId,
    int? orderId,
    int? employeeId,
    double? weight,
    List<WeighingDraftItem>? additionalItems,
    String? paymentMethod,
    String? paymentStatus,
    int? paymentAccountId,
    double? paidAmount,
    String? orderNotes,
    String? internalNotes,
    String? photoLocalPath,
    String? photoUploadStatus,
    String? clientRequestId,
    String? status,
    String? lastError,
    DateTime? updatedAt,
    int? version,
  }) {
    return WeighingDraft(
      outletId: outletId ?? this.outletId,
      orderId: orderId ?? this.orderId,
      employeeId: employeeId ?? this.employeeId,
      weight: weight ?? this.weight,
      additionalItems: additionalItems ?? this.additionalItems,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentAccountId: paymentAccountId ?? this.paymentAccountId,
      paidAmount: paidAmount ?? this.paidAmount,
      orderNotes: orderNotes ?? this.orderNotes,
      internalNotes: internalNotes ?? this.internalNotes,
      photoLocalPath: photoLocalPath ?? this.photoLocalPath,
      photoUploadStatus: photoUploadStatus ?? this.photoUploadStatus,
      clientRequestId: clientRequestId ?? this.clientRequestId,
      status: status ?? this.status,
      lastError: lastError ?? this.lastError,
      updatedAt: updatedAt ?? this.updatedAt,
      version: version ?? this.version,
    );
  }

  @override
  List<Object?> get props => [
        outletId,
        orderId,
        employeeId,
        weight,
        additionalItems,
        paymentMethod,
        paymentStatus,
        paymentAccountId,
        paidAmount,
        orderNotes,
        internalNotes,
        photoLocalPath,
        photoUploadStatus,
        clientRequestId,
        status,
        lastError,
        updatedAt,
        version,
      ];
}
