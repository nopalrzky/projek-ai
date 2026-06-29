// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'petty_cash_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PettyCashModelImpl _$$PettyCashModelImplFromJson(Map<String, dynamic> json) =>
    _$PettyCashModelImpl(
      id: (json['id'] as num).toInt(),
      code: json['code'] as String?,
      ownerId: (json['ownerId'] as num?)?.toInt(),
      outletId: (json['outletId'] as num?)?.toInt(),
      cashierId: (json['cashierId'] as num?)?.toInt(),
      sourceAccountId: (json['sourceAccountId'] as num?)?.toInt(),
      amount: (json['amount'] as num).toDouble(),
      formattedAmount: json['formattedAmount'] as String?,
      description: json['description'] as String?,
      requestDate: json['requestDate'] as String?,
      requestDateFormatted: json['requestDateFormatted'] as String?,
      status: json['status'] as String,
      statusLabel: json['statusLabel'] as String?,
      statusColor: json['statusColor'] as String?,
      approvedBy: (json['approvedBy'] as num?)?.toInt(),
      approvedAt: json['approvedAt'] as String?,
      approvedAtFormatted: json['approvedAtFormatted'] as String?,
      rejectionReason: json['rejectionReason'] as String?,
      journalEntryId: (json['journalEntryId'] as num?)?.toInt(),
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
      createdAtFormatted: json['createdAtFormatted'] as String?,
      createdAtHuman: json['createdAtHuman'] as String?,
      cashier: json['cashier'] as Map<String, dynamic>?,
      outlet: json['outlet'] as Map<String, dynamic>?,
      sourceAccount: json['sourceAccount'] as Map<String, dynamic>?,
      approvedByUser: json['approvedByUser'] as Map<String, dynamic>?,
      journalEntry: json['journalEntry'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$PettyCashModelImplToJson(
  _$PettyCashModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'code': instance.code,
  'ownerId': instance.ownerId,
  'outletId': instance.outletId,
  'cashierId': instance.cashierId,
  'sourceAccountId': instance.sourceAccountId,
  'amount': instance.amount,
  'formattedAmount': instance.formattedAmount,
  'description': instance.description,
  'requestDate': instance.requestDate,
  'requestDateFormatted': instance.requestDateFormatted,
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
  'approvedByUser': instance.approvedByUser,
  'journalEntry': instance.journalEntry,
};
