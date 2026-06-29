import 'package:equatable/equatable.dart';

class Account extends Equatable {
  final int id;
  final int ownerId;
  final int? outletId;
  final int? parentId;
  final String code;
  final String name;
  final String? slug;
  final String type;
  final String? subtype;
  final String? accountRole;
  final int level;
  final bool isSystem;
  final bool isTransactional;
  final bool isActive;
  final double balance;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Account({
    required this.id,
    required this.ownerId,
    this.outletId,
    this.parentId,
    required this.code,
    required this.name,
    this.slug,
    required this.type,
    this.subtype,
    this.accountRole,
    required this.level,
    this.isSystem = false,
    this.isTransactional = true,
    this.isActive = true,
    this.balance = 0.0,
    this.createdAt,
    this.updatedAt,
  });

  factory Account.fromModel(dynamic model) {
    return Account(
      id: model.id,
      ownerId: model.ownerId,
      outletId: model.outletId,
      parentId: model.parentId,
      code: model.code,
      name: model.name,
      slug: model.slug,
      type: model.type,
      subtype: model.subtype,
      accountRole: model.accountRole,
      level: model.level,
      isSystem: model.isSystem,
      isTransactional: model.isTransactional,
      isActive: model.isActive,
      balance: model.balance,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    ownerId,
    outletId,
    parentId,
    code,
    name,
    slug,
    type,
    subtype,
    accountRole,
    level,
    isSystem,
    isTransactional,
    isActive,
    balance,
    createdAt,
    updatedAt,
  ];
}
