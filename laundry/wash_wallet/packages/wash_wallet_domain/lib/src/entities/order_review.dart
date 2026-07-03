import 'package:equatable/equatable.dart';

class OrderReview extends Equatable {
  final int id;
  final int orderId;
  final int outletId;
  final int rating;
  final String? comment;
  final String? maskedName;
  final DateTime? createdAt;
  final String? formattedCreatedAt;

  const OrderReview({
    required this.id,
    required this.orderId,
    required this.outletId,
    required this.rating,
    this.comment,
    this.maskedName,
    this.createdAt,
    this.formattedCreatedAt,
  });

  @override
  List<Object?> get props => [
    id,
    orderId,
    outletId,
    rating,
    comment,
    maskedName,
    createdAt,
    formattedCreatedAt,
  ];
}
