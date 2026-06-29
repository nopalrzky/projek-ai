import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/order_item_process.dart';

part 'order_item_process_model.freezed.dart';
part 'order_item_process_model.g.dart';

@freezed
class OrderItemProcessModel with _$OrderItemProcessModel {
  const factory OrderItemProcessModel({
    required int id,
    int? orderItemId,
    int? laundryServiceProcessId,
    int? processId,
    String? processName,
    int? sequenceNumber,
    String? status,
    String? statusLabel,

    int? employeeId,
    String? employeeName,

    double? qtyProcessed,
    String? evidenceAttachment,
    String? evidenceUrl,
    @Default(false) bool hasEvidence,

    @Default(false) bool canStart,
    @Default(false) bool canComplete,
    @Default(false) bool canWork,
    String? actionDeniedReason,

    DateTime? startedAt,
    DateTime? completedAt,
    String? formattedStartedAt,
    String? formattedCompletedAt,

    @Default(false) bool isCompleted,
    @Default(false) bool isInProgress,
    @Default(false) bool isPending,

    int? processingDuration,
    double? completionPercentage,
    double? commissionAmount,

    DateTime? createdAt,
    DateTime? updatedAt,
    String? formattedCreatedAt,
    String? formattedUpdatedAt,
  }) = _OrderItemProcessModel;

  const OrderItemProcessModel._();

  factory OrderItemProcessModel.fromJson(Map<String, dynamic> json) =>
      _$OrderItemProcessModelFromJson(json);

  factory OrderItemProcessModel.fromEntity(OrderItemProcess entity) =>
      OrderItemProcessModel(
        id: entity.id,
        orderItemId: entity.orderItemId,
        laundryServiceProcessId: entity.laundryServiceProcessId,
        processId: entity.processId,
        processName: entity.processName,
        sequenceNumber: entity.sequenceNumber,
        status: entity.status,
        statusLabel: entity.statusLabel,
        employeeId: entity.employeeId,
        employeeName: entity.employeeName,
        qtyProcessed: entity.qtyProcessed,
        evidenceAttachment: entity.evidenceAttachment,
        evidenceUrl: entity.evidenceUrl,
        hasEvidence: entity.hasEvidence,
        canStart: entity.canStart,
        canComplete: entity.canComplete,
        canWork: entity.canWork,
        actionDeniedReason: entity.actionDeniedReason,
        startedAt: entity.startedAt,
        completedAt: entity.completedAt,
        formattedStartedAt: entity.formattedStartedAt,
        formattedCompletedAt: entity.formattedCompletedAt,
        isCompleted: entity.isCompleted,
        isInProgress: entity.isInProgress,
        isPending: entity.isPending,
        processingDuration: entity.processingDuration,
        completionPercentage: entity.completionPercentage,
        commissionAmount: entity.commissionAmount,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        formattedCreatedAt: entity.formattedCreatedAt,
        formattedUpdatedAt: entity.formattedUpdatedAt,
      );
}

extension OrderItemProcessModelX on OrderItemProcessModel {
  OrderItemProcess toEntity() => OrderItemProcess(
    id: id,
    orderItemId: orderItemId,
    laundryServiceProcessId: laundryServiceProcessId,
    processId: processId,
    processName: processName,
    sequenceNumber: sequenceNumber,
    status: status,
    statusLabel: statusLabel,
    employeeId: employeeId,
    employeeName: employeeName,
    qtyProcessed: qtyProcessed,
    evidenceAttachment: evidenceAttachment,
    evidenceUrl: evidenceUrl,
    hasEvidence: hasEvidence,
    canStart: canStart,
    canComplete: canComplete,
    canWork: canWork,
    actionDeniedReason: actionDeniedReason,
    startedAt: startedAt,
    completedAt: completedAt,
    formattedStartedAt: formattedStartedAt,
    formattedCompletedAt: formattedCompletedAt,
    isCompleted: isCompleted,
    isInProgress: isInProgress,
    isPending: isPending,
    processingDuration: processingDuration,
    completionPercentage: completionPercentage,
    commissionAmount: commissionAmount,
    createdAt: createdAt,
    updatedAt: updatedAt,
    formattedCreatedAt: formattedCreatedAt,
    formattedUpdatedAt: formattedUpdatedAt,
  );
}
