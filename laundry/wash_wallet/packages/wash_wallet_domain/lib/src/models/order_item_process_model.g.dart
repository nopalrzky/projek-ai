// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_item_process_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OrderItemProcessModelImpl _$$OrderItemProcessModelImplFromJson(
  Map<String, dynamic> json,
) => _$OrderItemProcessModelImpl(
  id: (json['id'] as num).toInt(),
  orderItemId: (json['orderItemId'] as num?)?.toInt(),
  laundryServiceProcessId: (json['laundryServiceProcessId'] as num?)?.toInt(),
  processId: (json['processId'] as num?)?.toInt(),
  processName: json['processName'] as String?,
  sequenceNumber: (json['sequenceNumber'] as num?)?.toInt(),
  status: json['status'] as String?,
  statusLabel: json['statusLabel'] as String?,
  employeeId: (json['employeeId'] as num?)?.toInt(),
  employeeName: json['employeeName'] as String?,
  qtyProcessed: (json['qtyProcessed'] as num?)?.toDouble(),
  evidenceAttachment: json['evidenceAttachment'] as String?,
  evidenceUrl: json['evidenceUrl'] as String?,
  hasEvidence: json['hasEvidence'] as bool? ?? false,
  canStart: json['canStart'] as bool? ?? false,
  canComplete: json['canComplete'] as bool? ?? false,
  canWork: json['canWork'] as bool? ?? false,
  actionDeniedReason: json['actionDeniedReason'] as String?,
  startedAt: json['startedAt'] == null
      ? null
      : DateTime.parse(json['startedAt'] as String),
  completedAt: json['completedAt'] == null
      ? null
      : DateTime.parse(json['completedAt'] as String),
  formattedStartedAt: json['formattedStartedAt'] as String?,
  formattedCompletedAt: json['formattedCompletedAt'] as String?,
  isCompleted: json['isCompleted'] as bool? ?? false,
  isInProgress: json['isInProgress'] as bool? ?? false,
  isPending: json['isPending'] as bool? ?? false,
  processingDuration: (json['processingDuration'] as num?)?.toInt(),
  completionPercentage: (json['completionPercentage'] as num?)?.toDouble(),
  commissionAmount: (json['commissionAmount'] as num?)?.toDouble(),
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  formattedCreatedAt: json['formattedCreatedAt'] as String?,
  formattedUpdatedAt: json['formattedUpdatedAt'] as String?,
);

Map<String, dynamic> _$$OrderItemProcessModelImplToJson(
  _$OrderItemProcessModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'orderItemId': instance.orderItemId,
  'laundryServiceProcessId': instance.laundryServiceProcessId,
  'processId': instance.processId,
  'processName': instance.processName,
  'sequenceNumber': instance.sequenceNumber,
  'status': instance.status,
  'statusLabel': instance.statusLabel,
  'employeeId': instance.employeeId,
  'employeeName': instance.employeeName,
  'qtyProcessed': instance.qtyProcessed,
  'evidenceAttachment': instance.evidenceAttachment,
  'evidenceUrl': instance.evidenceUrl,
  'hasEvidence': instance.hasEvidence,
  'canStart': instance.canStart,
  'canComplete': instance.canComplete,
  'canWork': instance.canWork,
  'actionDeniedReason': instance.actionDeniedReason,
  'startedAt': instance.startedAt?.toIso8601String(),
  'completedAt': instance.completedAt?.toIso8601String(),
  'formattedStartedAt': instance.formattedStartedAt,
  'formattedCompletedAt': instance.formattedCompletedAt,
  'isCompleted': instance.isCompleted,
  'isInProgress': instance.isInProgress,
  'isPending': instance.isPending,
  'processingDuration': instance.processingDuration,
  'completionPercentage': instance.completionPercentage,
  'commissionAmount': instance.commissionAmount,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  'formattedCreatedAt': instance.formattedCreatedAt,
  'formattedUpdatedAt': instance.formattedUpdatedAt,
};
