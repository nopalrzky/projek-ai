import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/print_info.dart';
import 'print_order_item_model.dart';
import 'print_coin_info_model.dart';

part 'print_info_model.freezed.dart';

@freezed
class PrintInfoModel with _$PrintInfoModel {
  const factory PrintInfoModel({
    required int orderId,
    required String orderNumber,
    required DateTime orderDate,
    DateTime? estimatedCompletion,
    required String paymentStatus,
    required double subtotal,
    required double discountAmount,
    required double taxAmount,
    required double totalAmount,
    required double paidAmount,
    required double remainingAmount,
    required String customerName,
    required String customerPhone,
    required String outletName,
    required String outletAddress,
    required List<PrintOrderItemModel> orderItems,
    required String cashierName,
    required PrintCoinInfoModel receipt,
    required PrintCoinInfoModel label,
  }) = _PrintInfoModel;

  const PrintInfoModel._();

  factory PrintInfoModel.fromJson(Map<String, dynamic> json) {
    final order = json['order'] as Map<String, dynamic>;
    final customer = json['customer'] as Map<String, dynamic>;
    final outlet = json['outlet'] as Map<String, dynamic>;
    final rawItems = (json['order_items'] as List<dynamic>?) ?? [];

    return PrintInfoModel(
      orderId: order['id'] as int,
      orderNumber: order['order_number'] as String,
      orderDate: DateTime.parse(order['order_date'] as String),
      estimatedCompletion: order['estimated_completion'] != null
          ? DateTime.parse(order['estimated_completion'] as String)
          : null,
      paymentStatus: order['payment_status'] as String,
      subtotal: (order['subtotal'] as num).toDouble(),
      discountAmount: (order['discount_amount'] as num).toDouble(),
      taxAmount: (order['tax_amount'] as num).toDouble(),
      totalAmount: (order['total_amount'] as num).toDouble(),
      paidAmount: (order['paid_amount'] as num).toDouble(),
      remainingAmount: (order['remaining_amount'] as num).toDouble(),
      customerName: customer['name'] as String,
      customerPhone: customer['phone'] as String? ?? '-',
      outletName: outlet['name'] as String,
      outletAddress: outlet['address'] as String? ?? '-',
      orderItems: rawItems
          .map((e) => PrintOrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      cashierName: json['cashier_name'] as String,
      receipt: PrintCoinInfoModel.fromJson(
        json['print_receipt'] as Map<String, dynamic>,
      ),
      label: PrintCoinInfoModel.fromJson(
        json['print_label'] as Map<String, dynamic>,
      ),
    );
  }

  PrintInfo toEntity() => PrintInfo(
    orderId: orderId,
    orderNumber: orderNumber,
    orderDate: orderDate,
    estimatedCompletion: estimatedCompletion,
    paymentStatus: paymentStatus,
    subtotal: subtotal,
    discountAmount: discountAmount,
    taxAmount: taxAmount,
    totalAmount: totalAmount,
    paidAmount: paidAmount,
    remainingAmount: remainingAmount,
    customerName: customerName,
    customerPhone: customerPhone,
    outletName: outletName,
    outletAddress: outletAddress,
    orderItems: orderItems.map((e) => e.toEntity()).toList(),
    cashierName: cashierName,
    receipt: receipt.toEntity(),
    label: label.toEntity(),
  );
}
