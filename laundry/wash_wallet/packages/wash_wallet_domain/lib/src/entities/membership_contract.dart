import 'package:equatable/equatable.dart';
import 'customer.dart';
import 'outlet.dart';
import 'membership_plan.dart';

class MembershipContract extends Equatable {
  final int id;
  final int customerId;
  final int outletId;
  final int membershipPlanId;
  final String? startAt;
  final String? expiredAt;
  final String status;
  final int? replacedById;
  final int? upgradeFromId;
  final double totalPaid;
  final String? formattedTotalPaid;
  final String? createdAt;
  final String? updatedAt;
  final Customer? customer;
  final Outlet? outlet;
  final MembershipPlan? membershipPlan;

  const MembershipContract({
    required this.id,
    required this.customerId,
    required this.outletId,
    required this.membershipPlanId,
    this.startAt,
    this.expiredAt,
    required this.status,
    this.replacedById,
    this.upgradeFromId,
    required this.totalPaid,
    this.formattedTotalPaid,
    this.createdAt,
    this.updatedAt,
    this.customer,
    this.outlet,
    this.membershipPlan,
  });

  factory MembershipContract.fromModel(dynamic model) {
    return MembershipContract(
      id: model.id,
      customerId: model.customerId,
      outletId: model.outletId,
      membershipPlanId: model.membershipPlanId,
      startAt: model.startAt,
      expiredAt: model.expiredAt,
      status: model.status,
      replacedById: model.replacedById,
      upgradeFromId: model.upgradeFromId,
      totalPaid: model.totalPaid,
      formattedTotalPaid: model.formattedTotalPaid,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      customer: model.customer != null
          ? Customer.fromModel(model.customer)
          : null,
      outlet: model.outlet != null ? Outlet.fromModel(model.outlet) : null,
      membershipPlan: model.membershipPlan != null
          ? MembershipPlan.fromModel(model.membershipPlan)
          : null,
    );
  }

  @override
  List<Object?> get props => [
    id,
    customerId,
    outletId,
    membershipPlanId,
    startAt,
    expiredAt,
    status,
    replacedById,
    upgradeFromId,
    totalPaid,
    formattedTotalPaid,
    createdAt,
    updatedAt,
    customer,
    outlet,
    membershipPlan,
  ];
}
