import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../repositories/order_repository.dart';
import '../entities/schedule_delivery_params.dart';

class ScheduleDeliveryUseCase {
  final OrderRepository repository;

  ScheduleDeliveryUseCase(this.repository);

  Future<Result<Order>> call(ScheduleDeliveryParams params) {
    return repository.scheduleDelivery(params);
  }
}
