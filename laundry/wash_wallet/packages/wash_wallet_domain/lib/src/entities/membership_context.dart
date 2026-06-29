import 'package:equatable/equatable.dart';

class MembershipContext extends Equatable {
  final int membershipContractId;
  final String membershipPlanName;
  final double discountPercentage;
  final String? expiredAt;

  const MembershipContext({
    required this.membershipContractId,
    required this.membershipPlanName,
    required this.discountPercentage,
    this.expiredAt,
  });

  factory MembershipContext.fromModel(dynamic model) {
    return MembershipContext(
      membershipContractId: model.membershipContractId,
      membershipPlanName: model.membershipPlanName,
      discountPercentage: model.discountPercentage,
      expiredAt: model.expiredAt,
    );
  }

  @override
  List<Object?> get props => [
    membershipContractId,
    membershipPlanName,
    discountPercentage,
    expiredAt,
  ];
}
