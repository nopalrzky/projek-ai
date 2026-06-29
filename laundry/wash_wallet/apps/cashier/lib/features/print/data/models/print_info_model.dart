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
    final rawItems =
        (json['orderItems'] as List<dynamic>?) ??
        (json['order_items'] as List<dynamic>?) ??
        [];

    String readString(
      Map<String, dynamic> source,
      List<String> keys,
      String fallback,
    ) {
      for (final key in keys) {
        final value = source[key];
        if (value is String && value.isNotEmpty) {
          return value;
        }
      }

      return fallback;
    }

    double readDouble(Map<String, dynamic> source, List<String> keys) {
      for (final key in keys) {
        final value = source[key];
        if (value is num) {
          return value.toDouble();
        }
      }

      return 0;
    }

    return PrintInfoModel(
      orderId: order['id'] as int,
      orderNumber: readString(order, ['orderNumber', 'order_number'], '-'),
      orderDate: DateTime.parse(
        readString(order, [
          'orderDate',
          'order_date',
        ], DateTime.now().toIso8601String()),
      ),
      estimatedCompletion: order['estimatedCompletion'] != null
          ? DateTime.parse(order['estimatedCompletion'] as String)
          : order['estimated_completion'] != null
          ? DateTime.parse(order['estimated_completion'] as String)
          : null,
      paymentStatus: readString(order, [
        'paymentStatus',
        'payment_status',
      ], '-'),
      subtotal: readDouble(order, ['subtotal']),
      discountAmount: readDouble(order, ['discountAmount', 'discount_amount']),
      taxAmount: readDouble(order, ['taxAmount', 'tax_amount']),
      totalAmount: readDouble(order, ['totalAmount', 'total_amount']),
      paidAmount: readDouble(order, ['paidAmount', 'paid_amount']),
      remainingAmount: readDouble(order, [
        'remainingAmount',
        'remaining_amount',
      ]),
      customerName: readString(customer, ['name'], 'Pelanggan'),
      customerPhone: customer['phone'] as String? ?? '-',
      outletName: readString(outlet, ['name'], 'Outlet'),
      outletAddress: outlet['address'] as String? ?? '-',
      orderItems: rawItems
          .map((e) => PrintOrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      cashierName: readString(json, ['cashierName', 'cashier_name'], 'Kasir'),
      receipt: PrintCoinInfoModel.fromJson(
        (json['printReceipt'] as Map<String, dynamic>?) ??
            (json['print_receipt'] as Map<String, dynamic>),
      ),
      label: PrintCoinInfoModel.fromJson(
        (json['printLabel'] as Map<String, dynamic>?) ??
            (json['print_label'] as Map<String, dynamic>),
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
