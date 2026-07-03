import 'package:freezed_annotation/freezed_annotation.dart';
import '../entities/order_review.dart';

part 'order_review_model.freezed.dart';
part 'order_review_model.g.dart';

@freezed
class OrderReviewModel with _$OrderReviewModel {
  const OrderReviewModel._(); // Required for custom methods

  const factory OrderReviewModel({
    required int id,
    required int orderId,
    required int outletId,
    required int rating,
    String? comment,
    String? maskedName,
    DateTime? createdAt,
    String? formattedCreatedAt,
  }) = _OrderReviewModel;

  factory OrderReviewModel.fromJson(Map<String, dynamic> json) =>
      _$OrderReviewModelFromJson(json);

  factory OrderReviewModel.fromEntity(OrderReview entity) => OrderReviewModel(
    id: entity.id,
    orderId: entity.orderId,
    outletId: entity.outletId,
    rating: entity.rating,
    comment: entity.comment,
    maskedName: entity.maskedName,
    createdAt: entity.createdAt,
    formattedCreatedAt: entity.formattedCreatedAt,
  );

  OrderReview toEntity() => OrderReview(
    id: id,
    orderId: orderId,
    outletId: outletId,
    rating: rating,
    comment: comment,
    maskedName: maskedName,
    createdAt: createdAt,
    formattedCreatedAt: formattedCreatedAt,
  );
}
