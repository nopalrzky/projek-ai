import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/courier_schedule.dart';

abstract class CourierScheduleRepository {
  Future<Result<CourierScheduleData>> getAll({
    required int outletId,
    String? dayOfWeek,
    String? type,
    String? date,
  });
}
