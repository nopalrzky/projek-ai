import 'package:freezed_annotation/freezed_annotation.dart';

import 'package:wash_wallet_domain/wash_wallet_domain.dart';

part 'priority_order_model.freezed.dart';
part 'priority_order_model.g.dart';

@freezed
class PriorityOrderModel with _$PriorityOrderModel {
  const factory PriorityOrderModel({
    required int orderId,
    required String invoice,
    required String customerName,
    required String status,
    String? deadline,
  }) = _PriorityOrderModel;

  const PriorityOrderModel._();

  factory PriorityOrderModel.fromJson(Map<String, dynamic> json) =>
      _$PriorityOrderModelFromJson(json);

  PriorityOrder toEntity() => PriorityOrder(
    orderId: orderId,
    invoice: invoice,
    customerName: customerName,
    status: status,
    deadline: deadline,
  );

  factory PriorityOrderModel.fromEntity(PriorityOrder entity) =>
      PriorityOrderModel(
        orderId: entity.orderId,
        invoice: entity.invoice,
        customerName: entity.customerName,
        status: entity.status,
        deadline: entity.deadline,
      );
}
