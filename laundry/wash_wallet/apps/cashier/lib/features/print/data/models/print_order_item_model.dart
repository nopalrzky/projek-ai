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

  factory PrintOrderItemModel.fromJson(Map<String, dynamic> json) {
    String readString(List<String> keys, {String fallback = ''}) {
      for (final key in keys) {
        final value = json[key];
        if (value is String) {
          return value;
        }
      }

      return fallback;
    }

    double readDouble(List<String> keys) {
      for (final key in keys) {
        final value = json[key];
        if (value is num) {
          return value.toDouble();
        }
      }

      return 0;
    }

    return PrintOrderItemModel(
      laundryServiceName: readString([
        'laundryServiceName',
        'laundry_service_name',
      ], fallback: 'Service'),
      quantity: readDouble(['quantity']),
      unitName: readString(['unitName', 'unit_name']),
      unitPrice: readDouble(['unitPrice', 'unit_price']),
      totalAmount: readDouble(['totalAmount', 'total_amount']),
    );
  }

  PrintOrderItem toEntity() => PrintOrderItem(
    laundryServiceName: laundryServiceName,
    quantity: quantity,
    unitName: unitName,
    unitPrice: unitPrice,
    totalAmount: totalAmount,
  );
}
