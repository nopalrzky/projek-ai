import 'package:equatable/equatable.dart';
import 'customer.dart';
import 'membership_context.dart';
import 'quota_context.dart';

class OrderContext extends Equatable {
  final Customer customer;
  final MembershipContext? membership;
  final List<QuotaContext> quotas;

  const OrderContext({
    required this.customer,
    this.membership,
    required this.quotas,
  });

  factory OrderContext.fromModel(dynamic model) {
    return OrderContext(
      customer: Customer.fromModel(model.customer),
      membership: model.membership != null
          ? MembershipContext.fromModel(model.membership)
          : null,
      quotas: (model.quotas as List)
          .map((e) => QuotaContext.fromModel(e))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [customer, membership, quotas];
}
