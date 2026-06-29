import '../helpers/json_converters.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/order_item.dart';
import 'order_item_process_model.dart';

part 'order_item_model.freezed.dart';
part 'order_item_model.g.dart';

@freezed
class OrderItemModel with _$OrderItemModel {
  const factory OrderItemModel({
    required int id,
    required int orderId,
    int? laundryServiceId,
    String? categoryName,
    String? laundryServiceName,
    String? unitName,
    @Default(0) double quantity,
    @Default(0) double unitPrice,
    @Default(0) double subtotal,
    @Default(0) double discountAmount,
    @Default(0) double totalAmount,
    String? formattedSubtotal,
    String? formattedDiscountAmount,
    String? formattedTotalAmount,
    required String status,
    String? statusLabel,
    @Default(0) int completionPercentage,
    String? itemNotes,
    @Default(false) bool canCompleteOrderItem,
    String? completeOrderItemReason,
    dynamic processedBy,
    dynamic processingData,
    List<OrderItemProcessModel>? orderItemProcesses,
    String? startedAt,
    String? completedAt,
    String? formattedStartedAt,
    String? formattedCompletedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
  }) = _OrderItemModel;

  const OrderItemModel._();

  factory OrderItemModel.fromJson(Map<String, dynamic> json) =>
      _$OrderItemModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['orderId'] = toInt(json['orderId'] ?? json['order_id']);
    normalized['laundryServiceId'] = toIntOrNull(
      json['laundryServiceId'] ?? json['laundry_service_id'],
    );
    normalized['quantity'] = toDouble(json['quantity']);
    normalized['unitPrice'] = toDouble(json['unitPrice'] ?? json['unit_price']);
    normalized['subtotal'] = toDouble(json['subtotal']);
    normalized['discountAmount'] = toDouble(
      json['discountAmount'] ?? json['discount_amount'],
    );
    normalized['totalAmount'] = toDouble(
      json['totalAmount'] ?? json['total_amount'],
    );
    normalized['status'] = json['status'] ?? 'pending';
    normalized['completionPercentage'] = toInt(
      json['completionPercentage'] ?? json['completion_percentage'],
    );
    normalized['canCompleteOrderItem'] = toBool(
      json['canCompleteOrderItem'] ?? json['can_complete_order_item'],
    );

    return normalized;
  }

  factory OrderItemModel.fromEntity(OrderItem entity) => OrderItemModel(
    id: entity.id,
    orderId: entity.orderId,
    laundryServiceId: entity.laundryServiceId,
    categoryName: entity.categoryName,
    laundryServiceName: entity.laundryServiceName,
    unitName: entity.unitName,
    quantity: entity.quantity,
    unitPrice: entity.unitPrice,
    subtotal: entity.subtotal,
    discountAmount: entity.discountAmount,
    totalAmount: entity.totalAmount,
    formattedSubtotal: entity.formattedSubtotal,
    formattedDiscountAmount: entity.formattedDiscountAmount,
    formattedTotalAmount: entity.formattedTotalAmount,
    status: entity.status,
    statusLabel: entity.statusLabel,
    completionPercentage: entity.completionPercentage,
    itemNotes: entity.itemNotes,
    canCompleteOrderItem: entity.canCompleteOrderItem,
    completeOrderItemReason: entity.completeOrderItemReason,
    processedBy: entity.processedBy,
    processingData: entity.processingData,
    orderItemProcesses: entity.orderItemProcesses
        ?.map((process) => OrderItemProcessModel.fromEntity(process))
        .toList(),
    startedAt: entity.startedAt,
    completedAt: entity.completedAt,
    formattedStartedAt: entity.formattedStartedAt,
    formattedCompletedAt: entity.formattedCompletedAt,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    formattedCreatedAt: entity.formattedCreatedAt,
    formattedUpdatedAt: entity.formattedUpdatedAt,
  );
}

extension OrderItemModelX on OrderItemModel {
  OrderItem toEntity() => OrderItem(
    id: id,
    orderId: orderId,
    laundryServiceId: laundryServiceId,
    categoryName: categoryName,
    laundryServiceName: laundryServiceName,
    unitName: unitName,
    quantity: quantity,
    unitPrice: unitPrice,
    subtotal: subtotal,
    discountAmount: discountAmount,
    totalAmount: totalAmount,
    formattedSubtotal: formattedSubtotal,
    formattedDiscountAmount: formattedDiscountAmount,
    formattedTotalAmount: formattedTotalAmount,
    status: status,
    statusLabel: statusLabel,
    completionPercentage: completionPercentage,
    itemNotes: itemNotes,
    canCompleteOrderItem: canCompleteOrderItem,
    completeOrderItemReason: completeOrderItemReason,
    processedBy: processedBy,
    processingData: processingData,
    orderItemProcesses: orderItemProcesses?.map((p) => p.toEntity()).toList(),
    startedAt: startedAt,
    completedAt: completedAt,
    formattedStartedAt: formattedStartedAt,
    formattedCompletedAt: formattedCompletedAt,
    createdAt: createdAt,
    updatedAt: updatedAt,
    formattedCreatedAt: formattedCreatedAt,
    formattedUpdatedAt: formattedUpdatedAt,
  );
}
