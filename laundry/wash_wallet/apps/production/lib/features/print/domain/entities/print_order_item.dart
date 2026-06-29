import 'package:equatable/equatable.dart';

class PrintOrderItem extends Equatable {
  final String laundryServiceName;
  final double quantity;
  final String unitName;
  final double unitPrice;
  final double totalAmount;

  const PrintOrderItem({
    required this.laundryServiceName,
    required this.quantity,
    required this.unitName,
    required this.unitPrice,
    required this.totalAmount,
  });

  @override
  List<Object?> get props => [
    laundryServiceName,
    quantity,
    unitName,
    unitPrice,
    totalAmount,
  ];
}
