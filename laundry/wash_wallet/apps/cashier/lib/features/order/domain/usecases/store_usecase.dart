import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';

class StoreParams {
  final int customerId;
  final int employeeId;
  final int? sourceAccountId;
  final String? paymentMethod;
  final String paymentStatus;
  final double paidAmount;
  final String? notes;
  final DateTime? estimatedCompletion;
  final List<Map<String, dynamic>> orderItems;
  final String? clientRequestId;

  StoreParams({
    required this.customerId,
    required this.employeeId,
    this.sourceAccountId,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.paidAmount,
    this.notes,
    this.estimatedCompletion,
    required this.orderItems,
    this.clientRequestId,
  });

  Map<String, dynamic> toMap() {
    String? backendPaymentMethod = paymentMethod;
    if (paymentMethod == 'qris') {
      backendPaymentMethod = 'transfer';
    }

    return {
      'customerId': customerId,
      'employeeId': employeeId,
      'sourceAccountId': sourceAccountId,
      'paymentMethod': backendPaymentMethod,
      'paymentStatus': paymentStatus,
      'paidAmount': paidAmount,
      'notes': notes,
      'estimatedCompletion': estimatedCompletion?.toIso8601String(),
      'orderItems': orderItems,
      if (clientRequestId != null) 'client_request_id': clientRequestId,
    };
  }
}

class StoreUsecase {
  final OrderRepository _repository;

  StoreUsecase(this._repository);

  Future<Result<Order>> call(StoreParams params) async {
    return await _repository.store(params.toMap());
  }
}
