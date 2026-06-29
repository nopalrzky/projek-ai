import 'package:equatable/equatable.dart';
import 'position_access.dart';

class OutletAccess extends Equatable {
  final int outletId;
  final String outletName;
  final List<PositionAccess> positions;

  const OutletAccess({
    required this.outletId,
    required this.outletName,
    required this.positions,
  });

  List<String> get permissions =>
      positions.expand((p) => p.permissions).toSet().toList();

  @override
  List<Object?> get props => [outletId, outletName, positions];
}
