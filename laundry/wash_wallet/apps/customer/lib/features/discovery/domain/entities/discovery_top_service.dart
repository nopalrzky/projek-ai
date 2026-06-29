import 'package:equatable/equatable.dart';

class DiscoveryTopService extends Equatable {
  final int id;
  final int outletId;
  final String name;
  final String? thumbnailUrl;
  final double priceStartsFrom;
  final String? unitName;
  final String? unitSymbol;
  final bool isActive;
  final bool supportsCourier;

  const DiscoveryTopService({
    required this.id,
    required this.outletId,
    required this.name,
    this.thumbnailUrl,
    required this.priceStartsFrom,
    this.unitName,
    this.unitSymbol,
    required this.isActive,
    required this.supportsCourier,
  });

  @override
  List<Object?> get props => [
    id,
    outletId,
    name,
    thumbnailUrl,
    priceStartsFrom,
    unitName,
    unitSymbol,
    isActive,
    supportsCourier,
  ];
}
