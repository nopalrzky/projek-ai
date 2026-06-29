import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

part 'process_queue_model.freezed.dart';
part 'process_queue_model.g.dart';

@freezed
class ProcessQueueModel with _$ProcessQueueModel {
  const factory ProcessQueueModel({
    required int processId,
    required String processName,
    required int totalOrders,
  }) = _ProcessQueueModel;

  const ProcessQueueModel._();

  factory ProcessQueueModel.fromJson(Map<String, dynamic> json) =>
      _$ProcessQueueModelFromJson(json);

  ProcessQueue toEntity() => ProcessQueue(
    processId: processId,
    processName: processName,
    totalOrders: totalOrders,
  );

  factory ProcessQueueModel.fromEntity(ProcessQueue entity) =>
      ProcessQueueModel(
        processId: entity.processId,
        processName: entity.processName,
        totalOrders: entity.totalOrders,
      );
}
