import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/print_order_item.dart';

part 'print_order_item_model.freezed.dart';
part 'print_order_item_model.g.dart';

@freezed
class PrintOrderItemModel with _$PrintOrderItemModel {
  const factory PrintOrderItemModel({
    required String laundryServiceName,
    required double quantity,
    required String unitName,
    required double unitPrice,
    required double totalAmount,
  }) = _PrintOrderItemModel;

  const PrintOrderItemModel._();

  factory PrintOrderItemModel.fromJson(Map<String, dynamic> json) =>
      _$PrintOrderItemModelFromJson(json);

  PrintOrderItem toEntity() => PrintOrderItem(
    laundryServiceName: laundryServiceName,
    quantity: quantity,
    unitName: unitName,
    unitPrice: unitPrice,
    totalAmount: totalAmount,
  );
}
