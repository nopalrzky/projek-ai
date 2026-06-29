import 'package:equatable/equatable.dart';

class PositionAccess extends Equatable {
  final int positionId;
  final String positionName;
  final String slug;
  final List<String> permissions;

  const PositionAccess({
    required this.positionId,
    required this.positionName,
    required this.slug,
    required this.permissions,
  });

  @override
  List<Object?> get props => [positionId, positionName, slug, permissions];
}
