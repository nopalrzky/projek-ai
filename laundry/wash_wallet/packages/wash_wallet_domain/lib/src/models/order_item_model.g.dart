// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_item_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OrderItemModelImpl _$$OrderItemModelImplFromJson(
  Map<String, dynamic> json,
) => _$OrderItemModelImpl(
  id: (json['id'] as num).toInt(),
  orderId: (json['orderId'] as num).toInt(),
  laundryServiceId: (json['laundryServiceId'] as num?)?.toInt(),
  categoryName: json['categoryName'] as String?,
  laundryServiceName: json['laundryServiceName'] as String?,
  unitName: json['unitName'] as String?,
  quantity: (json['quantity'] as num?)?.toDouble() ?? 0,
  unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0,
  subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0,
  discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0,
  totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
  formattedSubtotal: json['formattedSubtotal'] as String?,
  formattedDiscountAmount: json['formattedDiscountAmount'] as String?,
  formattedTotalAmount: json['formattedTotalAmount'] as String?,
  status: json['status'] as String,
  statusLabel: json['statusLabel'] as String?,
  completionPercentage: (json['completionPercentage'] as num?)?.toInt() ?? 0,
  itemNotes: json['itemNotes'] as String?,
  canCompleteOrderItem: json['canCompleteOrderItem'] as bool? ?? false,
  completeOrderItemReason: json['completeOrderItemReason'] as String?,
  processedBy: json['processedBy'],
  processingData: json['processingData'],
  orderItemProcesses: (json['orderItemProcesses'] as List<dynamic>?)
      ?.map((e) => OrderItemProcessModel.fromJson(e as Map<String, dynamic>))
      .toList(),
  startedAt: json['startedAt'] as String?,
  completedAt: json['completedAt'] as String?,
  formattedStartedAt: json['formattedStartedAt'] as String?,
  formattedCompletedAt: json['formattedCompletedAt'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  formattedCreatedAt: json['formattedCreatedAt'] as String?,
  formattedUpdatedAt: json['formattedUpdatedAt'] as String?,
);

Map<String, dynamic> _$$OrderItemModelImplToJson(
  _$OrderItemModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'orderId': instance.orderId,
  'laundryServiceId': instance.laundryServiceId,
  'categoryName': instance.categoryName,
  'laundryServiceName': instance.laundryServiceName,
  'unitName': instance.unitName,
  'quantity': instance.quantity,
  'unitPrice': instance.unitPrice,
  'subtotal': instance.subtotal,
  'discountAmount': instance.discountAmount,
  'totalAmount': instance.totalAmount,
  'formattedSubtotal': instance.formattedSubtotal,
  'formattedDiscountAmount': instance.formattedDiscountAmount,
  'formattedTotalAmount': instance.formattedTotalAmount,
  'status': instance.status,
  'statusLabel': instance.statusLabel,
  'completionPercentage': instance.completionPercentage,
  'itemNotes': instance.itemNotes,
  'canCompleteOrderItem': instance.canCompleteOrderItem,
  'completeOrderItemReason': instance.completeOrderItemReason,
  'processedBy': instance.processedBy,
  'processingData': instance.processingData,
  'orderItemProcesses': instance.orderItemProcesses,
  'startedAt': instance.startedAt,
  'completedAt': instance.completedAt,
  'formattedStartedAt': instance.formattedStartedAt,
  'formattedCompletedAt': instance.formattedCompletedAt,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  'formattedCreatedAt': instance.formattedCreatedAt,
  'formattedUpdatedAt': instance.formattedUpdatedAt,
};
