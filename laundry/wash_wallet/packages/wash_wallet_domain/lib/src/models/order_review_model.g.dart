// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_review_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OrderReviewModelImpl _$$OrderReviewModelImplFromJson(
  Map<String, dynamic> json,
) => _$OrderReviewModelImpl(
  id: (json['id'] as num).toInt(),
  orderId: (json['orderId'] as num).toInt(),
  outletId: (json['outletId'] as num).toInt(),
  rating: (json['rating'] as num).toInt(),
  comment: json['comment'] as String?,
  maskedName: json['maskedName'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  formattedCreatedAt: json['formattedCreatedAt'] as String?,
);

Map<String, dynamic> _$$OrderReviewModelImplToJson(
  _$OrderReviewModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'orderId': instance.orderId,
  'outletId': instance.outletId,
  'rating': instance.rating,
  'comment': instance.comment,
  'maskedName': instance.maskedName,
  'createdAt': instance.createdAt?.toIso8601String(),
  'formattedCreatedAt': instance.formattedCreatedAt,
};
