import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/active_order.dart';

part 'active_order_model.freezed.dart';
part 'active_order_model.g.dart';

@freezed
class ActiveOrderModel with _$ActiveOrderModel {
  const factory ActiveOrderModel({
    required int orderId,
    required String invoice,
    required String customerName,
    required String serviceName,
    required String quantity,
    required String currentProcess,
    String? startedAt,
  }) = _ActiveOrderModel;

  const ActiveOrderModel._();

  factory ActiveOrderModel.fromJson(Map<String, dynamic> json) =>
      _$ActiveOrderModelFromJson(json);

  ActiveOrder toEntity() => ActiveOrder(
    orderId: orderId,
    invoice: invoice,
    customerName: customerName,
    serviceName: serviceName,
    quantity: quantity,
    currentProcess: currentProcess,
    startedAt: startedAt,
  );

  factory ActiveOrderModel.fromEntity(ActiveOrder entity) => ActiveOrderModel(
    orderId: entity.orderId,
    invoice: entity.invoice,
    customerName: entity.customerName,
    serviceName: entity.serviceName,
    quantity: entity.quantity,
    currentProcess: entity.currentProcess,
    startedAt: entity.startedAt,
  );
}
