import 'package:equatable/equatable.dart';
import 'package:intl/intl.dart';
import 'print_order_item.dart';
import 'print_coin_info.dart';

class PrintInfo extends Equatable {
  final int orderId;
  final String orderNumber;
  final DateTime orderDate;
  final DateTime? estimatedCompletion;
  final String paymentStatus;
  final double subtotal;
  final double discountAmount;
  final double taxAmount;
  final double totalAmount;
  final double paidAmount;
  final double remainingAmount;
  final String customerName;
  final String customerPhone;
  final String outletName;
  final String outletAddress;
  final List<PrintOrderItem> orderItems;
  final String cashierName;
  final PrintCoinInfo receipt;
  final PrintCoinInfo label;

  const PrintInfo({
    required this.orderId,
    required this.orderNumber,
    required this.orderDate,
    this.estimatedCompletion,
    required this.paymentStatus,
    required this.subtotal,
    required this.discountAmount,
    required this.taxAmount,
    required this.totalAmount,
    required this.paidAmount,
    required this.remainingAmount,
    required this.customerName,
    required this.customerPhone,
    required this.outletName,
    required this.outletAddress,
    required this.orderItems,
    required this.cashierName,
    required this.receipt,
    required this.label,
  });

  String get paymentStatusLabel {
    switch (paymentStatus) {
      case 'paid':
        return 'Lunas';
      case 'partial':
        return 'Bayar Sebagian';
      case 'paid_by_package':
        return 'Ditanggung Paket';
      default:
        return 'Belum Dibayar';
    }
  }

  String get formattedOrderDate =>
      DateFormat('EEEE, dd MMM yyyy', 'id_ID').format(orderDate.toLocal());

  String? get formattedEstimatedCompletion => estimatedCompletion != null
      ? DateFormat(
          'EEEE, dd MMM yyyy',
          'id_ID',
        ).format(estimatedCompletion!.toLocal())
      : null;

  @override
  List<Object?> get props => [orderId, orderNumber];
}
