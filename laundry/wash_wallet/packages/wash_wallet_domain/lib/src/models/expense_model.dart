import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/expense.dart';
import '../helpers/json_converters.dart';

part 'expense_model.freezed.dart';
part 'expense_model.g.dart';

@freezed
class ExpenseModel with _$ExpenseModel {
  const factory ExpenseModel({
    required int id,
    required String code,
    required int outletId,
    int? userId,
    int? employeeId,
    required int expenseAccountId,
    required int sourceAccountId,
    required double amount,
    String? date,
    String? description,
    String? attachment,
    String? attachmentUrl,
    @Default(false) bool hasAttachment,
    required String status,
    int? approvedBy,
    String? approvedAt,
    String? rejectionReason,
    int? journalEntryId,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    String? formattedAmount,
    String? formattedDate,
    String? statusLabel,
    String? statusColor,
    @Default(false) bool isPending,
    @Default(false) bool isApproved,
    @Default(false) bool isRejected,
    @Default(false) bool canBeApproved,
    @Default(false) bool canBeRejected,
    @Default(false) bool canBeCancelled,
    Map<String, dynamic>? outlet,
    Map<String, dynamic>? employee,
    Map<String, dynamic>? user,
    Map<String, dynamic>? expenseAccount,
    Map<String, dynamic>? sourceAccount,
    Map<String, dynamic>? approver,
    Map<String, dynamic>? journalEntry,
  }) = _ExpenseModel;

  const ExpenseModel._();

  factory ExpenseModel.fromJson(Map<String, dynamic> json) =>
      _$ExpenseModelFromJson(_normalizeJson(json));

  static Map<String, dynamic> _normalizeJson(Map<String, dynamic> json) {
    if (json.isEmpty) return json;

    final normalized = Map<String, dynamic>.from(json);

    normalized['id'] = toInt(json['id']);
    normalized['outletId'] = toInt(json['outletId'] ?? json['outlet_id']);
    normalized['userId'] = toIntOrNull(json['userId'] ?? json['user_id']);
    normalized['employeeId'] = toIntOrNull(
      json['employeeId'] ?? json['employee_id'],
    );
    normalized['expenseAccountId'] = toInt(
      json['expenseAccountId'] ?? json['expense_account_id'],
    );
    normalized['sourceAccountId'] = toInt(
      json['sourceAccountId'] ?? json['source_account_id'],
    );
    normalized['amount'] = toDouble(json['amount']);
    normalized['hasAttachment'] = toBool(
      json['hasAttachment'] ?? json['has_attachment'],
    );
    normalized['status'] = json['status'] ?? 'pending';
    normalized['approvedBy'] = toIntOrNull(
      json['approvedBy'] ?? json['approved_by'],
    );
    normalized['journalEntryId'] = toIntOrNull(
      json['journalEntryId'] ?? json['journal_entry_id'],
    );
    normalized['isPending'] = toBool(json['isPending'] ?? json['is_pending']);
    normalized['isApproved'] = toBool(
      json['isApproved'] ?? json['is_approved'],
    );
    normalized['isRejected'] = toBool(
      json['isRejected'] ?? json['is_rejected'],
    );

    return normalized;
  }
}

extension ExpenseModelX on ExpenseModel {
  Expense toEntity() => Expense(
    id: id,
    code: code,
    outletId: outletId,
    userId: userId,
    employeeId: employeeId,
    expenseAccountId: expenseAccountId,
    sourceAccountId: sourceAccountId,
    amount: amount,
    date: date,
    description: description,
    attachment: attachment,
    attachmentUrl: attachmentUrl,
    hasAttachment: hasAttachment,
    status: status,
    approvedBy: approvedBy,
    approvedAt: approvedAt,
    rejectionReason: rejectionReason,
    journalEntryId: journalEntryId,
    createdAt: createdAt,
    updatedAt: updatedAt,
    deletedAt: deletedAt,
    formattedAmount: formattedAmount,
    formattedDate: formattedDate,
    statusLabel: statusLabel,
    statusColor: statusColor,
    isPending: isPending,
    isApproved: isApproved,
    isRejected: isRejected,
    canBeApproved: canBeApproved,
    canBeRejected: canBeRejected,
    canBeCancelled: canBeCancelled,
    outlet: outlet,
    employee: employee,
    user: user,
    expenseAccount: expenseAccount,
    sourceAccount: sourceAccount,
    approver: approver,
    journalEntry: journalEntry,
  );
}
