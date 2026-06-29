import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/deposit.dart';
import '../helpers/json_converters.dart';

part 'deposit_model.freezed.dart';
part 'deposit_model.g.dart';

@freezed
class DepositModel with _$DepositModel {
  const factory DepositModel({
    required int id,
    required String code,
    required int ownerId,
    required int outletId,
    int? cashierId,
    int? sourceAccountId,
    int? destinationAccountId,
    required double amount,
    String? formattedAmount,
    String? notes,
    String? attachmentPath,
    String? attachmentUrl,
    required String status,
    @Default('') String statusLabel,
    @Default('') String statusColor,
    int? approvedBy,
    String? approvedAt,
    String? approvedAtFormatted,
    String? rejectionReason,
    int? journalEntryId,
    required String createdAt,
    required String updatedAt,
    String? createdAtFormatted,
    String? createdAtHuman,
    Map<String, dynamic>? cashier,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? destinationAccount,
    Map<String, dynamic>? approvedByUser,
    Map<String, dynamic>? journalEntry,
  }) = _DepositModel;

  const DepositModel._();

  factory DepositModel.fromJson(Map<String, dynamic> json) =>
      _$DepositModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['ownerId'] = toInt(json['ownerId'] ?? json['owner_id']);
    normalized['outletId'] = toInt(json['outletId'] ?? json['outlet_id']);
    normalized['cashierId'] = toIntOrNull(
      json['cashierId'] ?? json['cashier_id'] ?? json['employee_id'],
    );
    normalized['sourceAccountId'] = toIntOrNull(
      json['sourceAccountId'] ?? json['source_account_id'],
    );
    normalized['destinationAccountId'] = toIntOrNull(
      json['destinationAccountId'] ?? json['destination_account_id'],
    );
    normalized['amount'] = toDouble(json['amount']);
    normalized['status'] = json['status'] ?? 'pending';
    normalized['journalEntryId'] = toIntOrNull(
      json['journalEntryId'] ?? json['journal_entry_id'],
    );

    return normalized;
  }
}

extension DepositModelX on DepositModel {
  Deposit toEntity() => Deposit(
    id: id,
    code: code,
    ownerId: ownerId,
    outletId: outletId,
    cashierId: cashierId,
    sourceAccountId: sourceAccountId,
    destinationAccountId: destinationAccountId,
    amount: amount,
    formattedAmount: formattedAmount,
    notes: notes,
    attachmentPath: attachmentPath,
    attachmentUrl: attachmentUrl,
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
    destinationAccount: destinationAccount,
    approvedByUser: approvedByUser,
    journalEntry: journalEntry,
  );
}
