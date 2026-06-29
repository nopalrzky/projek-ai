import 'package:equatable/equatable.dart';
import 'order_item_process.dart';

class OrderItem extends Equatable {
  final int id;
  final int orderId;
  final int? laundryServiceId;
  final String? categoryName;
  final String? laundryServiceName;
  final String? unitName;
  final double quantity;
  final double unitPrice;
  final double subtotal;
  final double discountAmount;
  final double totalAmount;
  final String? formattedSubtotal;
  final String? formattedDiscountAmount;
  final String? formattedTotalAmount;
  final String status;
  final String? statusLabel;
  final int completionPercentage;
  final String? itemNotes;
  final bool canCompleteOrderItem;
  final String? completeOrderItemReason;
  final dynamic processedBy;
  final dynamic processingData;
  final List<OrderItemProcess>? orderItemProcesses;
  final String? startedAt;
  final String? completedAt;
  final String? formattedStartedAt;
  final String? formattedCompletedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? formattedCreatedAt;
  final String? formattedUpdatedAt;

  const OrderItem({
    required this.id,
    required this.orderId,
    this.laundryServiceId,
    this.categoryName,
    this.laundryServiceName,
    this.unitName,
    this.quantity = 0,
    this.unitPrice = 0,
    this.subtotal = 0,
    this.discountAmount = 0,
    this.totalAmount = 0,
    this.formattedSubtotal,
    this.formattedDiscountAmount,
    this.formattedTotalAmount,
    required this.status,
    this.statusLabel,
    this.completionPercentage = 0,
    this.itemNotes,
    this.canCompleteOrderItem = false,
    this.completeOrderItemReason,
    this.processedBy,
    this.processingData,
    this.orderItemProcesses,
    this.startedAt,
    this.completedAt,
    this.formattedStartedAt,
    this.formattedCompletedAt,
    this.createdAt,
    this.updatedAt,
    this.formattedCreatedAt,
    this.formattedUpdatedAt,
  });

  factory OrderItem.fromModel(dynamic model) {
    return OrderItem(
      id: model.id,
      orderId: model.orderId,
      laundryServiceId: model.laundryServiceId,
      categoryName: model.categoryName,
      laundryServiceName: model.laundryServiceName,
      unitName: model.unitName,
      quantity: model.quantity,
      unitPrice: model.unitPrice,
      subtotal: model.subtotal,
      discountAmount: model.discountAmount,
      totalAmount: model.totalAmount,
      formattedSubtotal: model.formattedSubtotal,
      formattedDiscountAmount: model.formattedDiscountAmount,
      formattedTotalAmount: model.formattedTotalAmount,
      status: model.status,
      statusLabel: model.statusLabel,
      completionPercentage: model.completionPercentage,
      itemNotes: model.itemNotes,
      canCompleteOrderItem: model.canCompleteOrderItem,
      completeOrderItemReason: model.completeOrderItemReason,
      processedBy: model.processedBy,
      processingData: model.processingData,
      orderItemProcesses: model.orderItemProcesses
          ?.map((e) => OrderItemProcess.fromModel(e))
          .toList(),
      startedAt: model.startedAt,
      completedAt: model.completedAt,
      formattedStartedAt: model.formattedStartedAt,
      formattedCompletedAt: model.formattedCompletedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      formattedCreatedAt: model.formattedCreatedAt,
      formattedUpdatedAt: model.formattedUpdatedAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    orderId,
    laundryServiceId,
    categoryName,
    laundryServiceName,
    unitName,
    quantity,
    unitPrice,
    subtotal,
    discountAmount,
    totalAmount,
    formattedSubtotal,
    formattedDiscountAmount,
    formattedTotalAmount,
    status,
    statusLabel,
    completionPercentage,
    itemNotes,
    canCompleteOrderItem,
    completeOrderItemReason,
    processedBy,
    processingData,
    orderItemProcesses,
    startedAt,
    completedAt,
    formattedStartedAt,
    formattedCompletedAt,
    createdAt,
    updatedAt,
    formattedCreatedAt,
    formattedUpdatedAt,
  ];
}
