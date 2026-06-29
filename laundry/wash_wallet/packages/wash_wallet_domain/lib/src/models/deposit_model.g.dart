// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'deposit_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DepositModelImpl _$$DepositModelImplFromJson(Map<String, dynamic> json) =>
    _$DepositModelImpl(
      id: (json['id'] as num).toInt(),
      code: json['code'] as String,
      ownerId: (json['ownerId'] as num).toInt(),
      outletId: (json['outletId'] as num).toInt(),
      cashierId: (json['cashierId'] as num?)?.toInt(),
      sourceAccountId: (json['sourceAccountId'] as num?)?.toInt(),
      destinationAccountId: (json['destinationAccountId'] as num?)?.toInt(),
      amount: (json['amount'] as num).toDouble(),
      formattedAmount: json['formattedAmount'] as String?,
      notes: json['notes'] as String?,
      attachmentPath: json['attachmentPath'] as String?,
      attachmentUrl: json['attachmentUrl'] as String?,
      status: json['status'] as String,
      statusLabel: json['statusLabel'] as String? ?? '',
      statusColor: json['statusColor'] as String? ?? '',
      approvedBy: (json['approvedBy'] as num?)?.toInt(),
      approvedAt: json['approvedAt'] as String?,
      approvedAtFormatted: json['approvedAtFormatted'] as String?,
      rejectionReason: json['rejectionReason'] as String?,
      journalEntryId: (json['journalEntryId'] as num?)?.toInt(),
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      createdAtFormatted: json['createdAtFormatted'] as String?,
      createdAtHuman: json['createdAtHuman'] as String?,
      cashier: json['cashier'] as Map<String, dynamic>?,
      outlet: json['outlet'] as Map<String, dynamic>?,
      sourceAccount: json['sourceAccount'] as Map<String, dynamic>?,
      destinationAccount: json['destinationAccount'] as Map<String, dynamic>?,
      approvedByUser: json['approvedByUser'] as Map<String, dynamic>?,
      journalEntry: json['journalEntry'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$DepositModelImplToJson(_$DepositModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': instance.code,
      'ownerId': instance.ownerId,
      'outletId': instance.outletId,
      'cashierId': instance.cashierId,
      'sourceAccountId': instance.sourceAccountId,
      'destinationAccountId': instance.destinationAccountId,
      'amount': instance.amount,
      'formattedAmount': instance.formattedAmount,
      'notes': instance.notes,
      'attachmentPath': instance.attachmentPath,
      'attachmentUrl': instance.attachmentUrl,
      'status': instance.status,
      'statusLabel': instance.statusLabel,
      'statusColor': instance.statusColor,
      'approvedBy': instance.approvedBy,
      'approvedAt': instance.approvedAt,
      'approvedAtFormatted': instance.approvedAtFormatted,
      'rejectionReason': instance.rejectionReason,
      'journalEntryId': instance.journalEntryId,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
      'createdAtFormatted': instance.createdAtFormatted,
      'createdAtHuman': instance.createdAtHuman,
      'cashier': instance.cashier,
      'outlet': instance.outlet,
      'sourceAccount': instance.sourceAccount,
      'destinationAccount': instance.destinationAccount,
      'approvedByUser': instance.approvedByUser,
      'journalEntry': instance.journalEntry,
    };
