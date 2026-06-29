import 'package:equatable/equatable.dart';

class PettyCash extends Equatable {
  final int id;
  final String? code;
  final int? ownerId;
  final int? outletId;
  final int? cashierId;
  final int? sourceAccountId;
  final double amount;
  final String? formattedAmount;
  final String? description;
  final String? requestDate;
  final String? requestDateFormatted;
  final String status;
  final String? statusLabel;
  final String? statusColor;
  final int? approvedBy;
  final String? approvedAt;
  final String? approvedAtFormatted;
  final String? rejectionReason;
  final int? journalEntryId;
  final String? createdAt;
  final String? updatedAt;
  final String? createdAtFormatted;
  final String? createdAtHuman;
  final Map<String, dynamic>? cashier;
  final Map<String, dynamic>? outlet;
  final Map<String, dynamic>? sourceAccount;
  final Map<String, dynamic>? approvedByUser;
  final Map<String, dynamic>? journalEntry;

  const PettyCash({
    required this.id,
    this.code,
    this.ownerId,
    this.outletId,
    this.cashierId,
    this.sourceAccountId,
    required this.amount,
    this.formattedAmount,
    this.description,
    this.requestDate,
    this.requestDateFormatted,
    required this.status,
    this.statusLabel,
    this.statusColor,
    this.approvedBy,
    this.approvedAt,
    this.approvedAtFormatted,
    this.rejectionReason,
    this.journalEntryId,
    this.createdAt,
    this.updatedAt,
    this.createdAtFormatted,
    this.createdAtHuman,
    this.cashier,
    this.outlet,
    this.sourceAccount,
    this.approvedByUser,
    this.journalEntry,
  });

  factory PettyCash.fromModel(dynamic model) {
    return PettyCash(
      id: model.id,
      code: model.code,
      ownerId: model.ownerId,
      outletId: model.outletId,
      cashierId: model.cashierId,
      sourceAccountId: model.sourceAccountId,
      amount: model.amount,
      formattedAmount: model.formattedAmount,
      description: model.description,
      requestDate: model.requestDate,
      requestDateFormatted: model.requestDateFormatted,
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
    amount,
    formattedAmount,
    description,
    requestDate,
    requestDateFormatted,
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
    approvedByUser,
    journalEntry,
  ];
}
