import 'package:equatable/equatable.dart';

class SubmitReviewParams extends Equatable {
  final int orderId;
  final int rating;
  final String? comment;

  const SubmitReviewParams({
    required this.orderId,
    required this.rating,
    this.comment,
  });

  @override
  List<Object?> get props => [orderId, rating, comment];
}
