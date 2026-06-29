import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../entities/courier_schedule.dart';
import '../repositories/courier_schedule_repository.dart';

class GetAllUsecase {
  final CourierScheduleRepository _repository;

  GetAllUsecase(this._repository);

  Future<Result<CourierScheduleData>> call({
    required int outletId,
    String? dayOfWeek,
    String? type,
    String? date,
  }) {
    return _repository.getAll(
      outletId: outletId,
      dayOfWeek: dayOfWeek,
      type: type,
      date: date,
    );
  }
}
