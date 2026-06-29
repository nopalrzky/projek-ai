import 'package:equatable/equatable.dart';

class OrderItemProcess extends Equatable {
  final int id;
  final int? orderItemId;
  final int? laundryServiceProcessId;
  final int? processId;
  final String? processName;
  final int? sequenceNumber;
  final String? status;
  final String? statusLabel;
  final int? employeeId;
  final String? employeeName;
  final double? qtyProcessed;
  final String? evidenceAttachment;
  final String? evidenceUrl;
  final bool hasEvidence;
  final bool canStart;
  final bool canComplete;
  final bool canWork;
  final String? actionDeniedReason;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final String? formattedStartedAt;
  final String? formattedCompletedAt;
  final bool isCompleted;
  final bool isInProgress;
  final bool isPending;
  final int? processingDuration;
  final double? completionPercentage;
  final double? commissionAmount;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? formattedCreatedAt;
  final String? formattedUpdatedAt;

  const OrderItemProcess({
    required this.id,
    this.orderItemId,
    this.laundryServiceProcessId,
    this.processId,
    this.processName,
    this.sequenceNumber,
    this.status,
    this.statusLabel,
    this.employeeId,
    this.employeeName,
    this.qtyProcessed,
    this.evidenceAttachment,
    this.evidenceUrl,
    this.hasEvidence = false,
    this.canStart = false,
    this.canComplete = false,
    this.canWork = false,
    this.actionDeniedReason,
    this.startedAt,
    this.completedAt,
    this.formattedStartedAt,
    this.formattedCompletedAt,
    this.isCompleted = false,
    this.isInProgress = false,
    this.isPending = false,
    this.processingDuration,
    this.completionPercentage,
    this.commissionAmount,
    this.createdAt,
    this.updatedAt,
    this.formattedCreatedAt,
    this.formattedUpdatedAt,
  });

  factory OrderItemProcess.fromModel(dynamic model) {
    return OrderItemProcess(
      id: model.id,
      orderItemId: model.orderItemId,
      laundryServiceProcessId: model.laundryServiceProcessId,
      processId: model.processId,
      processName: model.processName,
      sequenceNumber: model.sequenceNumber,
      status: model.status,
      statusLabel: model.statusLabel,
      employeeId: model.employeeId,
      employeeName: model.employeeName,
      qtyProcessed: model.qtyProcessed,
      evidenceAttachment: model.evidenceAttachment,
      evidenceUrl: model.evidenceUrl,
      hasEvidence: model.hasEvidence,
      canStart: model.canStart,
      canComplete: model.canComplete,
      canWork: model.canWork,
      actionDeniedReason: model.actionDeniedReason,
      startedAt: model.startedAt,
      completedAt: model.completedAt,
      formattedStartedAt: model.formattedStartedAt,
      formattedCompletedAt: model.formattedCompletedAt,
      isCompleted: model.isCompleted,
      isInProgress: model.isInProgress,
      isPending: model.isPending,
      processingDuration: model.processingDuration,
      completionPercentage: model.completionPercentage,
      commissionAmount: model.commissionAmount,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      formattedCreatedAt: model.formattedCreatedAt,
      formattedUpdatedAt: model.formattedUpdatedAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    orderItemId,
    laundryServiceProcessId,
    processId,
    processName,
    sequenceNumber,
    status,
    statusLabel,
    employeeId,
    employeeName,
    qtyProcessed,
    evidenceAttachment,
    evidenceUrl,
    hasEvidence,
    canStart,
    canComplete,
    canWork,
    actionDeniedReason,
    startedAt,
    completedAt,
    formattedStartedAt,
    formattedCompletedAt,
    isCompleted,
    isInProgress,
    isPending,
    processingDuration,
    completionPercentage,
    commissionAmount,
    createdAt,
    updatedAt,
    formattedCreatedAt,
    formattedUpdatedAt,
  ];
}
