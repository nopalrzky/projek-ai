import 'package:equatable/equatable.dart';

class Expense extends Equatable {
  final int id;
  final String code;
  final int outletId;
  final int? userId;
  final int? employeeId;
  final int expenseAccountId;
  final int sourceAccountId;
  final double amount;
  final String? date;
  final String? description;
  final String? attachment;
  final String? attachmentUrl;
  final bool hasAttachment;
  final String status;
  final int? approvedBy;
  final String? approvedAt;
  final String? rejectionReason;
  final int? journalEntryId;
  final String? createdAt;
  final String? updatedAt;
  final String? deletedAt;
  final String? formattedAmount;
  final String? formattedDate;
  final String? statusLabel;
  final String? statusColor;
  final bool isPending;
  final bool isApproved;
  final bool isRejected;
  final bool canBeApproved;
  final bool canBeRejected;
  final bool canBeCancelled;
  final Map<String, dynamic>? outlet;
  final Map<String, dynamic>? employee;
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? expenseAccount;
  final Map<String, dynamic>? sourceAccount;
  final Map<String, dynamic>? approver;
  final Map<String, dynamic>? journalEntry;

  const Expense({
    required this.id,
    required this.code,
    required this.outletId,
    this.userId,
    this.employeeId,
    required this.expenseAccountId,
    required this.sourceAccountId,
    required this.amount,
    this.date,
    this.description,
    this.attachment,
    this.attachmentUrl,
    this.hasAttachment = false,
    required this.status,
    this.approvedBy,
    this.approvedAt,
    this.rejectionReason,
    this.journalEntryId,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.formattedAmount,
    this.formattedDate,
    this.statusLabel,
    this.statusColor,
    this.isPending = false,
    this.isApproved = false,
    this.isRejected = false,
    this.canBeApproved = false,
    this.canBeRejected = false,
    this.canBeCancelled = false,
    this.outlet,
    this.employee,
    this.user,
    this.expenseAccount,
    this.sourceAccount,
    this.approver,
    this.journalEntry,
  });

  String? get employeeName => employee?['name'] as String?;
  String? get expenseAccountName => expenseAccount?['name'] as String?;

  factory Expense.fromModel(dynamic model) {
    return Expense(
      id: model.id,
      code: model.code,
      outletId: model.outletId,
      userId: model.userId,
      employeeId: model.employeeId,
      expenseAccountId: model.expenseAccountId,
      sourceAccountId: model.sourceAccountId,
      amount: model.amount,
      date: model.date,
      description: model.description,
      attachment: model.attachment,
      attachmentUrl: model.attachmentUrl,
      hasAttachment: model.hasAttachment,
      status: model.status,
      approvedBy: model.approvedBy,
      approvedAt: model.approvedAt,
      rejectionReason: model.rejectionReason,
      journalEntryId: model.journalEntryId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
      formattedAmount: model.formattedAmount,
      formattedDate: model.formattedDate,
      statusLabel: model.statusLabel,
      statusColor: model.statusColor,
      isPending: model.isPending,
      isApproved: model.isApproved,
      isRejected: model.isRejected,
      canBeApproved: model.canBeApproved,
      canBeRejected: model.canBeRejected,
      canBeCancelled: model.canBeCancelled,
      outlet: model.outlet,
      employee: model.employee,
      user: model.user,
      expenseAccount: model.expenseAccount,
      sourceAccount: model.sourceAccount,
      approver: model.approver,
      journalEntry: model.journalEntry,
    );
  }

  @override
  List<Object?> get props => [
    id,
    code,
    outletId,
    userId,
    employeeId,
    expenseAccountId,
    sourceAccountId,
    amount,
    date,
    description,
    attachment,
    attachmentUrl,
    hasAttachment,
    status,
    approvedBy,
    approvedAt,
    rejectionReason,
    journalEntryId,
    createdAt,
    updatedAt,
    deletedAt,
    formattedAmount,
    formattedDate,
    statusLabel,
    statusColor,
    isPending,
    isApproved,
    isRejected,
    canBeApproved,
    canBeRejected,
    canBeCancelled,
    outlet,
    employee,
    user,
    expenseAccount,
    sourceAccount,
    approver,
    journalEntry,
  ];
}
