import 'package:equatable/equatable.dart';

class Deposit extends Equatable {
  final int id;
  final String code;
  final int ownerId;
  final int outletId;
  final int? cashierId;
  final int? sourceAccountId;
  final int? destinationAccountId;
  final double amount;
  final String? formattedAmount;
  final String? notes;
  final String? attachmentPath;
  final String? attachmentUrl;
  final String status;
  final String statusLabel;
  final String statusColor;
  final int? approvedBy;
  final String? approvedAt;
  final String? approvedAtFormatted;
  final String? rejectionReason;
  final int? journalEntryId;
  final String createdAt;
  final String updatedAt;
  final String? createdAtFormatted;
  final String? createdAtHuman;
  final Map<String, dynamic>? cashier;
  final Map<String, dynamic>? outlet;
  final Map<String, dynamic>? sourceAccount;
  final Map<String, dynamic>? destinationAccount;
  final Map<String, dynamic>? approvedByUser;
  final Map<String, dynamic>? journalEntry;

  const Deposit({
    required this.id,
    required this.code,
    required this.ownerId,
    required this.outletId,
    this.cashierId,
    this.sourceAccountId,
    this.destinationAccountId,
    required this.amount,
    this.formattedAmount,
    this.notes,
    this.attachmentPath,
    this.attachmentUrl,
    required this.status,
    this.statusLabel = '',
    this.statusColor = '',
    this.approvedBy,
    this.approvedAt,
    this.approvedAtFormatted,
    this.rejectionReason,
    this.journalEntryId,
    required this.createdAt,
    required this.updatedAt,
    this.createdAtFormatted,
    this.createdAtHuman,
    this.cashier,
    this.outlet,
    this.sourceAccount,
    this.destinationAccount,
    this.approvedByUser,
    this.journalEntry,
  });

  String? get cashierName => cashier?['name'] as String?;

  factory Deposit.fromModel(dynamic model) {
    return Deposit(
      id: model.id,
      code: model.code,
      ownerId: model.ownerId,
      outletId: model.outletId,
      cashierId: model.cashierId,
      sourceAccountId: model.sourceAccountId,
      destinationAccountId: model.destinationAccountId,
      amount: model.amount,
      formattedAmount: model.formattedAmount,
      notes: model.notes,
      attachmentPath: model.attachmentPath,
      attachmentUrl: model.attachmentUrl,
      status: model.status,
      statusLabel: model.statusLabel,
      statusColor: model.statusColor,
      approvedBy: model.approvedBy,
      approvedAt: model.approvedAt,
      approvedAtFormatted: model.approvedAtFormatted,
      rejectionReason: model.rejectionReason,
      journalEntryId: model.journalEntryId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      createdAtFormatted: model.createdAtFormatted,
      createdAtHuman: model.createdAtHuman,
      cashier: model.cashier,
      outlet: model.outlet,
      sourceAccount: model.sourceAccount,
      destinationAccount: model.destinationAccount,
      approvedByUser: model.approvedByUser,
      journalEntry: model.journalEntry,
    );
  }

  @override
  List<Object?> get props => [
    id,
    code,
    ownerId,
    outletId,
    cashierId,
    sourceAccountId,
    destinationAccountId,
    amount,
    formattedAmount,
    notes,
    attachmentPath,
    attachmentUrl,
    status,
    statusLabel,
    statusColor,
    approvedBy,
    approvedAt,
    approvedAtFormatted,
    rejectionReason,
    journalEntryId,
    createdAt,
    updatedAt,
    createdAtFormatted,
    createdAtHuman,
    cashier,
    outlet,
    sourceAccount,
    destinationAccount,
    approvedByUser,
    journalEntry,
  ];
}
