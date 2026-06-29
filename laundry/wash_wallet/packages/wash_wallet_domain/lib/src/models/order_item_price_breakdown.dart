import 'package:equatable/equatable.dart';

class OrderItemPriceBreakdown extends Equatable {
  final int laundryServiceId;
  final String laundryServiceName;
  final double unitPrice;
  final double totalQuantity;
  final double quotaCoveredQuantity;
  final double payableQuantity;
  final double subtotalBeforeDiscount;
  final double quotaDiscountAmount;
  final double membershipDiscountAmount;
  final double totalAmount;

  const OrderItemPriceBreakdown({
    required this.laundryServiceId,
    required this.laundryServiceName,
    required this.unitPrice,
    required this.totalQuantity,
    required this.quotaCoveredQuantity,
    required this.payableQuantity,
    required this.subtotalBeforeDiscount,
    required this.quotaDiscountAmount,
    required this.membershipDiscountAmount,
    required this.totalAmount,
  });

  bool get hasQuotaDiscount => quotaCoveredQuantity > 0;
  bool get hasMembershipDiscount => membershipDiscountAmount > 0;
  double get totalDiscount => quotaDiscountAmount + membershipDiscountAmount;

  @override
  List<Object?> get props => [
    laundryServiceId,
    laundryServiceName,
    unitPrice,
    totalQuantity,
    quotaCoveredQuantity,
    payableQuantity,
    subtotalBeforeDiscount,
    quotaDiscountAmount,
    membershipDiscountAmount,
    totalAmount,
  ];
}
