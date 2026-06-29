import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/petty_cash.dart';
import '../helpers/json_converters.dart';

part 'petty_cash_model.freezed.dart';
part 'petty_cash_model.g.dart';

@freezed
class PettyCashModel with _$PettyCashModel {
  const factory PettyCashModel({
    required int id,
    String? code,
    int? ownerId,
    int? outletId,
    int? cashierId,
    int? sourceAccountId,
    required double amount,
    String? formattedAmount,
    String? description,
    String? requestDate,
    String? requestDateFormatted,
    required String status,
    String? statusLabel,
    String? statusColor,
    int? approvedBy,
    String? approvedAt,
    String? approvedAtFormatted,
    String? rejectionReason,
    int? journalEntryId,
    String? createdAt,
    String? updatedAt,
    String? createdAtFormatted,
    String? createdAtHuman,

    // Relational data
    Map<String, dynamic>? cashier,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? approvedByUser,
    Map<String, dynamic>? journalEntry,
  }) = _PettyCashModel;

  const PettyCashModel._();

  factory PettyCashModel.fromJson(Map<String, dynamic> json) =>
      _$PettyCashModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['ownerId'] = toIntOrNull(json['ownerId'] ?? json['owner_id']);
    normalized['outletId'] = toIntOrNull(json['outletId'] ?? json['outlet_id']);
    normalized['cashierId'] = toIntOrNull(
      json['cashierId'] ?? json['cashier_id'],
    );
    normalized['sourceAccountId'] = toIntOrNull(
      json['sourceAccountId'] ?? json['source_account_id'],
    );
    normalized['journalEntryId'] = toIntOrNull(
      json['journalEntryId'] ?? json['journal_entry_id'],
    );
    normalized['approvedBy'] = toIntOrNull(
      json['approvedBy'] ?? json['approved_by'],
    );
    normalized['amount'] = toDouble(json['amount']);
    normalized['status'] = json['status'] ?? 'pending';

    normalized['formattedAmount'] =
        json['formattedAmount'] ?? json['formatted_amount'];
    normalized['requestDate'] = json['requestDate'] ?? json['request_date'];
    normalized['requestDateFormatted'] =
        json['requestDateFormatted'] ?? json['request_date_formatted'];
    normalized['statusLabel'] = json['statusLabel'] ?? json['status_label'];
    normalized['statusColor'] = json['statusColor'] ?? json['status_color'];
    normalized['approvedAt'] = json['approvedAt'] ?? json['approved_at'];
    normalized['approvedAtFormatted'] =
        json['approvedAtFormatted'] ?? json['approved_at_formatted'];
    normalized['rejectionReason'] =
        json['rejectionReason'] ?? json['rejection_reason'];
    normalized['createdAt'] = json['createdAt'] ?? json['created_at'];
    normalized['updatedAt'] = json['updatedAt'] ?? json['updated_at'];
    normalized['createdAtFormatted'] =
        json['createdAtFormatted'] ?? json['created_at_formatted'];
    normalized['createdAtHuman'] =
        json['createdAtHuman'] ?? json['created_at_human'];

    normalized['approvedByUser'] =
        json['approvedByUser'] ?? json['approved_by_user'];
    normalized['sourceAccount'] =
        json['sourceAccount'] ?? json['source_account'];
    normalized['journalEntry'] = json['journalEntry'] ?? json['journal_entry'];

    return normalized;
  }

  PettyCash toEntity() => PettyCash(
    id: id,
    code: code,
    ownerId: ownerId,
    outletId: outletId,
    cashierId: cashierId,
    sourceAccountId: sourceAccountId,
    amount: amount,
    formattedAmount: formattedAmount,
    description: description,
    requestDate: requestDate,
    requestDateFormatted: requestDateFormatted,
    status: status,
    statusLabel: statusLabel,
    statusColor: statusColor,
    approvedBy: approvedBy,
    approvedAt: approvedAt,
    approvedAtFormatted: approvedAtFormatted,
    rejectionReason: rejectionReason,
    journalEntryId: journalEntryId,
    createdAt: createdAt,
    updatedAt: updatedAt,
    createdAtFormatted: createdAtFormatted,
    createdAtHuman: createdAtHuman,
    cashier: cashier,
    outlet: outlet,
    sourceAccount: sourceAccount,
    approvedByUser: approvedByUser,
    journalEntry: journalEntry,
  );

  factory PettyCashModel.fromEntity(PettyCash entity) => PettyCashModel(
    id: entity.id,
    code: entity.code,
    ownerId: entity.ownerId,
    outletId: entity.outletId,
    cashierId: entity.cashierId,
    sourceAccountId: entity.sourceAccountId,
    amount: entity.amount,
    formattedAmount: entity.formattedAmount,
    description: entity.description,
    requestDate: entity.requestDate,
    requestDateFormatted: entity.requestDateFormatted,
    status: entity.status,
    statusLabel: entity.statusLabel,
    statusColor: entity.statusColor,
    approvedBy: entity.approvedBy,
    approvedAt: entity.approvedAt,
    approvedAtFormatted: entity.approvedAtFormatted,
    rejectionReason: entity.rejectionReason,
    journalEntryId: entity.journalEntryId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    createdAtFormatted: entity.createdAtFormatted,
    createdAtHuman: entity.createdAtHuman,
  );
}
