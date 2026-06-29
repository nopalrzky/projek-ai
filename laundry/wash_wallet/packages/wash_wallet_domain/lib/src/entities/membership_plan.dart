import 'package:equatable/equatable.dart';

class MembershipPlan extends Equatable {
  final int id;
  final int outletId;
  final String name;
  final double price;
  final int durationDays;
  final bool isActive;
  final double discountPercentage;
  final String? description;
  final int? level;
  final String? createdAt;
  final String? updatedAt;
  final int membershipContractsCount;

  const MembershipPlan({
    required this.id,
    required this.outletId,
    required this.name,
    required this.price,
    required this.durationDays,
    required this.isActive,
    required this.discountPercentage,
    this.description,
    this.level,
    this.createdAt,
    this.updatedAt,
    this.membershipContractsCount = 0,
  });

  factory MembershipPlan.fromModel(dynamic model) {
    return MembershipPlan(
      id: model.id,
      outletId: model.outletId,
      name: model.name,
      price: model.price,
      durationDays: model.durationDays,
      isActive: model.isActive,
      discountPercentage: model.discountPercentage,
      description: model.description,
      level: model.level,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      membershipContractsCount: model.membershipContractsCount,
    );
  }

  @override
  List<Object?> get props => [
    id,
    outletId,
    name,
    price,
    durationDays,
    isActive,
    discountPercentage,
    description,
    level,
    createdAt,
    updatedAt,
    membershipContractsCount,
  ];
}
