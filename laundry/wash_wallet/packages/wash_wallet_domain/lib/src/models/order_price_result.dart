import 'package:equatable/equatable.dart';
import 'order_item_price_breakdown.dart';

class OrderPriceResult extends Equatable {
  final double subtotal;
  final double totalQuotaDiscount;
  final double totalMembershipDiscount;
  final double total;
  final List<OrderItemPriceBreakdown> itemBreakdowns;

  const OrderPriceResult({
    required this.subtotal,
    required this.totalQuotaDiscount,
    required this.totalMembershipDiscount,
    required this.total,
    required this.itemBreakdowns,
  });

  double get totalDiscount => totalQuotaDiscount + totalMembershipDiscount;
  bool get hasQuotaDiscount => totalQuotaDiscount > 0;
  bool get hasMembershipDiscount => totalMembershipDiscount > 0;
  bool get hasAnyDiscount => totalDiscount > 0;

  @override
  List<Object?> get props => [
    subtotal,
    totalQuotaDiscount,
    totalMembershipDiscount,
    total,
    itemBreakdowns,
  ];
}
