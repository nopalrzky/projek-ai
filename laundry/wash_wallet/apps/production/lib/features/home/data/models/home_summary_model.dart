import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

part 'home_summary_model.freezed.dart';
part 'home_summary_model.g.dart';

@freezed
class HomeSummaryModel with _$HomeSummaryModel {
  const factory HomeSummaryModel({
    required int ordersToday,
    required int ordersInProgress,
    required int ordersReadyForPickup,
    required int ordersCompleted,
  }) = _HomeSummaryModel;

  const HomeSummaryModel._();

  factory HomeSummaryModel.fromJson(Map<String, dynamic> json) =>
      _$HomeSummaryModelFromJson(json);

  HomeSummary toEntity() => HomeSummary(
    ordersToday: ordersToday,
    ordersInProgress: ordersInProgress,
    ordersReadyForPickup: ordersReadyForPickup,
    ordersCompleted: ordersCompleted,
  );

  factory HomeSummaryModel.fromEntity(HomeSummary entity) => HomeSummaryModel(
    ordersToday: entity.ordersToday,
    ordersInProgress: entity.ordersInProgress,
    ordersReadyForPickup: entity.ordersReadyForPickup,
    ordersCompleted: entity.ordersCompleted,
  );
}
